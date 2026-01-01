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
    authorize(PERMISSIONS.RAFFLE_READ, 'raffles'),
    getTicketsByClient
);

// CRUD routes
router.post('/',
    authorize(PERMISSIONS.RAFFLE_CREATE, 'raffles'),
    validateCreateRaffle,
    createRaffle
);

router.get('/',
    authorize(PERMISSIONS.RAFFLE_READ, 'raffles'),
    getRaffles
);

router.get('/:id',
    authorize(PERMISSIONS.RAFFLE_READ, 'raffles'),
    validateIdParam,
    getRaffle
);

router.put('/:id',
    authorize(PERMISSIONS.RAFFLE_UPDATE, 'raffles'),
    validateUpdateRaffle,
    updateRaffle
);

router.delete('/:id',
    authorize(PERMISSIONS.RAFFLE_DELETE, 'raffles'),
    validateIdParam,
    deleteRaffle
);

// Batch generation
router.get('/:id/eligible-sales',
    authorize(PERMISSIONS.RAFFLE_READ, 'raffles'),
    validateIdParam,
    getEligibleSales
);

router.post('/:id/generate-batch',
    authorize(PERMISSIONS.RAFFLE_CREATE, 'raffles'),
    validateIdParam,
    generateBatchTickets
);

// Draw winner
router.post('/:id/draw',
    authorize(PERMISSIONS.RAFFLE_DRAW, 'raffles'),
    validateIdParam,
    drawWinner
);

export default router;

