import express from 'express';
import dotenv from 'dotenv';
import { sequelize, testConnection } from './config/db.js';
import clienteRoutes from './routes/clienteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cookieParser());

// ----------------------------------------------------
// DEFINICIÓN DE ENDPOINTS
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.send('<h1> Bienvenido a la API de SalesFlowApp 🚀 </h1>');
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
        message: '¡Acceso Concedido! Esta es una ruta protegida.',
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

startServer();