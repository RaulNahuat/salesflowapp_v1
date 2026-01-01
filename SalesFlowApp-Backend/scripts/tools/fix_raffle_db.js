import { sequelize } from './config/db.js';

const fixRaffleSystem = async () => {
    try {
        console.log('👷 Iniciando corrección del sistema de sorteos...');

        // 1. Raffles Timestamps
        console.log('Checking Raffles...');
        try { await sequelize.query("ALTER TABLE Raffles ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); console.log('✅ Added createdAt to Raffles'); } catch (e) { console.log('ℹ️ Raffles.createdAt likely exists'); }
        try { await sequelize.query("ALTER TABLE Raffles ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); console.log('✅ Added updatedAt to Raffles'); } catch (e) { console.log('ℹ️ Raffles.updatedAt likely exists'); }

        // 2. RaffleTickets Timestamps
        console.log('Checking RaffleTickets...');
        try { await sequelize.query("ALTER TABLE RaffleTickets ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); console.log('✅ Added createdAt to RaffleTickets'); } catch (e) { console.log('ℹ️ RaffleTickets.createdAt likely exists'); }
        try { await sequelize.query("ALTER TABLE RaffleTickets ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); console.log('✅ Added updatedAt to RaffleTickets'); } catch (e) { console.log('ℹ️ RaffleTickets.updatedAt likely exists'); }

        // 3. Rename customerId to clientId if possible
        try {
            await sequelize.query("ALTER TABLE RaffleTickets CHANGE COLUMN customerId clientId CHAR(36)");
            console.log('✅ Renamed customerId to clientId in RaffleTickets');
        } catch (e) {
            console.log('ℹ️ Could not rename customerId, it might have a FK or be already renamed.');
        }

        console.log('🎉 Done!');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal:', error);
        if (sequelize) await sequelize.close();
        process.exit(1);
    }
};

fixRaffleSystem();
