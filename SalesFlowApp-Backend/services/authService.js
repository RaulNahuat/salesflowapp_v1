import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const register = async (userData) => {
    const { firstName, lastName, email, phone, password, businessName } = userData;

    // 🔒 SECURITY: Validación de complejidad de contraseña
    if (!password || password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error("La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo especial (@$!%*?&)");
    }

    // Check for duplicate email (only among active users)
    const existingEmail = await db.User.findOne({
        where: { email }
        // paranoid: true is default, so this only finds active users
    });
    if (existingEmail) {
        throw new Error("Ya existe una cuenta con este correo electrónico");
    }

    // Check for duplicate phone (only among active users)
    if (phone) {
        const existingPhone = await db.User.findOne({
            where: { phone }
            // paranoid: true is default, so this only finds active users
        });
        if (existingPhone) {
            throw new Error("Ya existe una cuenta con este número de teléfono");
        }
    }

    // Transaction to ensure data integrity
    const t = await db.sequelize.transaction();

    try {
        const newUser = await db.User.create({
            firstName,
            lastName,
            email,
            phone,
            password
        }, { transaction: t });

        // Determine Business Name
        const nameToUse = businessName || `Negocio de ${firstName}`;

        // Generate Clean Slug
        let baseSlug = nameToUse.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/^-+|-+$/g, ''); // Trim -

        let slug = baseSlug;
        let counter = 1;

        // Check for uniqueness
        while (await db.Business.findOne({ where: { slug }, transaction: t })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const newBusiness = await db.Business.create({
            name: nameToUse,
            slug: slug
        }, { transaction: t });

        // Link User to Business as Owner
        await db.BusinessMember.create({
            UserId: newUser.id,
            BusinessId: newBusiness.id,
            role: 'owner',
            localAlias: firstName,
            accessToken: crypto.randomBytes(32).toString('hex')
        }, { transaction: t });

        await t.commit();

        // Generate token
        const token = jwt.sign(
            { userId: newUser.id, businessId: newBusiness.id, role: 'owner' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_TIME || '24h' }
        );

        return { user: newUser, token, role: 'owner' };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const login = async (email, password) => {
    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Credenciales inválidas");
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error("Credenciales inválidas");
        }

        // Fetch user's business with Slug
        const member = await db.BusinessMember.findOne({
            where: { UserId: user.id },
            include: [{ model: db.Business, attributes: ['slug', 'name'] }]
        });

        // Validar que el usuario tenga un negocio asociado
        let businessId = null;
        let businessSlug = null;
        let businessName = null;
        let role = null;
        let permissions = null;
        let businessMemberId = null;

        if (member) {
            if (member.status === 'inactive') {
                throw new Error("Tu cuenta ha sido desactivada por el administrador.");
            }
            businessId = member.BusinessId;
            businessSlug = member.Business?.slug;
            businessName = member.Business?.name;
            role = member.role;
            permissions = member.permissions;
            businessMemberId = member.id;
        }

        const payload = { userId: user.id, businessId, role, permissions, businessMemberId };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_TIME || '24h' }
        );

        return {
            user: {
                ...user.toJSON(),
                businessSlug,
                businessName // Optional: helpful for display
            },
            token,
            role,
            permissions
        };
    } catch (error) {
        // ... err handling
        if (error.message === "Credenciales inválidas" || error.message.includes("desactivada")) {
            throw error;
        }
        console.error("Login Service Error:", error);
        throw new Error("Error interno del servidor. Por favor intente más tarde.");
    }
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

        // Fetch Member details with Business Slug
        const member = await db.BusinessMember.findOne({
            where: { UserId: user.id },
            include: [{ model: db.Business, attributes: ['slug', 'name'] }]
        });

        // Attach role/perms to user object
        const userWithRole = user.toJSON();
        if (member) {
            userWithRole.role = member.role;
            userWithRole.permissions = member.permissions;
            userWithRole.status = member.status;
            userWithRole.businessSlug = member.Business?.slug;
            userWithRole.businessName = member.Business?.name;
        }

        return userWithRole;
    } catch (error) {
        throw new Error("Token inválido o expirado");
    }
};

export default {
    login,
    register,
    verifyToken
};