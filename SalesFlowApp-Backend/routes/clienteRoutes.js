import express from 'express';
import { getClientes } from '../controllers/clienteController.js';

const router = express.Router();

router.get('/', getClientes);

export default router;