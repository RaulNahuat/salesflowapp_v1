import { sequelize } from './config/db.js';

const checkTables = async () => {
    try {
        console.log("Checking database tables...\n");

        // Check if ProductVariants table exists
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME LIKE '%Product%'
        `);

        console.log("Product-related tables:");
        tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));

        // Check ProductVariants structure
        const [columns] = await sequelize.query(`
            DESCRIBE ProductVariants
        `);

        console.log("\nProductVariants columns:");
        columns.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit();
    }
};

checkTables();
