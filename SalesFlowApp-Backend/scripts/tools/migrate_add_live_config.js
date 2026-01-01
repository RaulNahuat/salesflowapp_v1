import { sequelize } from './config/db.js';
import db from './models/index.js';

const addLiveConfigFields = async () => {
    try {
        console.log('Adding weekStartDay and liveDays columns to Businesses table...');

        // Check if columns exist and add them if they don't
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'Businesses' 
            AND COLUMN_NAME IN ('weekStartDay', 'liveDays')
        `);

        const existingColumns = results.map(r => r.COLUMN_NAME);

        if (!existingColumns.includes('weekStartDay')) {
            await sequelize.query(`
                ALTER TABLE Businesses 
                ADD COLUMN weekStartDay INTEGER DEFAULT 1
            `);
            console.log('✓ weekStartDay column added');
        } else {
            console.log('✓ weekStartDay column already exists');
        }

        if (!existingColumns.includes('liveDays')) {
            await sequelize.query(`
                ALTER TABLE Businesses 
                ADD COLUMN liveDays JSON
            `);
            console.log('✓ liveDays column added');
        } else {
            console.log('✓ liveDays column already exists');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

addLiveConfigFields();
