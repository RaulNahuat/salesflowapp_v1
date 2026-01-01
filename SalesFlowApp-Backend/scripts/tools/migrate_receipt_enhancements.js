// Migration script to add new fields to Business and ReceiptToken models
import db from './models/index.js';

const { Business, ReceiptToken, sequelize } = db;

async function migrate() {
    try {
        console.log('Starting migration...');

        // Sync models with alter: true to add new columns without dropping tables
        await Business.sync({ alter: true });
        console.log('✓ Business model synced (added phone, email, address, returnPolicy)');

        await ReceiptToken.sync({ alter: true });
        console.log('✓ ReceiptToken model synced (added viewCount, lastViewedAt)');

        console.log('\n✅ Migration completed successfully!');
        console.log('\nNew fields added:');
        console.log('  Business: phone, email, address, returnPolicy');
        console.log('  ReceiptToken: viewCount, lastViewedAt');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
