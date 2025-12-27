import authService from "../services/authService.js";

const register = async (req, res) => {
    try {
        const { user, token } = await authService.register(req.body);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Use lax for better compatibility during dev
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        res.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body; // Changed from phone to email
        const { user, token } = await authService.login(email, password);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
};

const verifyToken = async (req, res) => {
    try {
        // Token is usually in cookies, but authMiddleware checks it.
        // We can double check or just return the user info verified by middleware if we use it here?
        // But verifyToken route might be called without middleware?
        // Usually verifyToken endpoint just returns the user if the token in cookie is valid.
        // Let's use the explicit service call or rely on middleware.
        // If we use middleware on this route, req.userId is set.
        // If we call service.verifyToken(token), we get user.

        const token = req.cookies.token;
        if (!token) throw new Error("No token provided");

        const user = await authService.verifyToken(token);

        res.json({
            success: true,
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

export default {
    login,
    logout,
    register,
    verifyToken
};