import db from '../models/index.js';

const Client = db.Client;

// Create and Save a new Client
export const createClient = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, notes, status } = req.body;
        const businessId = req.businessId;

        if (!firstName) {
            return res.status(400).json({
                message: "El nombre es obligatorio"
            });
        }

        const client = await Client.create({
            firstName,
            lastName,
            email: email === "" ? null : email,
            phone,
            address,
            notes,
            status,
            BusinessId: businessId // Explicitly set BusinessId
        });

        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Error al crear el cliente"
        });
    }
};

// Retrieve all Clients
export const getClients = async (req, res) => {
    try {
        const businessId = req.businessId;
        console.log("getClients request. BusinessId:", businessId);

        if (!businessId) {
            return res.status(400).json({
                message: "Error de sesión: No se identificó el negocio. Por favor cierra sesión e inicia nuevamente."
            });
        }

        if (!Client) {
            return res.status(500).json({
                message: "Error interno: El modelo de Clientes no está cargado."
            });
        }

        const clients = await Client.findAll({
            where: { BusinessId: businessId },
            order: [['createdAt', 'DESC']]
        });
        res.json(clients);
    } catch (error) {
        console.error("Error in getClients:", error);
        res.status(500).json({
            message: "Error al obtener clientes"
        });
    }
};

// Find a single Client
export const getClient = async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    try {
        const client = await Client.findOne({
            where: { id: id, BusinessId: businessId }
        });

        if (client) {
            res.json(client);
        } else {
            res.status(404).json({
                message: `No se encontró el cliente con id=${id}`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error obteniendo el cliente"
        });
    }
};

// Update a Client
export const updateClient = async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    try {
        const [num] = await Client.update(req.body, {
            where: { id: id, BusinessId: businessId }
        });

        if (num == 1) {
            res.json({
                message: "Cliente actualizado correctamente."
            });
        } else {
            res.json({
                message: `No se puede actualizar id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error actualizando cliente"
        });
    }
};

// Delete a Client
export const deleteClient = async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    try {
        const num = await Client.destroy({
            where: { id: id, BusinessId: businessId }
        });

        if (num == 1) {
            res.json({
                message: "Cliente eliminado correctamente!"
            });
        } else {
            res.json({
                message: `No se puede eliminar id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "No se pudo eliminar el cliente"
        });
    }
};
