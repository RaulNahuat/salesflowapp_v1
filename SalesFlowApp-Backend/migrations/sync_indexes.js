// Sync Database Indexes
// This script creates partial unique indexes for phone and email

import db from '../models/index.js';

async function syncIndexes() {
    try {
        console.log('🔄 Syncing database indexes...\n');

        // Step 1: Drop old unique constraints
        console.log('Step 1: Removing old unique constraints...');
        try {
            await db.sequelize.query('ALTER TABLE users DROP INDEX phone');
            console.log('✅ Dropped old phone constraint');
        } catch (error) {
            console.log('ℹ️  Phone constraint already removed');
        }

        try {
            await db.sequelize.query('ALTER TABLE users DROP INDEX email');
            console.log('✅ Dropped old email constraint');
        } catch (error) {
            console.log('ℹ️  Email constraint already removed');
        }

        // Step 2: Create partial unique indexes using raw SQL
        console.log('\nStep 2: Creating partial unique indexes...');

        // Drop indexes if they already exist
        try {
            await db.sequelize.query('DROP INDEX users_phone_active_unique ON users');
        } catch (error) {
            // Index doesn't exist yet, that's fine
        }

        try {
            await db.sequelize.query('DROP INDEX users_email_active_unique ON users');
        } catch (error) {
            // Index doesn't exist yet, that's fine
        }

        // Create new partial indexes
        await db.sequelize.query(`
            CREATE UNIQUE INDEX users_phone_active_unique 
            ON users (phone) 
            WHERE deletedAt IS NULL
        `);
        console.log('✅ Created users_phone_active_unique');

        await db.sequelize.query(`
            CREATE UNIQUE INDEX users_email_active_unique 
            ON users (email) 
            WHERE deletedAt IS NULL
        `);
        console.log('✅ Created users_email_active_unique');

        // Step 3: Verify
        console.log('\nStep 3: Verifying indexes...');
        const [indexes] = await db.sequelize.query(`
            SHOW INDEX FROM users WHERE Key_name LIKE '%active%'
        `);

        console.log('\n📋 Partial indexes created:');
        indexes.forEach(idx => {
            console.log(`  ✓ ${idx.Key_name} on ${idx.Column_name}`);
        });

        console.log('\n✅ Database sync completed successfully!');
        console.log('✅ You can now delete and re-register accounts with the same phone/email');
        console.log('\n⚠️  Restart your backend server to apply changes.');

        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);

        if (error.message.includes('syntax error')) {
            console.error('\n⚠️  Your MySQL version may not support partial indexes (WHERE clause).');
            console.error('Partial indexes require MySQL 8.0.13+ or MariaDB 10.2+');
            console.error('\nCheck your version with: SELECT VERSION();');
        }

        await db.sequelize.close();
        process.exit(1);
    }
}

syncIndexes();
