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

        req.userId = decoded.userId;
        req.bussinessId = decoded.businessId;
        req.role = decoded.role;

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido'
        })
    }
};

export { protect };
