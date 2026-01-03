import db from '../models/index.js';
import crypto from 'crypto';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const User = db.User;

/**
 * Request Password Reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
        // Security: Don't confirm if user doesn't exist to prevent enumeration
        return res.status(200).json({
            success: true,
            message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.'
        });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token & expiry (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // Send real e-mail
    try {
        await sendPasswordResetEmail(user.email, token);
    } catch (error) {
        // Log error but don't expose to user for security/UX
        console.error('Failed to send reset email:', error);
    }

    res.status(200).json({
        success: true,
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.'
    });
});

/**
 * Reset Password
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 8 caracteres'
        });
    }

    const user = await User.findOne({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() }
        }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'El enlace de restablecimiento es inválido o ha expirado.'
        });
    }

    // Update password (model hooks will hash it)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Contraseña actualizada correctamente'
    });
});
