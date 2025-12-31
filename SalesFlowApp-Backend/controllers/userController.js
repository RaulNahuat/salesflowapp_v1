import db from '../models/index.js';
import bcrypt from 'bcryptjs';

const User = db.User;

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
