// Migration Runner Script
// This script executes the partial unique index migration using your existing DB connection

import db from '../config/db.js';

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Add partial unique indexes...\n');

        // Step 1: Drop existing unique constraints
        console.log('Step 1: Dropping existing unique constraints...');

        try {
            await db.sequelize.query('ALTER TABLE users DROP INDEX phone');
            console.log('✅ Dropped phone unique constraint');
        } catch (error) {
            console.log('⚠️  Phone constraint may not exist or already dropped:', error.message);
        }

        try {
            await db.sequelize.query('ALTER TABLE users DROP INDEX email');
            console.log('✅ Dropped email unique constraint');
        } catch (error) {
            console.log('⚠️  Email constraint may not exist or already dropped:', error.message);
        }

        // Step 2: Create partial unique indexes
        console.log('\nStep 2: Creating partial unique indexes...');

        await db.sequelize.query(`
            CREATE UNIQUE INDEX users_phone_active_unique 
            ON users (phone) 
            WHERE deletedAt IS NULL
        `);
        console.log('✅ Created users_phone_active_unique index');

        await db.sequelize.query(`
            CREATE UNIQUE INDEX users_email_active_unique 
            ON users (email) 
            WHERE deletedAt IS NULL
        `);
        console.log('✅ Created users_email_active_unique index');

        // Step 3: Verify indexes
        console.log('\nStep 3: Verifying indexes...');
        const [indexes] = await db.sequelize.query(`
            SHOW INDEX FROM users WHERE Key_name LIKE '%active%'
        `);

        console.log('\n📋 Active indexes found:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.Key_name} on column ${idx.Column_name}`);
        });

        console.log('\n✅ Migration completed successfully!');
        console.log('\n⚠️  IMPORTANT: Restart your backend server for changes to take effect.');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the migration
runMigration();
