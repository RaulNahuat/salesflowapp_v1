import { sequelize } from '../config/db.js';
import db from '../models/index.js';

const { Sale, SaleDetail, Product, Client, BusinessMember, User, ProductVariant, ReceiptToken } = db;

export const createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { items, clientId, paymentMethod, notes, total } = req.body;
        const businessId = req.user.businessId;

        // Resolve Seller ID (BusinessMember)
        let sellerId = req.user.businessMemberId;
        if (!sellerId) {
            // Fallback: Fetch from DB if not in token (e.g. old session)
            const member = await BusinessMember.findOne({
                where: { UserId: req.user.userId, BusinessId: businessId }
            });
            if (member) sellerId = member.id;
        }

        if (!sellerId) {
            return res.status(400).json({ error: 'No se pudo identificar al vendedor (BusinessMember no encontrado)' });
        }

        // 1. Calculate Valid Total Server-Side
        let calculatedTotal = 0;
        const processedItems = [];

        // Validate items and calculate total first before creating anything
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });

            if (!product) {
                throw new Error(`Producto no encontrado: ${item.name}`);
            }

            // Price Integrity: Use server-side price
            const unitPrice = parseFloat(product.sellingPrice);
            const subtotal = unitPrice * item.quantity;
            calculatedTotal += subtotal;

            let variant = null;
            if (item.variantId) {
                variant = await ProductVariant.findByPk(item.variantId, { transaction: t });
                if (!variant) {
                    throw new Error(`Variante no encontrada para: ${item.name}`);
                }
                if (variant.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para variante: ${item.name}`);
                }
            } else {
                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para: ${product.name}`);
                }
            }

            processedItems.push({
                product,
                variant,
                quantity: item.quantity,
                unitPrice,
                subtotal
            });
        }

        // Validate Total (Allow 0.5 difference for rounding issues)
        const submittedTotal = parseFloat(total);
        if (Math.abs(submittedTotal - calculatedTotal) > 0.50) {
            throw new Error(`Discrepancia de precios detectada. Total Frontend: ${submittedTotal}, Total Real: ${calculatedTotal}`);
        }

        // 2. Create Sale Record with Verified Total
        const sale = await Sale.create({
            total: calculatedTotal, // Use server calculated total
            status: 'delivered',
            paymentMethod,
            notes,
            BusinessId: businessId,
            clientId: clientId || null,
            createdById: sellerId
        }, { transaction: t });

        // 3. Process Items (Deduct Stock & Create Details)
        for (const item of processedItems) {
            if (item.variant) {
                // Deduct stock from variant
                await item.variant.decrement('stock', { by: item.quantity, transaction: t });
                // Also update total product stock
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
                // Deduct Stock
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

        // 4. Create Payment Record (Financial Ledger)
        // Access Payment model correctly from db object if not imported directly, 
        // but considering imports at top: const { Sale, SaleDetail, ... } = db;
        // We need to ensure Payment is in the destructured list or access via db.Payment
        await db.Payment.create({
            amount: calculatedTotal,
            method: paymentMethod,
            date: new Date(),
            SaleId: sale.id,
            BusinessId: businessId // Ensure Payment model has this or association supports it. 
            // Checking step 35: Payment model only has amount, method, date. 
            // Checking step 12: db.Sale.hasMany(db.Payment). 
            // So SaleId is valid. BusinessId might not be in Payment model unless added by hook or manual column.
            // Let's stick to relation via SaleId for now as per schema in Step 35.
        }, { transaction: t });

        await t.commit();

        // Generate receipt token automatically for this sale
        try {
            const clientName = clientId
                ? await Client.findByPk(clientId).then(c => c ? `${c.firstName} ${c.lastName}` : 'Cliente')
                : 'Cliente Casual';

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            const tokenEntry = await ReceiptToken.create({
                parameters: {
                    clientName,
                    total: calculatedTotal,
                    saleId: sale.id,
                    businessId
                },
                expiresAt
            });

            // Update sale with receipt token ID
            await sale.update({ receiptTokenId: tokenEntry.id });

            res.status(201).json({
                message: 'Venta registrada exitosamente',
                saleId: sale.id,
                receiptToken: tokenEntry.id
            });
        } catch (tokenError) {
            console.error('Error generating receipt token:', tokenError);
            res.status(201).json({
                message: 'Venta registrada exitosamente',
                saleId: sale.id,
                receiptToken: null
            });
        }

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error('Error creating sale:', error);
        res.status(500).json({
            message: error.message || 'Error al procesar la venta'
        });
    }
};

