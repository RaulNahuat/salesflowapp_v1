import express from 'express';
import authController from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authController.verifyToken);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
