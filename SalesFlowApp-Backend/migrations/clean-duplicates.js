import db from '../models/index.js';

/**
 * Clean Duplicate Users
 * This script modifies email/phone of soft-deleted users to allow unique indexes
 */

async function cleanDuplicates() {
    try {
        console.log('🧹 Cleaning duplicate users...\n');

        // Find all soft-deleted users
        const deletedUsers = await db.User.findAll({
            paranoid: false,
            where: {
                deletedAt: {
                    [db.Sequelize.Op.ne]: null
                }
            }
        });

        console.log(`Found ${deletedUsers.length} soft-deleted users\n`);

        // Modify email and phone for each deleted user
        for (const user of deletedUsers) {
            const timestamp = Date.now();
            const newEmail = user.email ? `deleted_${timestamp}_${user.email}` : null;
            const newPhone = user.phone ? `deleted_${timestamp}_${user.phone}` : null;

            await db.sequelize.query(
                'UPDATE users SET email = ?, phone = ? WHERE id = ?',
                {
                    replacements: [newEmail, newPhone, user.id],
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );

            console.log(`✓ Cleaned user: ${user.email} -> ${newEmail}`);
        }

        console.log('\n✅ All duplicates cleaned!');
        console.log('✅ You can now run: npm run sync-db\n');

        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Cleaning failed:', error.message);
        console.error(error);

        await db.sequelize.close();
        process.exit(1);
    }
}

cleanDuplicates();
