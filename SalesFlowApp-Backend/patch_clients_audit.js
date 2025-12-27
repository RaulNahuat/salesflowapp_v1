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

const patchClients = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Add createdById column
        try {
            await sequelize.query(`
                ALTER TABLE Clients 
                ADD COLUMN createdById CHAR(36) NULL;
            `);
            console.log('✅ Column createdById added to Clients.');
        } catch (error) {
            if (error.original && error.original.errno === 1060) {
                console.log('ℹ️ Column createdById already exists.');
            } else {
                console.error('❌ Error adding createdById:', error.message);
            }
        }
    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await sequelize.close();
    }
};

patchClients();
