import db from '../models/index.js';
import bcrypt from 'bcryptjs';

const User = db.User;
const BusinessMember = db.BusinessMember;
const Business = db.Business;

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const user = await User.findByPk(req.user.userId);

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Check if phone is being changed and if it's already in use by another active user
        if (phone && phone !== user.phone) {
            const existingPhone = await User.findOne({
                where: { phone },
                paranoid: false // Include soft-deleted records
            });
            if (existingPhone && !existingPhone.deletedAt && existingPhone.id !== user.id) {
                return res.status(400).json({ message: 'Este número de teléfono ya está en uso' });
            }
        }

        await user.update({ firstName, lastName, phone });

        res.json({
            message: 'Perfil actualizado exitosamente',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.userId);

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        user.password = newPassword;
        await user.save(); // User model has beforeUpdate hook to hash password

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.userId;

        // 1. Validar contraseña
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // 2. Buscar todos los BusinessMember del usuario
        const businessMembers = await BusinessMember.findAll({
            where: { UserId: userId },
            include: [{ model: Business }]
        });

        // 3. Eliminar negocios donde el usuario es owner
        for (const member of businessMembers) {
            if (member.role === 'owner' && member.Business) {
                // Esto eliminará en cascada: productos, ventas, clientes, rifas, etc.
                await member.Business.destroy();
            }
        }

        // 4. Eliminar el usuario (esto eliminará en cascada los BusinessMembers)
        // Usar soft delete (paranoid: true en el modelo)
        await user.destroy();

        res.json({
            message: 'Cuenta eliminada exitosamente',
            success: true
        });
    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        res.status(500).json({ message: 'Error al eliminar la cuenta' });
    }
};
