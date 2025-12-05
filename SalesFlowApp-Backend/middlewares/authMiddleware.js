import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";

// Middleware to protect routes (verify JWT)
export const protect = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. Por favor inicie sesión.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findByPk(decoded.id);

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        req.user = usuario;

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Acceso denegado. Por favor inicie sesión.'
        });
    }
}

// Middleware to restrict access by role
export const autorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. El rol (${req.user.rol}) no tiene permiso para acceder a esta ruta.`
            });
        }
        next();
    };
};