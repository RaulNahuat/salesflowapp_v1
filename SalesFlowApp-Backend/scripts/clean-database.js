import db from '../models/index.js';

/**
 * Clean Database - Remove All Data
 * This script deletes all data from all tables while preserving the schema
 * CAUTION: This will permanently delete all data!
 */

async function cleanDatabase() {
    try {
        console.log('⚠️  WARNING: This will delete ALL data from the database!');
        console.log('🔄 Starting database cleanup...\n');

        // Disable foreign key checks temporarily
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Delete data from all tables in correct order (respecting dependencies)
        const tables = [
            'RaffleTickets',
            'Raffles',
            'SaleDetails',
            'Payments',
            'Sales',
            'ReceiptTokens',
            'ProductImages',
            'ProductVariants',
            'Products',
            'Clients',
            'BusinessMembers',
            'Businesses',
            'Users'
        ];

        for (const tableName of tables) {
            const model = db[tableName];
            if (model) {
                // Force delete (including soft-deleted records)
                const count = await model.destroy({
                    where: {},
                    force: true,
                    truncate: false
                });
                console.log(`✓ Deleted ${count} records from ${tableName}`);
            }
        }

        // Re-enable foreign key checks
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✅ Database cleaned successfully!');
        console.log('✅ All tables are now empty and ready for testing');
        console.log('\n📝 Next steps:');
        console.log('   1. Register a new user account');
        console.log('   2. Start adding your test data\n');

        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Cleanup failed:', error.message);
        console.error(error);

        await db.sequelize.close();
        process.exit(1);
    }
}

cleanDatabase();
