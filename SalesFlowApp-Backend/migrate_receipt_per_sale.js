// Migration script to add receiptTokenId field to Sales table
import db from './models/index.js';

const { Sale, sequelize } = db;

async function migrate() {
    try {
        console.log('Starting migration to add receiptTokenId to Sales...');

        // Sync Sale model with alter: true to add new column
        await Sale.sync({ alter: true });
        console.log('✓ Sale model synced (added receiptTokenId field)');

        console.log('\n✅ Migration completed successfully!');
        console.log('\nNew field added:');
        console.log('  Sale: receiptTokenId (UUID, nullable)');
        console.log('\nNote: Existing sales will have NULL receiptTokenId.');
        console.log('New sales will automatically generate receipt tokens.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
