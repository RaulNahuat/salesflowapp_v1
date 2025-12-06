import { Router } from "express";
import { register, login, verifyUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get('/verify', protect, verifyUser);
router.post('/register', register);
router.post('/login', login);

export default router;