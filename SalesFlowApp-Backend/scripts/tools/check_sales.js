import { sequelize } from './config/db.js';

const checkSales = async () => {
    try {
        const [results] = await sequelize.query(`
            SELECT id, BusinessId, total, createdAt 
            FROM Sales 
            ORDER BY createdAt DESC 
            LIMIT 10
        `);

        console.log('=== ÚLTIMAS VENTAS EN LA DB ===');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSales();
