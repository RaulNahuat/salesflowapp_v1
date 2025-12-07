import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sequelize, testConnection } from './config/db.js';
import clienteRoutes from './routes/clienteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, //
    message: 'Demasiadas solicitudes desde esta IP, por favor inténtalo de nuevo después de 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

app.use(express.static('public'));

// ----------------------------------------------------
// DEFINICIÓN DE ENDPOINTS
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.send('<h1> Bienvenido a la API de SalesFlowApp</h1>');
});

app.use('/api/auth', authRoutes);

app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Sesión cerrada correctamente.' });
});

import { protect } from './middlewares/authMiddleware.js';
app.post('/api/protected', protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: '¡Acceso Concedido. Accediste correctamente.',
        usuario: { id: req.user.usuario_id, rol: req.user.rol }
    });
});

app.use('/api/clientes', clienteRoutes);

// ----------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------
const startServer = async () => {
    await testConnection();
    await sequelize.sync({ force: false });

    console.log('Base de datos sincronizada');

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

// ----------------------------------------------------
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// ----------------------------------------------------
app.use((err, req, res, next) => {
    console.error(err.stack); // Siempre loguear en el servidor para debug interno

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Ocurrió un error en el servidor. Por favor intente más tarde.'
        : err.message;

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

startServer();