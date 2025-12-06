import * as authService from "../services/authService.js";
import { Usuario } from "../models/Usuario.js";

const sendTokenResponse = (usuario, statusCode, res) => {
    const token = authService.generateToken(usuario);

    const options = {
        expires: new Date(Date.now() + (parseInt(process.env.JWT_EXPIRES_TIME) || 24) * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            nombre: usuario.nombre,
            rol: usuario.rol
        })
};

export const register = async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        const passwordHash = await authService.hashPassword(password);

        const nuevoUsuario = await Usuario.create({
            nombre,
            correo,
            password_hash: passwordHash
        });

        sendTokenResponse(nuevoUsuario, 201, res);
    } catch (error) {
        if (error.name == 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está en uso'
            })
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ success: false, message: 'Por favor, proporciona un correo y una contraseña.' });
    }

    try {
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const passwordMatch = await authService.comparePassword(password, usuario.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        sendTokenResponse(usuario, 200, res);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export const verifyUser = async (req, res) => {
    const user = req.user;

    res.status(200).json({
        success: true,
        user: {
            id: user.usuario_id,
            nombre: user.nombre,
            email: user.correo,
            rol: user.rol,
        }
    });
}