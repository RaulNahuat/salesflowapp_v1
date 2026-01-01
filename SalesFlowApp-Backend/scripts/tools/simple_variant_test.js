import db from './models/index.js';

const simpleTest = async () => {
    try {
        console.log("Testing ProductVariant model...");
        console.log("Model name:", db.ProductVariant.name);
        console.log("Table name:", db.ProductVariant.tableName);
        console.log("Attributes:", Object.keys(db.ProductVariant.rawAttributes));

        // Try to sync
        await db.ProductVariant.sync({ force: true });
        console.log("✅ Sync successful!");

    } catch (error) {
        console.error("❌ Full error:");
        console.error(error);
    } finally {
        process.exit();
    }
};

simpleTest();
