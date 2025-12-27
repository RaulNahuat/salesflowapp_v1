import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: console.log,
    }
);

const patchDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // 1. Add permissions column
        try {
            await sequelize.query(`
                ALTER TABLE BusinessMembers 
                ADD COLUMN permissions JSON DEFAULT NULL;
            `);
            console.log('✅ Column permissions added.');
        } catch (error) {
            // Ignore if exists (Error code 1060: Duplicate column name)
            if (error.original && error.original.errno === 1060) {
                console.log('ℹ️ Column permissions already exists.');
            } else {
                console.error('❌ Error adding permissions:', error.message);
            }
        }

        // 2. Add status column
        try {
            await sequelize.query(`
                ALTER TABLE BusinessMembers 
                ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';
            `);
            console.log('✅ Column status added.');
        } catch (error) {
            if (error.original && error.original.errno === 1060) {
                console.log('ℹ️ Column status already exists.');
            } else {
                console.error('❌ Error adding status:', error.message);
            }
        }

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await sequelize.close();
    }
};

patchDatabase();
