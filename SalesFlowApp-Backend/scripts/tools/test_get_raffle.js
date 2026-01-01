import db from './models/index.js';

const testGetRaffle = async () => {
    try {
        console.log('🔍 Probando getRaffle query...');

        const raffleId = '68fdd412-feb5-4daa-9a5d-d8d1be3a9df4'; // Del error del usuario

        const raffle = await db.Raffle.findOne({
            where: { id: raffleId },
            include: [{
                model: db.RaffleTicket,
                include: [{
                    model: db.Client,
                    as: 'Owner',
                    attributes: ['id', 'firstName', 'lastName', 'phone']
                }, {
                    model: db.Sale,
                    attributes: ['id', 'total', 'createdAt']
                }]
            }]
        });

        console.log('✅ Query exitosa');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en query:', error);
        process.exit(1);
    }
};

testGetRaffle();
