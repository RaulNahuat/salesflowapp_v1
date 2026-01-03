import db from '../models/index.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const Client = db.Client;

// Create and Save a new Client
export const createClient = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, address, notes, status } = req.body;
    const businessId = req.businessId;

    // 1. Basic validation (Manual)
    if (!firstName || firstName.trim() === '') {
        const error = new Error("El nombre del cliente es obligatorio");
        error.status = 400;
        error.field = 'firstName';
        error.type = 'VALIDATION_ERROR';
        throw error;
    }

    // 2. Check if phone already exists for this business (only active clients)
    if (phone && phone.trim() !== '') {
        const existingClient = await Client.findOne({
            where: {
                phone: phone,
                BusinessId: businessId
            }
        });

        if (existingClient) {
            const error = new Error(`Ya existe un cliente activo con el teléfono ${phone}`);
            error.status = 409;
            error.field = 'phone';
            error.type = 'DUPLICATE_ERROR';
            error.details = `El cliente ${existingClient.firstName} ${existingClient.lastName || ''} ya tiene este número registrado`;
            throw error;
        }
    }

    // 3. Create client
    const client = await Client.create({
        firstName,
        lastName,
        email: email === "" ? null : email,
        phone,
        address,
        notes,
        status,
        BusinessId: businessId,
        createdById: req.user.userId
    });

    res.status(201).json({
        success: true,
        message: "Cliente creado exitosamente",
        client
    });
});

// Retrieve all Clients
export const getClients = asyncHandler(async (req, res) => {
    const businessId = req.businessId;

    if (!businessId) {
        const error = new Error("No se identificó el negocio");
        error.status = 400;
        throw error;
    }

    const clients = await Client.findAll({
        where: { BusinessId: businessId },
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        count: clients.length,
        clients
    });
});

// Find a single Client with an id
export const getClient = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    const client = await Client.findOne({
        where: { id: id, BusinessId: businessId }
    });

    if (!client) {
        const error = new Error("No se encontró el cliente");
        error.status = 404;
        throw error;
    }

    res.json({
        success: true,
        client
    });
});

// Update a Client by the id in the request
export const updateClient = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;
    const { firstName, lastName, email, phone, address, notes, status } = req.body;

    // Check if phone belongs to another active client in the same business
    if (phone && phone.trim() !== '') {
        const existingClient = await Client.findOne({
            where: {
                phone: phone,
                BusinessId: businessId,
                id: { [db.Sequelize.Op.ne]: id }
            }
        });

        if (existingClient) {
            const error = new Error(`Ya existe otro cliente con el teléfono ${phone}`);
            error.status = 409;
            error.field = 'phone';
            error.type = 'DUPLICATE_ERROR';
            throw error;
        }
    }

    const [updated] = await Client.update(req.body, {
        where: { id: id, BusinessId: businessId }
    });

    if (!updated) {
        const error = new Error("No se pudo actualizar el cliente");
        error.status = 404;
        throw error;
    }

    const updatedClient = await Client.findByPk(id);
    res.json({
        success: true,
        message: "Cliente actualizado correctamente",
        client: updatedClient
    });
});

// Delete a Client with the specified id in the request (Soft delete)
export const deleteClient = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const businessId = req.businessId;

    const deleted = await Client.destroy({
        where: { id: id, BusinessId: businessId }
    });

    if (!deleted) {
        const error = new Error("No se pudo eliminar el cliente");
        error.status = 404;
        throw error;
    }

    res.json({
        success: true,
        message: "Cliente eliminado correctamente"
    });
});
