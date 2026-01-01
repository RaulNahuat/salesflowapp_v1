import db from './models/index.js';
import { sequelize } from './config/db.js';

const forceSync = async () => {
    try {
        console.log("🔄 Force syncing ProductVariant table...\n");

        // Drop and recreate ProductVariants table
        await db.ProductVariant.sync({ force: true });

        console.log("✅ ProductVariant table recreated successfully!\n");

        // Verify structure
        const [columns] = await sequelize.query(`DESCRIBE ProductVariants`);
        console.log("Table structure:");
        columns.forEach(c => console.log(`  ${c.Field}: ${c.Type} ${c.Key ? `(${c.Key})` : ''}`));

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error.stack);
    } finally {
        process.exit();
    }
};

forceSync();
