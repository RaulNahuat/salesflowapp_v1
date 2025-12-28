import { sequelize } from './config/db.js';

const fixSchema = async () => {
    try {
        console.log('--- Checking Sales Table Columns ---');
        const [results] = await sequelize.query("SHOW COLUMNS FROM Sales;");
        const columns = results.map(c => c.Field);
        console.log('Current Columns:', columns);

        if (!columns.includes('createdAt')) {
            console.log('MISSING createdAt! Adding it now...');
            await sequelize.query("ALTER TABLE Sales ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;");
            console.log('createdAt added.');
        } else {
            console.log('createdAt already exists.');
        }

        if (!columns.includes('updatedAt')) {
            console.log('MISSING updatedAt! Adding it now...');
            await sequelize.query("ALTER TABLE Sales ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;");
            console.log('updatedAt added.');
        } else {
            console.log('updatedAt already exists.');
        }

        console.log('--- Verification Complete ---');
    } catch (error) {
        console.error('Error fixing schema:', error);
    } finally {
        await sequelize.close();
    }
};

fixSchema();
