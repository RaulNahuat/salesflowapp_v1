import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
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

// All routes require authentication
router.use(protect);

// Client tickets
router.get('/client/:clientId', getTicketsByClient);

// CRUD routes
router.post('/', createRaffle);
router.get('/', getRaffles);
router.get('/:id', getRaffle);
router.put('/:id', updateRaffle);
router.delete('/:id', deleteRaffle);

// Batch generation
router.get('/:id/eligible-sales', getEligibleSales);
router.post('/:id/generate-batch', generateBatchTickets);

// Draw winner
router.post('/:id/draw', drawWinner);

export default router;
