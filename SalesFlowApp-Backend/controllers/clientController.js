import db from '../models/index.js';

const Client = db.Client;

// Create and Save a new Client
export const createClient = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, notes, status } = req.body;
        const businessId = req.businessId;

        // Validate required fields
        if (!firstName || firstName.trim() === '') {
            return res.status(400).json({
                success: false,
                field: 'firstName',
                message: "El nombre del cliente es obligatorio"
            });
        }

        // Check if phone already exists for this business (only active clients)
        if (phone && phone.trim() !== '') {
            const existingClient = await Client.findOne({
                where: {
                    phone: phone,
                    BusinessId: businessId
                }
                // paranoid: true is default, excludes soft-deleted clients
            });

            if (existingClient) {
                return res.status(409).json({
                    success: false,
                    field: 'phone',
                    message: `Ya existe un cliente activo con el teléfono ${phone}`,
                    details: `El cliente ${existingClient.firstName} ${existingClient.lastName || ''} ya tiene este número registrado`,
                    existingClient: {
                        id: existingClient.id,
                        firstName: existingClient.firstName,
                        lastName: existingClient.lastName,
                        phone: existingClient.phone
                    }
                });
            }
        }

        const client = await Client.create({
            firstName,
            lastName,
            email: email === "" ? null : email,
            phone,
            address,
            notes,
            status,
            BusinessId: businessId, // Explicitly set BusinessId
            createdById: req.user.userId // Track who created the client
        });

        res.status(201).json({
            success: true,
            message: "Cliente creado exitosamente",
            client
        });
    } catch (error) {
        console.error('Error creating client:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => {
                // Provide user-friendly messages for common validations
                let message = err.message;
                if (err.validatorKey === 'isEmail') {
                    message = `El email "${err.value}" no es válido. Por favor ingresa un email correcto (ej. usuario@ejemplo.com)`;
                } else if (err.validatorKey === 'notNull') {
                    message = `El campo ${err.path} es obligatorio`;
                } else if (err.validatorKey === 'notEmpty') {
                    message = `El campo ${err.path} no puede estar vacío`;
                }
                return {
                    field: err.path,
                    message: message
                };
            });

            return res.status(400).json({
                success: false,
                message: validationErrors[0].message, // First error as main message
                field: validationErrors[0].field,
                errors: validationErrors
            });
        }

        // Handle unique constraint violations
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path || 'unknown';
            const value = error.errors[0]?.value || '';
            return res.status(409).json({
                success: false,
                field: field,
                message: `Ya existe un cliente con ${field === 'phone' ? 'el teléfono' : field === 'email' ? 'el email' : 'este'} ${value}`
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Error al crear el cliente. Por favor intenta nuevamente."
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
        const { phone } = req.body;

        // Check if phone already exists for another active client in this business
        if (phone && phone.trim() !== '') {
            const existingClient = await Client.findOne({
                where: {
                    phone: phone,
                    BusinessId: businessId,
                    id: { [db.Sequelize.Op.ne]: id } // Exclude current client
                }
                // paranoid: true is default, excludes soft-deleted clients
            });

            if (existingClient) {
                return res.status(409).json({
                    success: false,
                    field: 'phone',
                    message: `Ya existe otro cliente activo con el teléfono ${phone}`,
                    details: `El cliente ${existingClient.firstName} ${existingClient.lastName || ''} ya tiene este número registrado`,
                    existingClient: {
                        id: existingClient.id,
                        firstName: existingClient.firstName,
                        lastName: existingClient.lastName,
                        phone: existingClient.phone
                    }
                });
            }
        }

        const [num] = await Client.update(req.body, {
            where: { id: id, BusinessId: businessId }
        });

        if (num == 1) {
            res.json({
                success: true,
                message: "Cliente actualizado correctamente"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No se encontró el cliente o no tienes permisos para actualizarlo"
            });
        }
    } catch (error) {
        console.error('Error updating client:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Error al actualizar el cliente. Por favor intenta nuevamente."
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
                success: true,
                message: "Cliente eliminado correctamente"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No se encontró el cliente o no tienes permisos para eliminarlo"
            });
        }
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({
            success: false,
            message: "No se pudo eliminar el cliente. Por favor intenta nuevamente."
        });
    }
};
