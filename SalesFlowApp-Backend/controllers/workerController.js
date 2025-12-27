import db from '../models/index.js';
import bcrypt from 'bcryptjs';

const User = db.User;
const BusinessMember = db.BusinessMember;

// Create a new Worker (User + BusinessMember)
export const createWorker = async (req, res) => {
    const businessId = req.businessId;
    const { firstName, lastName, email, phone, password, permissions } = req.body;

    // Validations
    if (!email || !password || !firstName) {
        return res.status(400).json({ message: "Nombre, Email y Contraseña son obligatorios" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El formato del email no es válido" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create user if not exists
            // Model hook handles hashing, so we pass plain password
            user = await User.create({
                firstName,
                lastName,
                email,
                phone: phone || null, // Optional
                password: password
            });
        }

        // 2. Check if already a member of this business
        const existingMember = await BusinessMember.findOne({
            where: { UserId: user.id, BusinessId: businessId }
        });

        if (existingMember) {
            return res.status(400).json({ message: "Este usuario ya es miembro de tu equipo." });
        }

        // 3. Add to Business as Employee
        const worker = await BusinessMember.create({
            UserId: user.id,
            BusinessId: businessId,
            role: 'employee',
            permissions: permissions || { pos: true, products: false, reports: false, settings: false },
            status: 'active'
        });

        res.status(201).json({
            message: "Trabajador agregado correctamente",
            worker: {
                id: worker.id,
                role: worker.role,
                permissions: worker.permissions,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Error al crear trabajador" });
    }
};

// Get all workers for the business
export const getWorkers = async (req, res) => {
    const businessId = req.businessId;
    try {
        const workers = await BusinessMember.findAll({
            where: { BusinessId: businessId, role: 'employee' },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }]
        });
        res.json(workers);
    } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({ message: "Error al obtener trabajadores" });
    }
};

// Update Worker Permissions or Status
export const updateWorker = async (req, res) => {
    const { id } = req.params; // BusinessMember ID
    const { permissions, status } = req.body;
    const businessId = req.businessId;

    try {
        const worker = await BusinessMember.findOne({
            where: { id: id, BusinessId: businessId }
        });

        if (!worker) {
            return res.status(404).json({ message: "Trabajador no encontrado" });
        }

        if (permissions) worker.permissions = permissions;
        if (status) worker.status = status;

        await worker.save();

        res.json({ message: "Trabajador actualizado", worker });
    } catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ message: "Error al actualizar trabajador" });
    }
};

// Remove Worker (Delete BusinessMember association)
export const deleteWorker = async (req, res) => {
    const { id } = req.params;
    const businessId = req.businessId;

    try {
        const result = await BusinessMember.destroy({
            where: { id: id, BusinessId: businessId }
        });

        if (result) {
            res.json({ message: "Trabajador eliminado del equipo" });
        } else {
            res.status(404).json({ message: "Trabajador no encontrado" });
        }
    } catch (error) {
        console.error("Error deleting worker:", error);
        res.status(500).json({ message: "Error al eliminar trabajador" });
    }
};
