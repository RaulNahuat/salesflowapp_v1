import { sequelize } from '../config/db.js';
import db from '../models/index.js';
import { cache, getCacheKey } from '../utils/cache.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const { Sale, SaleDetail, Product, Client, BusinessMember, User, ProductVariant, ReceiptToken } = db;

// Create and Save a new Sale
export const createSale = asyncHandler(async (req, res) => {
    // 🔒 SECURITY FIX: Isolation level para prevenir race conditions
    const t = await sequelize.transaction({
        isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
    });

    try {
        const { items, clientId, paymentMethod, notes, total } = req.body;
        const businessId = req.user.businessId;

        // Resolve Seller ID (BusinessMember)
        let sellerId = req.user.businessMemberId;
        if (!sellerId) {
            const member = await BusinessMember.findOne({
                where: { UserId: req.user.userId, BusinessId: businessId }
            });
            if (member) sellerId = member.id;
        }

        if (!sellerId) {
            if (t) await t.rollback();
            const error = new Error('No se pudo identificar al vendedor');
            error.status = 400;
            throw error;
        }

        // 1. Calculate Valid Total Server-Side
        let calculatedTotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId, {
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!product) throw new Error(`Producto no encontrado: ${item.name}`);
            if (product.BusinessId !== businessId) throw new Error(`Acceso denegado`);

            const unitPrice = parseFloat(product.sellingPrice);
            const subtotal = unitPrice * item.quantity;
            calculatedTotal += subtotal;

            let variant = null;
            if (item.variantId) {
                variant = await ProductVariant.findByPk(item.variantId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
                if (!variant) throw new Error(`Variante no encontrada: ${item.name}`);
                if (variant.stock < item.quantity) throw new Error(`Stock insuficiente para variante: ${item.name}`);
            } else {
                if (product.stock < item.quantity) throw new Error(`Stock insuficiente: ${product.name}`);
            }

            processedItems.push({ product, variant, quantity: item.quantity, unitPrice, subtotal });
        }

        const submittedTotal = parseFloat(total);
        if (Math.abs(submittedTotal - calculatedTotal) > 0.01) {
            console.warn('⚠️ SECURITY: Discrepancia de precio detectada');
            throw new Error(`Discrepancia de precios detectada.`);
        }

        const sale = await Sale.create({
            total: calculatedTotal,
            status: 'delivered',
            paymentMethod,
            notes,
            BusinessId: businessId,
            clientId: clientId || null,
            SellerId: sellerId
        }, { transaction: t });

        for (const item of processedItems) {
            if (item.variant) {
                await item.variant.decrement('stock', { by: item.quantity, transaction: t });
                await item.product.decrement('stock', { by: item.quantity, transaction: t });
                await SaleDetail.create({
                    SaleId: sale.id,
                    ProductId: item.product.id,
                    ProductVariantId: item.variant.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.subtotal
                }, { transaction: t });
            } else {
                await item.product.decrement('stock', { by: item.quantity, transaction: t });
                await SaleDetail.create({
                    SaleId: sale.id,
                    ProductId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.subtotal
                }, { transaction: t });
            }
        }

        await db.Payment.create({
            amount: calculatedTotal,
            method: paymentMethod,
            date: new Date(),
            SaleId: sale.id
        }, { transaction: t });

        await t.commit();
        cache.del(getCacheKey('products', businessId));

        // Generate receipt token
        let receiptTokenId = null;
        try {
            const clientName = clientId
                ? await Client.findByPk(clientId).then(c => c ? `${c.firstName} ${c.lastName}` : 'Cliente')
                : 'Cliente Casual';

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            const tokenEntry = await ReceiptToken.create({
                parameters: { clientName, total: calculatedTotal, saleId: sale.id, businessId },
                expiresAt
            });
            receiptTokenId = tokenEntry.id;
            await sale.update({ receiptTokenId });
        } catch (tokenError) {
            console.error('Error generating receipt token:', tokenError);
        }

        res.status(201).json({
            success: true,
            message: 'Venta registrada exitosamente',
            saleId: sale.id,
            receiptToken: receiptTokenId
        });

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        throw error;
    }
});

