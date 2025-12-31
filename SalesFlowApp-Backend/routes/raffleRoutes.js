import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize, PERMISSIONS, ensureBusinessAccess } from '../middlewares/rbacMiddleware.js';
import {
    validateCreateRaffle,
    validateUpdateRaffle,
    validateIdParam
} from '../middlewares/validationMiddleware.js';
import {
    createRaffle,
    getRaffles,
    getRaffle,
    updateRaffle,
    deleteRaffle,
    drawWinner,
    getTicketsByClient,
    generateBatchTickets,
    getEligibleSales
} from '../controllers/raffleController.js';

const router = express.Router();

// 🔒 SECURITY: Apply authentication and business validation to all routes
router.use(protect);
router.use(ensureBusinessAccess);

// Client tickets
router.get('/client/:clientId',
    authorize(PERMISSIONS.RAFFLE_READ),
    getTicketsByClient
);

// CRUD routes
router.post('/',
    authorize(PERMISSIONS.RAFFLE_CREATE),
    validateCreateRaffle,
    createRaffle
);

router.get('/',
    authorize(PERMISSIONS.RAFFLE_READ),
    getRaffles
);

router.get('/:id',
    authorize(PERMISSIONS.RAFFLE_READ),
    validateIdParam,
    getRaffle
);

router.put('/:id',
    authorize(PERMISSIONS.RAFFLE_UPDATE),
    validateUpdateRaffle,
    updateRaffle
);

router.delete('/:id',
    authorize(PERMISSIONS.RAFFLE_DELETE),
    validateIdParam,
    deleteRaffle
);

// Batch generation
router.get('/:id/eligible-sales',
    authorize(PERMISSIONS.RAFFLE_READ),
    validateIdParam,
    getEligibleSales
);

router.post('/:id/generate-batch',
    authorize(PERMISSIONS.RAFFLE_CREATE),
    validateIdParam,
    generateBatchTickets
);

// Draw winner
router.post('/:id/draw',
    authorize(PERMISSIONS.RAFFLE_DRAW),
    validateIdParam,
    drawWinner
);

export default router;