export const getSales = async (req, res) => {
    try {
        const businessId = req.user.businessId;
        const { limit = 20, offset = 0 } = req.query;

        const sales = await Sale.findAll({
            where: { BusinessId: businessId },
            include: [
                {
                    model: Client,
                    attributes: ['id', 'firstName', 'lastName', 'phone', 'deletedAt'],
                    paranoid: false
                },
                {
                    model: BusinessMember,
                    as: 'Seller',
                    include: [{ model: User, attributes: ['firstName', 'lastName'] }]
                },
                {
                    model: SaleDetail,
                    include: [
                        {
                            model: Product,
                            attributes: ['name', 'deletedAt'],
                            paranoid: false
                        },
                        {
                            model: ProductVariant,
                            paranoid: false
                            // Include all attributes or specify like ['size', 'color']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Error al obtener historial de ventas' });
    }
};

export const generateReceiptToken = async (req, res) => {
    try {
        const { saleId } = req.body;
        const businessId = req.user.businessId;

        // Fetch the sale
        const sale = await Sale.findOne({
            where: { id: saleId, BusinessId: businessId },
            include: [{ model: Client }]
        });

        if (!sale) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const clientName = sale.Client
            ? `${sale.Client.firstName} ${sale.Client.lastName}`
            : 'Cliente Casual';

        // Create a token valid for 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const tokenEntry = await ReceiptToken.create({
            parameters: { clientName, total: sale.total, saleId, businessId },
            expiresAt
        });

        // Update sale with receipt token
        await sale.update({ receiptTokenId: tokenEntry.id });

        res.json({ token: tokenEntry.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar el link del recibo' });
    }
};

export const getReceiptData = async (req, res) => {
    try {
        const { token } = req.params;
        const entry = await ReceiptToken.findByPk(token);

        if (!entry) {
            return res.status(404).json({ message: 'Recibo no encontrado o inválido' });
        }

        if (new Date() > new Date(entry.expiresAt)) {
            return res.status(410).json({ message: 'Este recibo ha expirado' });
        }

        // Increment view count and update last viewed timestamp
        await entry.increment('viewCount');
        await entry.update({ lastViewedAt: new Date() });

        // Fetch business details including contact information
        const businessId = entry.parameters.businessId;
        const business = await db.Business.findByPk(businessId, {
            attributes: ['name', 'slug', 'logoURL', 'phone', 'email', 'address', 'returnPolicy', 'settings']
        });

        // Fetch the single sale
        const saleId = entry.parameters.saleId;
        const sale = await db.Sale.findOne({
            where: {
                id: saleId,
                BusinessId: businessId
            },
            include: [
                {
                    model: db.SaleDetail,
                    include: [
                        { model: db.Product, paranoid: false },
                        { model: db.ProductVariant, paranoid: false }
                    ]
                },
                {
                    model: db.Client,
                    paranoid: false
                }
            ]
        });

        if (!sale) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const responseData = {
            clientName: entry.parameters.clientName,
            total: entry.parameters.total,
            sale: sale.toJSON(), // Single sale object
            business: business ? business.toJSON() : null,
            createdAt: sale.createdAt
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al recuperar el recibo' });
    }
};

export const getReceiptHistory = async (req, res) => {
    try {
        const businessId = req.user.businessId;
        const { limit = 50, offset = 0, clientName, startDate, endDate, minAmount, maxAmount } = req.query;

        // Build where clause for sales with receipt tokens
        const whereClause = {
            BusinessId: businessId,
            receiptTokenId: { [db.Sequelize.Op.ne]: null } // Only sales with receipt tokens
        };

        // Add filters
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

        // Fetch sales with receipt tokens
        const sales = await db.Sale.findAll({
            where: whereClause,
            include: [
                {
                    model: db.Client,
                    paranoid: false,
                    where: clientName ? {
                        [db.Sequelize.Op.or]: [
                            { firstName: { [db.Sequelize.Op.like]: `%${clientName}%` } },
                            { lastName: { [db.Sequelize.Op.like]: `%${clientName}%` } }
                        ]
                    } : undefined,
                    required: !!clientName
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get all receipt token IDs
        const tokenIds = sales.map(s => s.receiptTokenId).filter(Boolean);

        // Fetch receipt tokens
        const tokens = await db.ReceiptToken.findAll({
            where: { id: tokenIds }
        });

        // Create a map for quick lookup
        const tokenMap = {};
        tokens.forEach(t => {
            tokenMap[t.id] = t;
        });

        // Transform to receipt format
        const receipts = sales
            .filter(sale => tokenMap[sale.receiptTokenId]) // Ensure receipt token exists
            .map(sale => {
                const token = tokenMap[sale.receiptTokenId];
                return {
                    id: sale.receiptTokenId,
                    createdAt: sale.createdAt,
                    viewCount: token.viewCount || 0,
                    lastViewedAt: token.lastViewedAt,
                    parameters: {
                        clientName: sale.Client
                            ? `${sale.Client.firstName} ${sale.Client.lastName}`
                            : 'Cliente Casual',
                        total: parseFloat(sale.total),
                        saleId: sale.id,
                        businessId: sale.BusinessId
                    }
                };
            });

        // Calculate statistics
        const stats = {
            totalReceipts: receipts.length,
            totalViews: receipts.reduce((sum, r) => sum + r.viewCount, 0),
            averageViews: receipts.length > 0
                ? (receipts.reduce((sum, r) => sum + r.viewCount, 0) / receipts.length).toFixed(2)
                : 0,
            mostViewed: receipts.length > 0
                ? Math.max(...receipts.map(r => r.viewCount))
                : 0
        };

        res.json({
            receipts,
            stats
        });
    } catch (error) {
        console.error('Error fetching receipt history:', error);
        res.status(500).json({ message: 'Error al obtener historial de recibos', error: error.message });
    }
};

// Get sales reports with statistics
export const getReports = async (req, res) => {
    try {
        const businessId = req.user.businessId;
        const { startDate, endDate, liveDaysOnly } = req.query;

        console.log('=== REPORTS DEBUG V4 ===');
        console.log('Business ID:', businessId);
        console.log('Filters:', { startDate, endDate, liveDaysOnly });

        const whereClause = { BusinessId: businessId };

        // Add date filters - use string comparison to avoid timezone issues
        if (startDate && endDate) {
            whereClause.createdAt = {
                [db.Sequelize.Op.between]: [
                    `${startDate} 00:00:00`,
                    `${endDate} 23:59:59`
                ]
            };
            console.log('Date filter applied:', `${startDate} 00:00:00 to ${endDate} 23:59:59`);
        }

        console.log('Executing query...');

        const sales = await db.Sale.findAll({
            where: whereClause,
            include: [
                { model: db.SaleDetail, include: [{ model: db.Product, paranoid: false }] },
                { model: db.Client, paranoid: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${sales.length} sales`);
        if (sales.length > 0) {
            console.log('First sale:', {
                id: sales[0].id,
                total: sales[0].total,
                createdAt: sales[0].createdAt,
                detailsCount: sales[0].SaleDetails?.length || 0
            });
        }

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

    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
    }
};
