import { sequelize } from './config/db.js';
import fs from 'fs';

const checkAndFix = async () => {
    let log = "=== PHASE 1: DATABASE FOUNDATION ===\n\n";

    try {
        // Check Products table
        log += "Checking Products table...\n";
        const [productColumns] = await sequelize.query(`DESCRIBE Products`);

        log += "\nProducts columns:\n";
        productColumns.forEach(col => {
            log += `  ${col.Field.padEnd(15)} ${col.Type.padEnd(20)} ${col.Key || ''}\n`;
        });

        const hasCreatedAt = productColumns.some(col => col.Field === 'createdAt');
        const hasUpdatedAt = productColumns.some(col => col.Field === 'updatedAt');

        log += `\nTimestamps: createdAt=${hasCreatedAt}, updatedAt=${hasUpdatedAt}\n`;

        // Add timestamps if missing
        if (!hasCreatedAt) {
            log += "\nAdding createdAt column...\n";
            await sequelize.query(`ALTER TABLE Products ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`);
            log += "✅ createdAt added\n";
        }

        if (!hasUpdatedAt) {
            log += "\nAdding updatedAt column...\n";
            await sequelize.query(`ALTER TABLE Products ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            log += "✅ updatedAt added\n";
        }

        // Check ProductVariants
        log += "\n\nChecking ProductVariants table...\n";
        try {
            const [variantColumns] = await sequelize.query(`DESCRIBE ProductVariants`);
            log += "\nProductVariants columns:\n";
            variantColumns.forEach(col => {
                log += `  ${col.Field.padEnd(15)} ${col.Type.padEnd(20)} ${col.Key || ''}\n`;
            });
            log += "\n✅ ProductVariants table exists\n";
        } catch (error) {
            log += "\n❌ ProductVariants table missing\n";
            log += "Creating table...\n";

            await sequelize.query(`
                CREATE TABLE ProductVariants (
                    id CHAR(36) PRIMARY KEY,
                    ProductId CHAR(36) NOT NULL,
                    size VARCHAR(50),
                    color VARCHAR(50),
                    stock INT DEFAULT 0,
                    sku VARCHAR(100),
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (ProductId) REFERENCES Products(id) ON DELETE CASCADE,
                    INDEX idx_product (ProductId)
                )
            `);
            log += "✅ ProductVariants table created\n";
        }

        log += "\n=== PHASE 1 COMPLETE ===\n";

        console.log(log);
        fs.writeFileSync('phase1_result.txt', log);
        console.log("\nResult saved to phase1_result.txt");

    } catch (error) {
        log += `\n❌ ERROR: ${error.message}\n${error.stack}`;
        console.error(log);
        fs.writeFileSync('phase1_result.txt', log);
    } finally {
        process.exit();
    }
};

checkAndFix();
