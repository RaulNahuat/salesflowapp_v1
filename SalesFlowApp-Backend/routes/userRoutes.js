import express from 'express';
import { getProfile, updateProfile, updatePassword, deleteAccount } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;
