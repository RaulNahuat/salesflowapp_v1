import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            error: 'Acceso no autorizado, falta token'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            businessId: decoded.businessId,
            role: decoded.role,
            businessMemberId: decoded.businessMemberId // Ensure this is in token or fetched
        };

        // Backward compatibility for other controllers if they use req.userId directly
        req.userId = decoded.userId;
        req.businessId = decoded.businessId;

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido'
        })
    }
};

const attachBusiness = (req, res, next) => {
    // This middleware logic is now merged into protect or can be a simple pass-through
    // providing it for backward compatibility with route imports
    if (!req.businessId && !req.user?.businessId) {
        return res.status(403).json({ message: 'No se encontró el ID del negocio' });
    }
    next();
};

export { protect, attachBusiness };
