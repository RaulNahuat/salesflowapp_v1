import express from 'express';
import * as clientController from '../controllers/clientController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize, PERMISSIONS, ensureBusinessAccess } from '../middlewares/rbacMiddleware.js';
import {
    validateCreateClient,
    validateUpdateClient,
    validateIdParam
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// 🔒 SECURITY: Apply authentication and business validation to all routes
router.use(protect);
router.use(ensureBusinessAccess);

// 🔒 ZERO TRUST: All write operations require RBAC + Validation
router.post('/',
    authorize(PERMISSIONS.CLIENT_CREATE, 'clients'),
    validateCreateClient,
    clientController.createClient
);

router.get('/',
    authorize(PERMISSIONS.CLIENT_READ, 'clients'),
    clientController.getClients
);

router.get('/:id',
    authorize(PERMISSIONS.CLIENT_READ, 'clients'),
    validateIdParam,
    clientController.getClient
);

router.put('/:id',
    authorize(PERMISSIONS.CLIENT_UPDATE, 'clients'),
    validateUpdateClient,
    clientController.updateClient
);

router.delete('/:id',
    authorize(PERMISSIONS.CLIENT_DELETE, 'clients'),
    validateIdParam,
    clientController.deleteClient
);

export default router;

