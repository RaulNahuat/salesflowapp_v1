import { sequelize } from './config/db.js';

const forceAdd = async () => {
    try {
        console.log('Attempting to add createdAt...');
        try {
            await sequelize.query("ALTER TABLE Sales ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;");
            console.log('SUCCESS: createdAt added.');
        } catch (e) {
            console.log('INFO: createdAt likely exists (' + e.message + ')');
        }

        console.log('Attempting to add updatedAt...');
        try {
            await sequelize.query("ALTER TABLE Sales ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;");
            console.log('SUCCESS: updatedAt added.');
        } catch (e) {
            console.log('INFO: updatedAt likely exists (' + e.message + ')');
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await sequelize.close();
    }
};

forceAdd();
