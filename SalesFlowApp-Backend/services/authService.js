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

export const generateToken = (usuarioId) => {
    return jwt.sign(
        { id: usuarioId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_TIME }
    )
}