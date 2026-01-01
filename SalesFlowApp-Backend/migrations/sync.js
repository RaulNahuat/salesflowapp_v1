import db from '../config/db.js';

(async () => {
    console.log('🔄 Syncing database indexes...\n');

    try {
        // Drop old constraints
        console.log('Step 1: Removing old unique constraints...');
        try {
            await db.sequelize.query('ALTER TABLE users DROP INDEX phone');
            console.log('✅ Dropped phone constraint');
        } catch (e) {
            console.log('ℹ️  Phone constraint already removed');
        }

        try {
            await db.sequelize.query('ALTER TABLE users DROP INDEX email');
            console.log('✅ Dropped email constraint');
        } catch (e) {
            console.log('ℹ️  Email constraint already removed');
        }

        // Drop old partial indexes if they exist
        try {
            await db.sequelize.query('DROP INDEX users_phone_active_unique ON users');
        } catch (e) { }

        try {
            await db.sequelize.query('DROP INDEX users_email_active_unique ON users');
        } catch (e) { }

        // Create partial indexes
        console.log('\nStep 2: Creating partial unique indexes...');

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

        // Verify
        console.log('\nStep 3: Verifying...');
        const [indexes] = await db.sequelize.query(`
            SHOW INDEX FROM users WHERE Key_name LIKE '%active%'
        `);

        console.log('\n📋 Indexes created:');
        indexes.forEach(idx => {
            console.log(`  ✓ ${idx.Key_name} on ${idx.Column_name}`);
        });

        console.log('\n✅ Success! You can now reuse phone/email after account deletion');
        console.log('⚠️  Restart your backend server\n');

        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.message.includes('syntax')) {
            console.error('\n⚠️  Your MySQL version may not support partial indexes');
            console.error('Requires MySQL 8.0.13+ or MariaDB 10.2+');
        }

        await db.sequelize.close();
        process.exit(1);
    }
})();
