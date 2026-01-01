import { sequelize } from './config/db.js';

const updateRaffleSchema = async () => {
    try {
        console.log('🔄 Actualizando esquema de Raffles...');

        // Check if ticketPrice column exists
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'Raffles' 
            AND COLUMN_NAME = 'ticketPrice';
        `);

        if (results.length === 0) {
            // Add ticketPrice column
            await sequelize.query(`
                ALTER TABLE Raffles 
                ADD COLUMN ticketPrice DECIMAL(10,2) NOT NULL DEFAULT 100.00;
            `);
            console.log('✅ Columna ticketPrice agregada a Raffles');
        } else {
            console.log('ℹ️  Columna ticketPrice ya existe');
        }

        console.log('🎉 ¡Actualización completada!');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error actualizando esquema:', error);
        await sequelize.close();
        process.exit(1);
    }
};

updateRaffleSchema();
