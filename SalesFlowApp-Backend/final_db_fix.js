import { sequelize } from './config/db.js';

const finalDbFix = async () => {
    try {
        console.log('🚀 Iniciando reparación profunda de la base de datos...');

        // 1. Reparar Raffles
        console.log('Reparando tabla Raffles...');
        try {
            await sequelize.query("ALTER TABLE Raffles ADD COLUMN BusinessId CHAR(36)");
            console.log('✅ BusinessId agregado a Raffles');
        } catch (e) { console.log('ℹ️ BusinessId ya existe o error sutil'); }

        // 2. Reparar RaffleTickets
        console.log('Reparando tabla RaffleTickets...');
        try {
            await sequelize.query("ALTER TABLE RaffleTickets ADD COLUMN RaffleId CHAR(36)");
            console.log('✅ RaffleId agregado a RaffleTickets');
        } catch (e) { console.log('ℹ️ RaffleId ya existe'); }

        try {
            await sequelize.query("ALTER TABLE RaffleTickets ADD COLUMN SaleId CHAR(36)");
            console.log('✅ SaleId agregado a RaffleTickets');
        } catch (e) { console.log('ℹ️ SaleId ya existe'); }

        try {
            await sequelize.query("ALTER TABLE RaffleTickets ADD COLUMN customerId CHAR(36)");
            console.log('✅ customerId agregado a RaffleTickets');
        } catch (e) { console.log('ℹ️ customerId ya existe'); }

        console.log('🎉 ¡Base de datos reparada! Reiniciando servidor...');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error crítico:', error);
        process.exit(1);
    }
};

finalDbFix();
