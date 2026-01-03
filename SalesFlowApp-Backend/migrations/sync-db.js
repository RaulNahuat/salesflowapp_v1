import db from '../models/index.js';

/**
 * Sync Database Schema
 * This script synchronizes the database schema with the Sequelize models
 * It will create missing tables and indexes
 */

async function syncDatabase() {
    try {
        console.log('🔄 Synchronizing database schema...\n');

        // Sync all models with alter: true to update existing tables
        await db.sequelize.sync({ alter: true });

        console.log('✅ Database schema synchronized successfully!\n');

        // Verify User indexes
        console.log('📋 Verifying User table indexes...');
        const [indexes] = await db.sequelize.query(`
            SHOW INDEX FROM users
        `);

        const uniqueIndexes = indexes.filter(idx =>
            idx.Non_unique === 0 &&
            (idx.Column_name === 'email' || idx.Column_name === 'phone')
        );

        console.log('\n✓ Unique indexes on users table:');
        uniqueIndexes.forEach(idx => {
            console.log(`  - ${idx.Key_name} on column '${idx.Column_name}'`);
        });

        console.log('\n✅ All done! Your database is ready to use.');

        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);
        console.error(error);

        await db.sequelize.close();
        process.exit(1);
    }
}

syncDatabase();
