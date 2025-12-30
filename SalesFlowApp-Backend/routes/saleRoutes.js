import express from 'express';
import { createSale, getSales, generateReceiptToken, getReceiptData } from '../controllers/saleController.js';
import { protect, attachBusiness } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Routes (No Auth Required)
router.get('/receipt-data/:token', getReceiptData);

// Protected Middleware
router.use(protect);
router.use(attachBusiness);

// Protected Routes
router.post('/', createSale);
router.get('/', getSales);
router.post('/receipt-token', generateReceiptToken);

export default router;
