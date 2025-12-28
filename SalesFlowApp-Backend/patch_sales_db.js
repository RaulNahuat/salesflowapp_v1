import { sequelize } from './config/db.js';
import db from './models/index.js';

const patchSalesDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Alter SaleDetail to add subtotal
        await db.SaleDetail.sync({ alter: true });
        console.log('SaleDetail table updated.');

        // Alter Sale to check for new foreign keys if needed (though usually assoc handles it)
        // But force sync specific tables to be sure
        await db.Sale.sync({ alter: true });
        console.log('Sale table updated.');

        console.log('Database patch completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to patch database:', error);
        process.exit(1);
    }
};

patchSalesDB();
