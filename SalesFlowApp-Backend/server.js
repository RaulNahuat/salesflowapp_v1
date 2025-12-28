import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import db from './models/index.js';
import { sequelize, testConnection } from './config/db.js';
// import clienteRoutes from './routes/clienteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import { seedEstatus } from './seed/status.seed.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
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

import productRoutes from './routes/productRoutes.js';
app.use('/api/products', productRoutes);

import businessRoutes from './routes/businessRoutes.js';
app.use('/api/business', businessRoutes);

import dashboardRoutes from './routes/dashboardRoutes.js';
app.use('/api/dashboard', dashboardRoutes);

import clientRoutes from './routes/clientRoutes.js';
app.use('/api/clients', clientRoutes);

import workerRoutes from './routes/workerRoutes.js';
app.use('/api/workers', workerRoutes);

import saleRoutes from './routes/saleRoutes.js';
app.use('/api/sales', saleRoutes);

import { protect } from './middlewares/authMiddleware.js';
app.post('/api/protected', protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: '¡Acceso Concedido. Accediste correctamente.',
        usuario: { id: req.user.usuario_id, rol: req.user.rol }
    });
});

// ----------------------------------------------------
// ENDPOINTS DE CLIENTES
// ----------------------------------------------------
// app.use('/api/clientes', clienteRoutes);

// ----------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------
const startServer = async () => {
    await testConnection();

    // Sync removed to prevent startup error. We will patch DB manually if needed.
    // if (db.BusinessMember) {
    //    await db.BusinessMember.sync({ alter: true });
    // }

    await sequelize.sync(); // alter: true disabled to prevent ER_TOO_MANY_KEYS
    console.log('Base de datos sincronizada correctamente');

    // await seedEstatus();
    console.log('Estatus seed completado');

    app.listen(PORT, '0.0.0.0', () => {
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