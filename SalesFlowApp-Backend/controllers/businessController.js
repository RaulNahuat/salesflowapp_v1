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
        const { name, settings, logoURL, phone, email, address, returnPolicy, weekStartDay, liveDays } = req.body;

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

        // Validate weekStartDay
        if (weekStartDay !== undefined) {
            const day = parseInt(weekStartDay);
            if (isNaN(day) || day < 0 || day > 6) {
                return res.status(400).json({ message: "El día de inicio de semana debe ser un número entre 0 (Domingo) y 6 (Sábado)." });
            }
        }

        // Validate liveDays
        if (liveDays !== undefined) {
            if (!Array.isArray(liveDays)) {
                return res.status(400).json({ message: "Los días de live deben ser un array." });
            }
            const invalidDays = liveDays.filter(d => typeof d !== 'number' || d < 0 || d > 6);
            if (invalidDays.length > 0) {
                return res.status(400).json({ message: "Los días de live deben ser números entre 0 y 6." });
            }
        }

        // Actualizar campos permitidos
        if (name !== undefined) business.name = name;
        if (logoURL !== undefined) business.logoURL = logoURL;
        if (phone !== undefined) business.phone = phone;
        if (email !== undefined) business.email = email;
        if (address !== undefined) business.address = address;
        if (returnPolicy !== undefined) business.returnPolicy = returnPolicy;
        if (weekStartDay !== undefined) business.weekStartDay = parseInt(weekStartDay);
        if (liveDays !== undefined) business.liveDays = liveDays;

        if (settings) {
            // Merge settings correctly (deep merge or spread)
            // For JSON columns in MySQL/Sequelize, it's safer to fetch, merge object, and strictly assign
            const currentSettings = business.settings || {};
            business.settings = { ...currentSettings, ...settings };
        }

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