// Retrieve all Sales
export const getSales = asyncHandler(async (req, res) => {
    const businessId = req.user.businessId;
    const { limit = 20, offset = 0 } = req.query;

    const whereClause = { BusinessId: businessId };
    if (req.user.role === 'employee' && req.user.businessMemberId) {
        whereClause.SellerId = req.user.businessMemberId;
    }

    const sales = await Sale.findAll({
        where: whereClause,
        include: [
            { model: Client, attributes: ['id', 'firstName', 'lastName', 'phone', 'deletedAt'], paranoid: false },
            {
                model: BusinessMember,
                as: 'Seller',
                include: [{ model: User, attributes: ['firstName', 'lastName'] }]
            },
            {
                model: SaleDetail,
                include: [
                    { model: Product, attributes: ['name', 'deletedAt'], paranoid: false },
                    { model: ProductVariant, paranoid: false }
                ]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.json({
        success: true,
        count: sales.length,
        sales
    });
});

// Generate receipt token
export const generateReceiptToken = asyncHandler(async (req, res) => {
    const { saleId } = req.body;
    const businessId = req.user.businessId;

    const sale = await Sale.findOne({
        where: { id: saleId, BusinessId: businessId },
        include: [{ model: Client }]
    });

    if (!sale) {
        const error = new Error('Venta no encontrada');
        error.status = 404;
        throw error;
    }

    const clientName = sale.Client ? `${sale.Client.firstName} ${sale.Client.lastName}` : 'Cliente Casual';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const tokenEntry = await ReceiptToken.create({
        parameters: { clientName, total: sale.total, saleId, businessId },
        expiresAt
    });

    await sale.update({ receiptTokenId: tokenEntry.id });

    res.json({
        success: true,
        token: tokenEntry.id
    });
});

// Get receipt data for public view
export const getReceiptData = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const entry = await ReceiptToken.findByPk(token);

    if (!entry) {
        const error = new Error('Recibo no encontrado');
        error.status = 404;
        throw error;
    }

    if (new Date() > new Date(entry.expiresAt)) {
        const error = new Error('Este recibo ha expirado');
        error.status = 410;
        throw error;
    }

    await entry.increment('viewCount');
    await entry.update({ lastViewedAt: new Date() });

    const businessId = entry.parameters.businessId;
    const business = await db.Business.findByPk(businessId, {
        attributes: ['name', 'slug', 'logoURL', 'phone', 'email', 'address', 'returnPolicy', 'settings']
    });

    const saleId = entry.parameters.saleId;
    const sale = await db.Sale.findOne({
        where: { id: saleId, BusinessId: businessId },
        include: [
            {
                model: db.SaleDetail,
                include: [
                    { model: db.Product, paranoid: false },
                    { model: db.ProductVariant, paranoid: false }
                ]
            },
            { model: db.Client, paranoid: false }
        ]
    });

    if (!sale) {
        const error = new Error('Venta no encontrada');
        error.status = 404;
        throw error;
    }

    res.json({
        success: true,
        data: {
            clientName: entry.parameters.clientName,
            total: entry.parameters.total,
            sale: sale.toJSON(),
            business: business ? business.toJSON() : null,
            createdAt: sale.createdAt
        }
    });
});

// Get receipt history for dashboard
export const getReceiptHistory = asyncHandler(async (req, res) => {
    const businessId = req.user.businessId;
    const { limit = 50, offset = 0, clientName, startDate, endDate, minAmount, maxAmount } = req.query;

    const whereClause = {
        BusinessId: businessId,
        receiptTokenId: { [db.Sequelize.Op.ne]: null }
    };

    if (req.user.role === 'employee' && req.user.businessMemberId) {
        whereClause.SellerId = req.user.businessMemberId;
    }

    if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[db.Sequelize.Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[db.Sequelize.Op.lte] = new Date(endDate);
    }

    if (minAmount || maxAmount) {
        whereClause.total = {};
        if (minAmount) whereClause.total[db.Sequelize.Op.gte] = parseFloat(minAmount);
        if (maxAmount) whereClause.total[db.Sequelize.Op.lte] = parseFloat(maxAmount);
    }

    const sales = await db.Sale.findAll({
        where: whereClause,
        include: [{
            model: db.Client,
            paranoid: false,
            where: clientName ? {
                [db.Sequelize.Op.or]: [
                    { firstName: { [db.Sequelize.Op.like]: `%${clientName}%` } },
                    { lastName: { [db.Sequelize.Op.like]: `%${clientName}%` } }
                ]
            } : undefined,
            required: !!clientName
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    const tokenIds = sales.map(s => s.receiptTokenId).filter(Boolean);
    const tokens = await db.ReceiptToken.findAll({ where: { id: tokenIds } });
    const tokenMap = {};
    tokens.forEach(t => { tokenMap[t.id] = t; });

    const receipts = sales
        .filter(sale => tokenMap[sale.receiptTokenId])
        .map(sale => {
            const token = tokenMap[sale.receiptTokenId];
            return {
                id: sale.receiptTokenId,
                createdAt: sale.createdAt,
                viewCount: token.viewCount || 0,
                lastViewedAt: token.lastViewedAt,
                parameters: {
                    clientName: sale.Client ? `${sale.Client.firstName} ${sale.Client.lastName}` : 'Cliente Casual',
                    total: parseFloat(sale.total),
                    saleId: sale.id,
                    businessId: sale.BusinessId
                }
            };
        });

    res.json({
        success: true,
        receipts,
        stats: {
            totalReceipts: receipts.length,
            totalViews: receipts.reduce((sum, r) => sum + r.viewCount, 0),
            averageViews: receipts.length > 0 ? (receipts.reduce((sum, r) => sum + r.viewCount, 0) / receipts.length).toFixed(2) : 0,
            mostViewed: receipts.length > 0 ? Math.max(...receipts.map(r => r.viewCount)) : 0
        }
    });
});

// Get sales reports
export const getReports = asyncHandler(async (req, res) => {
    const businessId = req.user.businessId;
    const { startDate, endDate, liveDaysOnly } = req.query;

    const whereClause = { BusinessId: businessId };
    if (req.user.role === 'employee' && req.user.businessMemberId) {
        whereClause.SellerId = req.user.businessMemberId;
    }

    if (startDate && endDate) {
        whereClause.createdAt = {
            [db.Sequelize.Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
        };
    }

    const sales = await db.Sale.findAll({
        where: whereClause,
        include: [
            { model: db.SaleDetail, include: [{ model: db.Product, paranoid: false }] },
            { model: db.Client, paranoid: false }
        ],
        order: [['createdAt', 'DESC']]
    });

    const business = await db.Business.findByPk(businessId);
    const liveDays = business?.liveDays || [];

    let filteredSales = sales;
    if (liveDaysOnly === 'true' && liveDays.length > 0) {
        filteredSales = sales.filter(sale => liveDays.includes(new Date(sale.createdAt).getDay()));
    }

    const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalTransactions = filteredSales.length;
    const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    let totalItemsSold = 0;
    filteredSales.forEach(sale => {
        sale.SaleDetails.forEach(detail => { totalItemsSold += detail.quantity; });
    });

    const salesByDay = Array(7).fill(0).map((_, i) => ({
        day: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][i],
        dayNumber: i,
        sales: 0,
        transactions: 0
    }));

    filteredSales.forEach(sale => {
        const dayOfWeek = new Date(sale.createdAt).getDay();
        salesByDay[dayOfWeek].sales += parseFloat(sale.total);
        salesByDay[dayOfWeek].transactions += 1;
    });

    const productStats = {};
    filteredSales.forEach(sale => {
        sale.SaleDetails.forEach(detail => {
            const productId = detail.ProductId;
            const productName = detail.Product?.name || 'Producto eliminado';
            if (!productStats[productId]) {
                productStats[productId] = { id: productId, name: productName, quantity: 0, revenue: 0 };
            }
            productStats[productId].quantity += detail.quantity;
            productStats[productId].revenue += parseFloat(detail.subtotal);
        });
    });

    const allProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

    const clientStats = {};
    filteredSales.forEach(sale => {
        const clientId = sale.ClientId || 'casual';
        const clientName = sale.Client ? `${sale.Client.firstName} ${sale.Client.lastName}` : 'Cliente Casual';
        if (!clientStats[clientId]) {
            clientStats[clientId] = { id: clientId, name: clientName, purchases: 0, total: 0 };
        }
        clientStats[clientId].purchases += 1;
        clientStats[clientId].total += parseFloat(sale.total);
    });

    const allClients = Object.values(clientStats).sort((a, b) => b.total - a.total);

    const salesTrend = {};
    filteredSales.forEach(sale => {
        const date = new Date(sale.createdAt).toISOString().split('T')[0];
        if (!salesTrend[date]) salesTrend[date] = { date, sales: 0, transactions: 0 };
        salesTrend[date].sales += parseFloat(sale.total);
        salesTrend[date].transactions += 1;
    });

    const trend = Object.values(salesTrend).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
        success: true,
        summary: {
            totalSales: parseFloat(totalSales.toFixed(2)),
            totalTransactions,
            averageSale: parseFloat(averageSale.toFixed(2)),
            totalItemsSold
        },
        salesByDay,
        products: allProducts,
        clients: allClients,
        trend
    });
});
