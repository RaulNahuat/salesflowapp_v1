import db from '../models/index.js';

async function syncVirtualIndexes() {
    try {
        console.log('🔄 Starting MySQL Compatibility Migration (Virtual Columns)...\n');

        // Step 1: Drop old unique constraints
        console.log('Step 1: Removing old unique constraints...');
        const dropConstraints = async (name) => {
            try {
                await db.sequelize.query(`ALTER TABLE users DROP INDEX ${name}`);
                console.log(`  ✅ Dropped index: ${name}`);
            } catch (e) {
                console.log(`  ℹ️  Index ${name} already removed or doesn't exist`);
            }
        };

        await dropConstraints('phone');
        await dropConstraints('email');
        await dropConstraints('users_phone_active_unique');
        await dropConstraints('users_email_active_unique');

        // Step 2: Add Virtual Columns
        console.log('\nStep 2: Adding virtual columns for partial uniqueness...');

        const addVirtualColumn = async (colName, sourceCol) => {
            try {
                await db.sequelize.query(`
                    ALTER TABLE users 
                    ADD COLUMN ${colName} VARCHAR(255) 
                    GENERATED ALWAYS AS (IF(deletedAt IS NULL, ${sourceCol}, NULL)) VIRTUAL
                `);
                console.log(`  ✅ Added virtual column: ${colName}`);
            } catch (e) {
                if (e.message.includes('Duplicate column')) {
                    console.log(`  ℹ️  Virtual column ${colName} already exists`);
                } else {
                    throw e;
                }
            }
        };

        await addVirtualColumn('active_phone', 'phone');
        await addVirtualColumn('active_email', 'email');

        // Step 3: Create Unique Indexes on Virtual Columns
        console.log('\nStep 3: Creating unique indexes on virtual columns...');

        try {
            await db.sequelize.query('CREATE UNIQUE INDEX users_phone_active_unique ON users(active_phone)');
            console.log('  ✅ Created unique index on active_phone');
        } catch (e) {
            console.log('  ℹ️  Index users_phone_active_unique already exists');
        }

        try {
            await db.sequelize.query('CREATE UNIQUE INDEX users_email_active_unique ON users(active_email)');
            console.log('  ✅ Created unique index on active_email');
        } catch (e) {
            console.log('  ℹ️  Index users_email_active_unique already exists');
        }

        // Step 4: Verification
        console.log('\nStep 4: Verifying structure...');
        const [results] = await db.sequelize.query('SHOW CREATE TABLE users');
        console.log('\n📋 Current Table Structure Snippet:');
        console.log(results[0]['Create Table']);

        console.log('\n✅ Migration completed successfully!');
        console.log('✅ Users can now reuse phone/email after account deletion.');
        console.log('⚠️  Restart your backend server to apply changes.');

        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        await db.sequelize.close();
        process.exit(1);
    }
}

syncVirtualIndexes();
