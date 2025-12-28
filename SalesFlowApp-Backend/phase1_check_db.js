import { sequelize } from './config/db.js';

const checkDatabaseStructure = async () => {
    try {
        console.log("=== PHASE 1: DATABASE FOUNDATION ===\n");

        // Step 1: Check Products table structure
        console.log("Step 1: Checking Products table...");
        const [productColumns] = await sequelize.query(`DESCRIBE Products`);

        console.log("\nProducts table columns:");
        productColumns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Key ? `[${col.Key}]` : ''}`);
        });

        const hasCreatedAt = productColumns.some(col => col.Field === 'createdAt');
        const hasUpdatedAt = productColumns.some(col => col.Field === 'updatedAt');

        if (!hasCreatedAt || !hasUpdatedAt) {
            console.log("\n⚠️  Missing timestamp columns!");
            console.log("   createdAt:", hasCreatedAt ? "✅" : "❌");
            console.log("   updatedAt:", hasUpdatedAt ? "✅" : "❌");
        } else {
            console.log("\n✅ Timestamp columns exist");
        }

        // Step 2: Check if ProductVariants table exists
        console.log("\n\nStep 2: Checking ProductVariants table...");
        try {
            const [variantColumns] = await sequelize.query(`DESCRIBE ProductVariants`);
            console.log("\nProductVariants table columns:");
            variantColumns.forEach(col => {
                console.log(`  - ${col.Field} (${col.Type}) ${col.Key ? `[${col.Key}]` : ''}`);
            });
            console.log("\n✅ ProductVariants table exists");
        } catch (error) {
            console.log("\n❌ ProductVariants table does NOT exist");
            console.log("   Error:", error.message);
        }

        console.log("\n=== PHASE 1 COMPLETE ===");

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
    } finally {
        process.exit();
    }
};

checkDatabaseStructure();
