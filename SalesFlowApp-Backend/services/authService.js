import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";

const saltRounds = 10;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
}

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

export const generateToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario.usuario_id,
            nombre: usuario.nombre,
            rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_TIME }
    )
}