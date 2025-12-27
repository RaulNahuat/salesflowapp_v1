import express from 'express';
import * as businessController from '../controllers/businessController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', businessController.getMyBusiness);
router.put('/', businessController.updateMyBusiness);

export default router;
