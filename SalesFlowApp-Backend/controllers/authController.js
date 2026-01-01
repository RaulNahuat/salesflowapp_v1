import authService from "../services/authService.js";

const register = async (req, res) => {
    try {
        const { user, token, role } = await authService.register(req.body);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin in production
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        res.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: role
            }
        });
    } catch (error) {
        console.error("Register Error:", error);

        // Determine status code based on error type
        let statusCode = 400;
        let errorMessage = error.message;

        // Check for duplicate/conflict errors
        if (error.message.includes("Ya existe una cuenta")) {
            statusCode = 409; // Conflict
        }

        // Extract specific Sequelize validation message if available
        if (error.errors && error.errors.length > 0) {
            errorMessage = error.errors[0].message;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Updated service returns { user: {...}, token, role, permissions }
        // The user object inside already has businessSlug/Name appended by service
        const { user, token, role, permissions } = await authService.login(email, password);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: role,
                permissions: permissions,
                businessSlug: user.businessSlug,
                businessName: user.businessName
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
};


const verifyToken = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ success: true, user: null });

        const user = await authService.verifyToken(token);

        if (user.status === 'inactive') {
            res.clearCookie('token');
            return res.json({ success: true, user: null });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                businessSlug: user.businessSlug,
                businessName: user.businessName
            }
        });
    } catch (error) {
        // Silent fail: return null user
        res.clearCookie('token'); // Clear invalid token
        res.json({
            success: true,
            user: null
        });
    }
};

export default {
    login,
    logout,
    register,
    verifyToken
};