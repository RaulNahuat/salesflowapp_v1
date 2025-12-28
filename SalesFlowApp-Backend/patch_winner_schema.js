import { sequelize } from './config/db.js';

const patchWinnerSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected for winner schema patch.');

        // 1. Add drawCriteria to Raffles
        try {
            await sequelize.query("ALTER TABLE Raffles ADD COLUMN drawCriteria INTEGER DEFAULT 1");
            console.log('✅ Added drawCriteria to Raffles');
        } catch (e) {
            console.log('ℹ️ drawCriteria likely exists');
        }

        // 2. Add prizes to Raffles
        try {
            await sequelize.query("ALTER TABLE Raffles ADD COLUMN prizes JSON DEFAULT NULL");
            console.log('✅ Added prizes to Raffles');
        } catch (e) {
            console.log('ℹ️ prizes likely exists');
        }

        // 3. Add place to RaffleTickets
        try {
            await sequelize.query("ALTER TABLE RaffleTickets ADD COLUMN place INTEGER DEFAULT NULL");
            console.log('✅ Added place to RaffleTickets');
        } catch (e) {
            console.log('ℹ️ place likely exists');
        }

        console.log('🎉 Schema patch completed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Patch failed:', error);
        process.exit(1);
    }
};

patchWinnerSchema();
