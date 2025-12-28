import express from 'express';
import { createSale, getSales } from '../controllers/saleController.js';
import { protect, attachBusiness } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware
router.use(protect);
router.use(attachBusiness);

// Routes
router.post('/', createSale);
router.get('/', getSales);

export default router;
