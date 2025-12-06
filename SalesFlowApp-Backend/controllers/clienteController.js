import { Cliente } from "../models/Cliente.js";


export const getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            where: { usuario_id: req.user.usuario_id }
        });
        res.status(200).json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
}