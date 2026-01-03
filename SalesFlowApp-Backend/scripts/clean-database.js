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

        // List of tables to truncate (in correct order)
        const tableNames = [
            'raffletickets',
            'raffles',
            'saledetails',
            'payments',
            'sales',
            'receipttokens',
            'productimages',
            'productvariants',
            'products',
            'clients',
            'businessmembers',
            'businesses',
            'users'
        ];

        let totalDeleted = 0;

        for (const tableName of tableNames) {
            try {
                // Use raw SQL TRUNCATE for complete cleanup
                await db.sequelize.query(`TRUNCATE TABLE ${tableName}`);
                console.log(`✓ Cleaned table: ${tableName}`);
                totalDeleted++;
            } catch (error) {
                // If TRUNCATE fails, try DELETE
                try {
                    const [result] = await db.sequelize.query(`DELETE FROM ${tableName}`);
                    console.log(`✓ Deleted all records from: ${tableName}`);
                    totalDeleted++;
                } catch (deleteError) {
                    console.log(`⚠️  Skipped ${tableName}: ${deleteError.message}`);
                }
            }
        }

        // Re-enable foreign key checks
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log(`\n✅ Database cleaned successfully! (${totalDeleted} tables cleaned)`);
        console.log('✅ All tables are now empty and ready for testing');
        console.log('\n📝 Next steps:');
        console.log('   1. Clear your browser cookies/cache or logout');
        console.log('   2. Register a new user account');
        console.log('   3. Start adding your test data\n');

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
