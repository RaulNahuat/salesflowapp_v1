import db from '../models/index.js';

const Raffle = db.Raffle;
const RaffleTicket = db.RaffleTicket;
const Sale = db.Sale;
const Client = db.Client;

// Create Raffle
export const createRaffle = async (req, res) => {
    try {
        const { motive, prize, ticketPrice, drawDate } = req.body;
        const businessId = req.user?.businessId || req.businessId;

        if (!motive || !ticketPrice) {
            return res.status(400).json({
                message: "El motivo y el precio por boleto son obligatorios"
            });
        }

        const raffle = await Raffle.create({
            motive,
            prize,
            ticketPrice,
            drawDate,
            BusinessId: businessId
        });

        res.status(201).json(raffle);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Error al crear el sorteo"
        });
    }
};

// Get all Raffles
export const getRaffles = async (req, res) => {
    try {
        const businessId = req.user?.businessId || req.businessId;

        const raffles = await Raffle.findAll({
            where: { BusinessId: businessId },
            include: [{
                model: RaffleTicket,
                attributes: ['id'],
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        // Add ticket count to each raffle
        const rafflesWithCount = raffles.map(raffle => {
            const raffleData = raffle.toJSON();
            raffleData.ticketCount = raffleData.RaffleTickets ? raffleData.RaffleTickets.length : 0;
            delete raffleData.RaffleTickets;
            return raffleData;
        });

        res.json(rafflesWithCount);
    } catch (error) {
        res.status(500).json({
            message: "Error obteniendo sorteos"
        });
    }
};

// Get single Raffle with tickets
export const getRaffle = async (req, res) => {
    const id = req.params.id;
    const businessId = req.user?.businessId || req.businessId;

    try {
        const raffle = await Raffle.findOne({
            where: { id: id, BusinessId: businessId },
            include: [{
                model: RaffleTicket,
                include: [{
                    model: Client,
                    as: 'Owner',
                    attributes: ['id', 'firstName', 'lastName', 'phone'],
                    paranoid: false
                }, {
                    model: Sale,
                    attributes: ['id', 'total', 'createdAt']
                }]
            }]
        });

        if (raffle) {
            res.json(raffle);
        } else {
            res.status(404).json({
                message: `No se encontró el sorteo con id=${id}`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error obteniendo el sorteo"
        });
    }
};

// Update Raffle
export const updateRaffle = async (req, res) => {
    const id = req.params.id;
    const businessId = req.user?.businessId || req.businessId;

    try {
        const [num] = await Raffle.update(req.body, {
            where: { id: id, BusinessId: businessId }
        });

        if (num == 1) {
            res.json({
                message: "Sorteo actualizado correctamente."
            });
        } else {
            res.json({
                message: `No se puede actualizar el sorteo con id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error actualizando sorteo"
        });
    }
};

// Delete Raffle
export const deleteRaffle = async (req, res) => {
    const id = req.params.id;
    const businessId = req.user?.businessId || req.businessId;

    try {
        const num = await Raffle.destroy({
            where: { id: id, BusinessId: businessId }
        });

        if (num == 1) {
            res.json({
                message: "Sorteo eliminado correctamente."
            });
        } else {
            res.json({
                message: `No se puede eliminar el sorteo con id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error eliminando sorteo"
        });
    }
};

// Draw Winner
export const drawWinner = async (req, res) => {
    const id = req.params.id;
    const businessId = req.user?.businessId || req.businessId;
    const { place = 1 } = req.body; // Default to 1st place

    try {
        // Get raffle
        const raffle = await Raffle.findOne({
            where: { id: id, BusinessId: businessId }
        });

        if (!raffle) {
            return res.status(404).json({ message: "Sorteo no encontrado" });
        }

        // Get all tickets NOT yet marked as winners
        const tickets = await RaffleTicket.findAll({
            where: { RaffleId: id, isWinner: false },
            include: [{
                model: Client,
                as: 'Owner',
                attributes: ['id', 'firstName', 'lastName', 'phone'],
                paranoid: false
            }]
        });

        if (tickets.length === 0) {
            return res.status(400).json({
                message: "No hay boletos disponibles para este sorteo (o todos ya ganaron)"
            });
        }

        const criteria = raffle.drawCriteria || 1;
        const drawHistory = [];
        let winningTicket = null;

        // Perform draws based on criteria
        // If criteria is 5, we draw 5 times, the 5th is the winner.
        const availableTickets = [...tickets];

        for (let i = 1; i <= criteria; i++) {
            if (availableTickets.length === 0) break;

            const randomIndex = Math.floor(Math.random() * availableTickets.length);
            const drawn = availableTickets.splice(randomIndex, 1)[0];

            drawHistory.push({
                attempt: i,
                ticketNumber: drawn.number,
                client: drawn.Owner
                    ? `${drawn.Owner.firstName} ${drawn.Owner.lastName}${drawn.Owner.deletedAt ? ' (Eliminado)' : ''}`
                    : 'Anónimo',
                isRealWinner: i === criteria
            });

            if (i === criteria) {
                winningTicket = drawn;
            }
        }

        if (!winningTicket) {
            // Fallback if tickets ran out before criteria (unlikely but safe)
            winningTicket = drawHistory[drawHistory.length - 1];
        }

        // Mark as winner
        const ticketToUpdate = await RaffleTicket.findByPk(winningTicket.id || winningTicket.ticketId);
        await ticketToUpdate.update({
            isWinner: true,
            place: place
        });

        // Check if all places are filled to finish raffle
        // For now, let's say drawing 1st place finishes if no multi-prize configured
        // Or if the user explicitly finishes it.
        if (place === 1) {
            await raffle.update({ status: 'finished' });
        }

        res.json({
            message: `¡Sorteo realizado! El ganador es el boleto número ${drawHistory[drawHistory.length - 1].ticketNumber}`,
            winner: winningTicket,
            drawHistory: drawHistory,
            place
        });
    } catch (error) {
        console.error('Error in drawWinner:', error);
        res.status(500).json({
            message: "Error realizando el sorteo",
            error: error.message
        });
    }
};

// Assign tickets to sale (called automatically when creating a sale)
export const assignTicketsToSale = async (saleId, clientId, saleTotal) => {
    try {
        const sale = await Sale.findByPk(saleId, {
            include: [{
                model: db.Business,
                attributes: ['id']
            }]
        });

        if (!sale) return [];

        const activeRaffles = await Raffle.findAll({
            where: {
                BusinessId: sale.BusinessId,
                status: 'active'
            }
        });

        const allEarnedTickets = [];

        for (const raffle of activeRaffles) {
            const ticketsEarned = Math.floor(saleTotal / raffle.ticketPrice);

            if (ticketsEarned > 0) {
                const lastTicket = await RaffleTicket.findOne({
                    where: { RaffleId: raffle.id },
                    order: [['number', 'DESC']]
                });

                let nextNumber = lastTicket ? lastTicket.number + 1 : 1;

                const ticketsToCreate = [];
                for (let i = 0; i < ticketsEarned; i++) {
                    ticketsToCreate.push({
                        number: nextNumber + i,
                        RaffleId: raffle.id,
                        SaleId: saleId,
                        clientId: clientId
                    });
                }

                const createdTickets = await RaffleTicket.bulkCreate(ticketsToCreate);
                allEarnedTickets.push({
                    raffleMotive: raffle.motive,
                    tickets: createdTickets.map(t => t.number)
                });
            }
        }
        return allEarnedTickets;
    } catch (error) {
        console.error('Error assigning tickets:', error);
        return [];
    }
};

// Get tickets for a specific client
export const getTicketsByClient = async (req, res) => {
    const { clientId } = req.params;
    const businessId = req.user?.businessId || req.businessId;

    try {
        const tickets = await RaffleTicket.findAll({
            where: { clientId: clientId },
            include: [
                {
                    model: Raffle,
                    where: { BusinessId: businessId },
                    attributes: ['motive', 'prize', 'drawDate', 'status']
                },
                {
                    model: Sale,
                    attributes: ['id', 'total', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching client tickets:', error);
        res.status(500).json({
            message: "Error obteniendo los boletos del cliente"
        });
    }
};

// Generate tickets in batch
export const generateBatchTickets = async (req, res) => {
    const { id: raffleId } = req.params;
    const { startDate, endDate, clientIds } = req.body;
    const businessId = req.user?.businessId || req.businessId;

    const t = await db.sequelize.transaction();

    try {
        const raffle = await Raffle.findByPk(raffleId, { transaction: t });
        if (!raffle) {
            await t.rollback();
            return res.status(404).json({ message: "Sorteo no encontrado" });
        }

        if (!startDate || !endDate) {
            await t.rollback();
            return res.status(400).json({ message: "Debe proporcionar un rango de fechas" });
        }

        const saleWhere = {
            BusinessId: businessId,
            createdAt: {
                [db.Sequelize.Op.between]: [
                    new Date(startDate),
                    new Date(new Date(endDate).setHours(23, 59, 59, 999))
                ]
            }
        };

        if (clientIds && clientIds.length > 0 && clientIds[0] !== '') {
            saleWhere.clientId = clientIds;
        }

        const sales = await Sale.findAll({
            where: saleWhere,
            transaction: t
        });

        let totalTicketsCreated = 0;
        const resultSummary = [];

        for (const sale of sales) {
            const totalTicketsNeeded = Math.floor(sale.total / raffle.ticketPrice);
            if (totalTicketsNeeded <= 0) continue;

            const existingCount = await RaffleTicket.count({
                where: { SaleId: sale.id, RaffleId: raffleId },
                transaction: t
            });

            const toCreate = totalTicketsNeeded - existingCount;

            if (toCreate > 0) {
                const lastTicket = await RaffleTicket.findOne({
                    where: { RaffleId: raffleId },
                    order: [['number', 'DESC']],
                    transaction: t,
                    lock: true // Ensure we don't have race conditions
                });

                let nextNumber = lastTicket ? lastTicket.number + 1 : 1;

                const ticketsToCreate = [];
                for (let i = 0; i < toCreate; i++) {
                    ticketsToCreate.push({
                        number: nextNumber++,
                        RaffleId: raffleId,
                        SaleId: sale.id,
                        clientId: sale.clientId || null
                    });
                }

                await RaffleTicket.bulkCreate(ticketsToCreate, { transaction: t });
                totalTicketsCreated += toCreate;
                resultSummary.push({
                    saleId: sale.id,
                    total: sale.total,
                    tickets: toCreate
                });
            }
        }

        await t.commit();

        res.json({
            message: `Proceso completado. Se generaron ${totalTicketsCreated} boletos nuevos.`,
            totalGenerated: totalTicketsCreated,
            details: resultSummary
        });

    } catch (error) {
        if (t) await t.rollback();
        console.error('Error generating batch tickets:', error);
        res.status(500).json({
            message: "Error al generar boletos en lote",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get sales eligible for tickets (Mapping)
export const getEligibleSales = async (req, res) => {
    const { id: raffleId } = req.params;
    const { startDate, endDate } = req.query;
    const clientIds = req.query.clientIds || req.query['clientIds[]'];
    const businessId = req.user?.businessId || req.businessId;

    try {
        const raffle = await Raffle.findByPk(raffleId);
        if (!raffle) {
            return res.status(404).json({ message: "Sorteo no encontrado" });
        }

        const saleWhere = {
            BusinessId: businessId
        };

        if (startDate && endDate) {
            saleWhere.createdAt = {
                [db.Sequelize.Op.between]: [
                    new Date(startDate),
                    new Date(new Date(endDate).setHours(23, 59, 59, 999))
                ]
            };
        }

        if (clientIds && clientIds !== '' && clientIds !== '[]') {
            const ids = Array.isArray(clientIds) ? clientIds : clientIds.split(',');
            const filteredIds = ids.filter(id => id && id !== '');
            if (filteredIds.length > 0) {
                saleWhere.clientId = filteredIds;
            }
        }

        const sales = await Sale.findAll({
            where: saleWhere,
            include: [
                {
                    model: Client,
                    attributes: ['firstName', 'lastName'],
                    paranoid: false
                },
                {
                    model: RaffleTicket,
                    as: 'RaffleTickets',
                    where: { RaffleId: raffleId },
                    required: false,
                    attributes: ['id']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const mapping = sales.map(sale => {
            const ticketsEarned = Math.floor(sale.total / raffle.ticketPrice);
            const generatedCount = sale.RaffleTickets ? sale.RaffleTickets.length : 0;

            return {
                id: sale.id,
                total: sale.total,
                createdAt: sale.createdAt,
                client: sale.Client
                    ? `${sale.Client.firstName} ${sale.Client.lastName}${sale.Client.deletedAt ? ' (Eliminado)' : ''}`
                    : 'Desconocido',
                ticketsEarned,
                generatedCount,
                pendingTickets: Math.max(0, ticketsEarned - generatedCount)
            };
        }).filter(item => item.ticketsEarned > 0); // Only show sales that qualify for at least 1 ticket

        res.json(mapping);

    } catch (error) {
        console.error('Error mapping eligible sales:', error);
        res.status(500).json({ message: "Error al mapear las ventas para boletos" });
    }
};
