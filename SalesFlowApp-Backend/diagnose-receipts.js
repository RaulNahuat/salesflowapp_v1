import db from './models/index.js';
import fs from 'fs';

// Disable logging temporarily
db.sequelize.options.logging = false;

async function diagnose() {
    try {
        const results = {};

        // Count all sales
        results.totalSales = await db.Sale.count({ paranoid: false });

        // Count sales with token
        results.salesWithToken = await db.Sale.count({
            where: { receiptTokenId: { [db.Sequelize.Op.ne]: null } },
            paranoid: false
        });

        // Count tokens
        results.totalTokens = await db.ReceiptToken.count();

        // Get last 10 sales
        results.lastSales = await db.Sale.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'total', 'receiptTokenId', 'BusinessId', 'createdAt'],
            paranoid: false
        });

        // Get last 10 tokens
        results.lastTokens = await db.ReceiptToken.findAll({
            limit: 10,
            order: [['id', 'DESC']],
        });

        fs.writeFileSync('diagnosis_results.json', JSON.stringify(results, null, 2));
        console.log('Results written to diagnosis_results.json');
        process.exit(0);
    } catch (error) {
        console.error('Diagnosis failed:', error);
        process.exit(1);
    }
}

diagnose();
