import db from '../models/index.js';

const Product = db.Product;

// Create and Save a new Product
export const createProduct = async (req, res) => {
    try {
        const { name, description, costPrice, sellingPrice, stock, status, imageUrl } = req.body;
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

        const product = await Product.create({
            name,
            description,
            costPrice,
            sellingPrice,
            stock,
            sellingPrice,
            stock,
            status,
            imageUrl,
            BusinessId: businessId
        });

        res.status(201).json(product);
    } catch (error) {
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
            where: { BusinessId: businessId }
        });
        res.json(products);
    } catch (error) {
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
            where: { id: id, BusinessId: businessId }
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
        const [num] = await Product.update(req.body, {
            where: { id: id, BusinessId: businessId }
        });

        if (num == 1) {
            res.json({
                message: "Producto actualizado correctamente."
            });
        } else {
            res.json({
                message: `No se puede actualizar el producto con id=${id}. Tal vez no se encontró o el req.body está vacío.`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error actualizando el producto con id=" + id
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
