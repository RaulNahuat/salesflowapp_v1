import db from '../models/index.js';

const Business = db.Business;

// Obtener información del negocio del usuario actual
export const getMyBusiness = async (req, res) => {
    try {
        const businessId = req.businessId;

        if (!businessId) {
            return res.status(404).json({ message: "No se encontró un negocio asociado." });
        }

        const business = await Business.findByPk(businessId);

        if (!business) {
            return res.status(404).json({ message: "Negocio no encontrado." });
        }

        res.json(business);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Error al obtener la información del negocio"
        });
    }
};

// Actualizar información del negocio
export const updateMyBusiness = async (req, res) => {
    try {
        const businessId = req.businessId;
        const { name, settings, logoURL } = req.body;

        if (!businessId) {
            return res.status(404).json({ message: "No se encontró un negocio asociado." });
        }

        const business = await Business.findByPk(businessId);

        if (!business) {
            return res.status(404).json({ message: "Negocio no encontrado." });
        }

        // Validaciones
        if (settings) {
            if (settings.taxRate !== undefined) {
                const tax = parseFloat(settings.taxRate);
                if (isNaN(tax) || tax < 0 || tax > 100) {
                    return res.status(400).json({ message: "El impuesto debe ser un número entre 0 y 100." });
                }
                settings.taxRate = tax;
            }
        }

        // Actualizar campos permitidos
        if (name) business.name = name;
        if (settings) {
            // Merge settings correctly (deep merge or spread)
            // For JSON columns in MySQL/Sequelize, it's safer to fetch, merge object, and strictly assign
            const currentSettings = business.settings || {};
            business.settings = { ...currentSettings, ...settings };
        }
        if (logoURL) business.logoURL = logoURL;

        await business.save();

        res.json({
            message: "Negocio actualizado correctamente.",
            business
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Error al actualizar la información del negocio"
        });
    }
};
