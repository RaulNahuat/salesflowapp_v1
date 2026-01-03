import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../middlewares/errorHandler.js';

const User = db.User;
const BusinessMember = db.BusinessMember;
const Business = db.Business;

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
    });

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    res.json({
        success: true,
        user
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    // Check if phone is being changed and if it's already in use by another active user
    if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({
            where: { phone },
            paranoid: false
        });
        if (existingPhone && !existingPhone.deletedAt && existingPhone.id !== user.id) {
            const error = new Error('Este número de teléfono ya está en uso');
            error.status = 400;
            error.type = 'DUPLICATE_ERROR';
            error.field = 'phone';
            throw error;
        }
    }

    await user.update({ firstName, lastName, phone });

    res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        }
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        const error = new Error('La contraseña actual es incorrecta');
        error.status = 400;
        throw error;
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
    });
});

export const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const userId = req.user.userId;

    // 1. Validar contraseña
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error('Contraseña incorrecta');
        error.status = 400;
        throw error;
    }

    // 2. Buscar todos los BusinessMember del usuario
    const businessMembers = await BusinessMember.findAll({
        where: { UserId: userId },
        include: [{ model: Business }]
    });

    // 3. Eliminar negocios donde el usuario es owner
    for (const member of businessMembers) {
        if (member.role === 'owner' && member.Business) {
            await member.Business.destroy();
        }
    }

    // 4. Eliminar el usuario (esto eliminará en cascada los BusinessMembers)
    await user.destroy();

    res.json({
        success: true,
        message: 'Cuenta eliminada exitosamente'
    });
});
