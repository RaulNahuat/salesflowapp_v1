import express from 'express';
import {
    createSale,
    getSales,
    generateReceiptToken,
    getReceiptData,
    getReceiptHistory,
    getReports
} from '../controllers/saleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize, PERMISSIONS, ensureBusinessAccess } from '../middlewares/rbacMiddleware.js';
import { validateCreateSale } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// 🔒 SECURITY: Ruta pública para recibos (por diseño)
// El endpoint ya valida businessId internamente
router.get('/receipt-data/:token', getReceiptData);

// 🔒 SECURITY: Proteger todas las demás rutas
router.use(protect);
router.use(ensureBusinessAccess);

// 🔒 RBAC + Validation aplicados
router.post('/',
    authorize(PERMISSIONS.SALE_CREATE),
    validateCreateSale,
    createSale
);

router.get('/',
    authorize(PERMISSIONS.SALE_READ),
    getSales
);

router.post('/receipt-token',
    authorize(PERMISSIONS.SALE_READ),
    generateReceiptToken
);

router.get('/receipt-history',
    authorize(PERMISSIONS.SALE_READ),
    getReceiptHistory
);

router.get('/reports',
    authorize(PERMISSIONS.SALE_READ),
    getReports
);

export default router;
