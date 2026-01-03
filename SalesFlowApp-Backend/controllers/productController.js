import db from '../models/index.js';
import { cache, getCacheKey } from '../utils/cache.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const Product = db.Product;

// Create and Save a new Product
export const createProduct = asyncHandler(async (req, res) => {
    let t;
    t = await db.sequelize.transaction();
    const { name, description, costPrice, sellingPrice, stock, status, imageUrl, variants } = req.body;
    const businessId = req.businessId;

    if (!name || !sellingPrice) {
        if (t) await t.rollback();
        const error = new Error("El nombre y el precio de venta son obligatorios");
        error.status = 400;
        error.type = 'VALIDATION_ERROR';
        throw error;
    }

    if (!businessId) {
        if (t) await t.rollback();
        const error = new Error("No se encontró el negocio asociado al usuario.");
        error.status = 403;
        throw error;
    }

    let totalStock = parseInt(stock) || 0;
    if (variants && variants.length > 0) {
        totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
    }

    const product = await Product.create({
        name,
        description,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        stock: totalStock,
        status: status || 'active',
        imageUrl,
        BusinessId: businessId
    }, { transaction: t });

    if (variants && variants.length > 0) {
        const variantsToCreate = variants.map(v => ({
            ...v,
            stock: parseInt(v.stock) || 0,
            ProductId: product.id
        }));
        await db.ProductVariant.bulkCreate(variantsToCreate, { transaction: t });
    }

    await t.commit();

    const productWithVariants = await Product.findOne({
        where: { id: product.id },
        include: [{ association: 'ProductVariants', required: false }]
    });

    cache.del(getCacheKey('products', businessId));

    res.status(201).json({
        success: true,
        message: "Producto creado exitosamente",
        product: productWithVariants
    });
});

// Retrieve all Products from the database.
export const getProducts = asyncHandler(async (req, res) => {
    const businessId = req.businessId;
    const cacheKey = getCacheKey('products', businessId);

    // ✅ Intentar obtener de cache
    const cachedProducts = cache.get(cacheKey);
    if (cachedProducts) {
        return res.json({
            success: true,
            count: cachedProducts.length,
            products: cachedProducts
        });
    }

    // Si no está en cache, consultar BD
    const products = await Product.findAll({
        where: { BusinessId: businessId },
        include: [{
            association: 'ProductVariants',
            required: false,
            attributes: ['id', 'color', 'size', 'sku', 'stock']
        }],
        order: [['createdAt', 'DESC']]
    });

    // ✅ Guardar en cache
    cache.set(cacheKey, products);

    res.json({
        success: true,
        count: products.length,
        products
    });
});

// Find a single Product with an id
export const getProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    const product = await Product.findOne({
        where: { id: id, BusinessId: businessId },
        include: [{
            association: 'ProductVariants',
            required: false
        }]
    });

    if (!product) {
        const error = new Error(`No se encontró el producto con id=${id}`);
        error.status = 404;
        throw error;
    }

    res.json({
        success: true,
        product
    });
});

// Update a Product by the id in the request
export const updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;
    let t;

    t = await db.sequelize.transaction();
    const { variants, ...productData } = req.body;

    if (productData.costPrice === '' || productData.costPrice === null) productData.costPrice = 0;
    if (productData.sellingPrice === '' || productData.sellingPrice === null) productData.sellingPrice = 0;

    const product = await Product.findOne({
        where: { id: id, BusinessId: businessId },
        transaction: t,
        lock: t.LOCK.UPDATE
    });

    if (!product) {
        if (t) await t.rollback();
        const error = new Error("Producto no encontrado.");
        error.status = 404;
        throw error;
    }

    if (variants) {
        const existingVariants = await db.ProductVariant.findAll({ where: { ProductId: id }, transaction: t });
        const incomingVariantIds = variants.map(v => v.id).filter(Boolean);

        const variantsToDelete = existingVariants.filter(v => !incomingVariantIds.includes(v.id));
        if (variantsToDelete.length > 0) {
            await db.ProductVariant.destroy({
                where: { id: variantsToDelete.map(v => v.id) },
                transaction: t
            });
        }

        for (const v of variants) {
            const variantData = {
                color: v.color,
                size: v.size,
                stock: parseInt(v.stock) || 0,
                sku: v.sku
            };

            if (v.id && existingVariants.some(ev => ev.id === v.id)) {
                await db.ProductVariant.update(variantData, { where: { id: v.id }, transaction: t });
            } else {
                await db.ProductVariant.create({ ...variantData, ProductId: id }, { transaction: t });
            }
        }
    }

    let finalStock = 0;
    const currentVariants = await db.ProductVariant.findAll({ where: { ProductId: id }, transaction: t });

    if (currentVariants.length > 0) {
        finalStock = currentVariants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
    } else {
        finalStock = parseInt(productData.stock || 0);
    }

    await product.update({
        ...productData,
        costPrice: parseFloat(productData.costPrice) || 0,
        sellingPrice: parseFloat(productData.sellingPrice) || 0,
        stock: finalStock
    }, { transaction: t });

    await t.commit();

    const updatedProduct = await Product.findOne({
        where: { id: id },
        include: [{ association: 'ProductVariants', required: false }]
    });

    cache.del(getCacheKey('products', businessId));

    res.json({
        success: true,
        message: "Producto actualizado correctamente",
        product: updatedProduct
    });
});

// Delete a Product with the specified id in the request
export const deleteProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    const num = await Product.destroy({
        where: { id: id, BusinessId: businessId }
    });

    if (num == 1) {
        cache.del(getCacheKey('products', businessId));
        res.json({
            success: true,
            message: "Producto eliminado correctamente!"
        });
    } else {
        const error = new Error(`No se pudo eliminar el producto con id=${id}.`);
        error.status = 404;
        throw error;
    }
});
