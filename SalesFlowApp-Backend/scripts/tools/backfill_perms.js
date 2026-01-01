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

const backfillPermissions = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Update NULL permissions to default JSON
        const defaultPerms = JSON.stringify({ pos: true, products: true, reports: true, settings: true }); // Owner default

        // Note: For existing users (who are likely owners), we give full permissions.
        // If we have a role column, we could differentiate, but currently all are owners or we just added role 'employee'.
        // Existing ones are 'customer' by default in the model definition? No, we just added the column.

        // Update all NULL permissions
        await sequelize.query(`
            UPDATE BusinessMembers 
            SET permissions = '${defaultPerms}', status = 'active', role = 'owner'
            WHERE permissions IS NULL;
        `);

        console.log('✅ Backfilled permissions for existing users.');

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await sequelize.close();
    }
};

backfillPermissions();
