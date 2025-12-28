import db from '../models/index.js';

const Product = db.Product;

// Create and Save a new Product
export const createProduct = async (req, res) => {
    try {
        const { name, description, costPrice, sellingPrice, stock, status, imageUrl, variants } = req.body;
        const businessId = req.businessId;

        // Validate request
        if (!name || !sellingPrice) {
            return res.status(400).json({
                message: "El nombre y el precio de venta son obligatorios"
            });
        }

        if (!businessId) {
            return res.status(403).json({
                message: "No se encontró el negocio asociado al usuario."
            });
        }

        // Calculate total stock from variants if they exist
        let totalStock = stock || 0;
        if (variants && variants.length > 0) {
            totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
        }

        const product = await Product.create({
            name,
            description,
            costPrice,
            sellingPrice,
            stock: totalStock,
            status,
            imageUrl,
            BusinessId: businessId
        });

        // Create variants if provided
        if (variants && variants.length > 0) {
            const variantsToCreate = variants.map(v => ({
                ...v,
                ProductId: product.id
            }));
            await db.ProductVariant.bulkCreate(variantsToCreate);
        }

        // Fetch product with variants to return
        const productWithVariants = await Product.findOne({
            where: { id: product.id },
            include: [{ association: 'ProductVariants', required: false }]
        });

        res.status(201).json(productWithVariants);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message || "Error al crear el producto"
        });
    }
};

// Retrieve all Products from the database.
export const getProducts = async (req, res) => {
    try {
        const businessId = req.businessId;
        const products = await Product.findAll({
            where: { BusinessId: businessId },
            include: [{
                association: 'ProductVariants',
                required: false // LEFT JOIN - products without variants are OK
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error("❌ ERROR in getProducts:");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        res.status(500).json({
            message: error.message || "Error al obtener los productos"
        });
    }
};

// Find a single Product with an id
export const getProduct = async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    try {
        const product = await Product.findOne({
            where: { id: id, BusinessId: businessId },
            include: [{
                association: 'ProductVariants',
                required: false
            }]
        });

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({
                message: `No se encontró el producto con id=${id}`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error obteniendo el producto con id=" + id
        });
    }
};

// Update a Product by the id in the request
export const updateProduct = async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    try {
        const { variants, ...productData } = req.body;

        // Calculate total stock from variants if provided
        if (variants && variants.length > 0) {
            productData.stock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
        }

        // Update main product data
        const [num] = await Product.update(productData, {
            where: { id: id, BusinessId: businessId }
        });

        if (num !== 1) {
            return res.status(404).json({
                message: `No se puede actualizar el producto con id=${id}. Producto no encontrado.`
            });
        }

        // Handle variants if provided
        if (variants) {
            // Delete existing variants
            await db.ProductVariant.destroy({
                where: { ProductId: id }
            });

            // Create new variants
            if (variants.length > 0) {
                const variantsToCreate = variants.map(v => ({
                    ...v,
                    ProductId: id
                }));
                await db.ProductVariant.bulkCreate(variantsToCreate);
            }
        }

        // Fetch updated product with variants
        const updatedProduct = await Product.findOne({
            where: { id: id },
            include: [{ association: 'ProductVariants', required: false }]
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error("❌ ERROR in updateProduct:");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        res.status(500).json({
            message: error.message || "Error actualizando el producto con id=" + id
        });
    }
};

// Delete a Product with the specified id in the request
export const deleteProduct = async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    try {
        const num = await Product.destroy({
            where: { id: id, BusinessId: businessId }
        });

        if (num == 1) {
            res.json({
                message: "Producto eliminado correctamente!"
            });
        } else {
            res.json({
                message: `No se puede eliminar el producto con id=${id}. Tal vez no se encontró.`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "No se pudo eliminar el producto con id=" + id
        });
    }
};
