import express from 'express';
import * as productController from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize, PERMISSIONS, ensureBusinessAccess } from '../middlewares/rbacMiddleware.js';
import {
    validateCreateProduct,
    validateUpdateProduct,
    validateIdParam
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// 🔒 SECURITY: Aplicar autenticación a todas las rutas
router.use(protect);
router.use(ensureBusinessAccess);

// 🔒 RBAC + Validation aplicados a cada ruta
router.post('/',
    authorize(PERMISSIONS.PRODUCT_CREATE),
    validateCreateProduct,
    productController.createProduct
);

router.get('/',
    authorize(PERMISSIONS.PRODUCT_READ),
    productController.getProducts
);

router.get('/:id',
    authorize(PERMISSIONS.PRODUCT_READ),
    validateIdParam,
    productController.getProduct
);

router.put('/:id',
    authorize(PERMISSIONS.PRODUCT_UPDATE),
    validateUpdateProduct,
    productController.updateProduct
);

router.delete('/:id',
    authorize(PERMISSIONS.PRODUCT_DELETE),
    validateIdParam,
    productController.deleteProduct
);

export default router;
