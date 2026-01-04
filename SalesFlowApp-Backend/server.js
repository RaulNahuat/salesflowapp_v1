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

// 🔒 SECURITY: Import secure error handlers
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

dotenv.config();

// 🔒 SECURITY: Validar JWT_SECRET al inicio
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('❌ ERROR CRÍTICO: JWT_SECRET debe tener al menos 32 caracteres');
    console.error('Genera un secreto fuerte con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

const app = express();
app.set('trust proxy', 1);

const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;
const allowedOrigins = [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

// 🔒 SECURITY: CORS configurado con validación estricta
const corsOptions = {
    origin: function (origin, callback) {
        // 🔒 SECURITY: En producción, rechazar requests sin origin header
        if (!origin && process.env.NODE_ENV === 'production') {
            console.warn('⚠️ SECURITY: Request sin Origin header rechazado en producción');
            return callback(new Error('Origin header required in production'));
        }

        // Permitir requests sin origin solo en desarrollo (curl, Postman)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.includes(origin);
        const isDevelopment = process.env.NODE_ENV !== 'production';

        if (isAllowed || isDevelopment) {
            return callback(null, true);
        }

        console.warn(`⚠️ SECURITY: Bloqueado por CORS: El origen '${origin}' no está en la lista permitida.`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}


app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// 🔒 SECURITY: Helmet con CSP y configuraciones avanzadas
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "http:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'same-origin' }
}));

// 🔒 SECURITY: Rate limiter específico para autenticación (más estricto)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Aumentado de 20 a 100 para evitar bloqueos durante pruebas y uso normal
    message: 'Demasiados intentos de inicio de sesión. Por favor intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

// 🔒 SECURITY: Rate limiter general (reducido para mejor seguridad)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000, // Aumentado significativamente para evitar bloqueos de API
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

// Aplicar rate limiter estricto a rutas de autenticación
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);

app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
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

import raffleRoutes from './routes/raffleRoutes.js';
app.use('/api/raffles', raffleRoutes);

import userRoutes from './routes/userRoutes.js';
app.use('/api/users', userRoutes);

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

    // await sequelize.sync(); // alter: true disabled to prevent ER_TOO_MANY_KEYS
    // console.log('Base de datos sincronizada correctamente');

    // await seedEstatus();
    // console.log('Estatus seed completado');

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
};

// ----------------------------------------------------
// 🔒 SECURITY: SECURE ERROR HANDLING (MUST BE LAST)
// ----------------------------------------------------
// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler - sanitizes errors and hides sensitive info
app.use(errorHandler);

startServer();