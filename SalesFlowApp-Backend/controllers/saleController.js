import { sequelize } from '../config/db.js';
import db from '../models/index.js';

const { Sale, SaleDetail, Product, Client, BusinessMember, User, ProductVariant } = db;

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

        // 1. Create Sale Record
        const sale = await Sale.create({
            total,
            status: 'delivered', // Immediate delivery for POS
            paymentMethod,
            notes,
            BusinessId: businessId,
            clientId: clientId || null, // Optional client
            createdById: sellerId
        }, { transaction: t });

        // 2. Process Items (Deduct Stock & Create Details)
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });

            if (!product) {
                throw new Error(`Producto no encontrado: ${item.name}`);
            }

            // Check if this sale is for a specific variant
            if (item.variantId) {
                const variant = await ProductVariant.findByPk(item.variantId, { transaction: t });

                if (!variant) {
                    throw new Error(`Variante no encontrada para: ${item.name}`);
                }

                if (variant.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para variante: ${item.name}`);
                }

                // Deduct stock from variant
                await variant.decrement('stock', { by: item.quantity, transaction: t });

                // Also update total product stock
                await product.decrement('stock', { by: item.quantity, transaction: t });

                // Create Detail with variant reference
                await SaleDetail.create({
                    SaleId: sale.id,
                    ProductId: item.productId,
                    ProductVariantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    subtotal: item.price * item.quantity
                }, { transaction: t });
            } else {
                // No variant - regular product
                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para: ${product.name}`);
                }

                // Deduct Stock
                await product.decrement('stock', { by: item.quantity, transaction: t });

                // Create Detail
                await SaleDetail.create({
                    SaleId: sale.id,
                    ProductId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    subtotal: item.price * item.quantity
                }, { transaction: t });
            }
        }

        await t.commit();

        res.status(201).json({
            message: 'Venta registrada exitosamente',
            saleId: sale.id
        });

    } catch (error) {
        await t.rollback();
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
                    attributes: ['firstName', 'lastName', 'deletedAt'],
                    paranoid: false
                },
                {
                    model: BusinessMember,
                    as: 'Seller',
                    include: [{ model: User, attributes: ['firstName', 'lastName'] }]
                },
                {
                    model: SaleDetail,
                    include: [{
                        model: Product,
                        attributes: ['name', 'deletedAt'],
                        paranoid: false
                    }]
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
