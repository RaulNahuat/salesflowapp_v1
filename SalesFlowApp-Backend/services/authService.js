import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const register = async (userData) => {
    const { firstName, lastName, email, phone, password } = userData;
    // Check if user exists
    const existingUser = await db.User.findOne({
        where: {
            [db.Sequelize.Op.or]: [{ email }, { phone }]
        }
    });

    if (existingUser) {
        throw new Error("El usuario ya existe con ese correo o teléfono");
    }

    const newUser = await db.User.create({
        firstName,
        lastName,
        email,
        phone,
        password
    });

    // Generate token immediately after registration
    const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user: newUser, token };
};

const login = async (email, password) => {
    // Busca por email (campo 'email' en modelo User)
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
        throw new Error("Credenciales inválidas");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error("Credenciales inválidas");
    }

    // Prepare token payload
    const payload = { userId: user.id };

    // Optional: Add role/business info if available
    /* 
    try {
        const membership = await db.Membership.findOne({
            where: { userId: user.id }
        });
        if (membership) {
            payload.businessId = membership.businessId;
            payload.role = membership.role;
        }
    } catch (e) {
        // Continue without membership info if table/relation missing
        console.warn("Could not fetch membership info", e);
    }
    */

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
}

const verifyToken = async (token) => {
    if (!token) {
        throw new Error("No se proporcionó token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        return user;
    } catch (error) {
        throw new Error("Token inválido o expirado");
    }
};

export default {
    login,
    register,
    verifyToken
};