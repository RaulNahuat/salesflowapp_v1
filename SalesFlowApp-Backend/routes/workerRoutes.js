import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createWorker, getWorkers, updateWorker, deleteWorker } from '../controllers/workerController.js';

const router = express.Router();

// All routes require auth
router.use(protect);

router.post('/', createWorker);
router.get('/', getWorkers);
router.put('/:id', updateWorker);
router.delete('/:id', deleteWorker);

export default router;
