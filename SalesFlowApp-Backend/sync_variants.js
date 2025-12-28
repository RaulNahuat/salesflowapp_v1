
import db from './models/index.js';

const syncVariants = async () => {
    try {
        console.log("Syncing ProductVariant table...");
        await db.ProductVariant.sync({ alter: true });
        console.log("ProductVariant table synced successfully.");
    } catch (error) {
        console.error("Error syncing ProductVariant table:", error);
    } finally {
        process.exit();
    }
};

syncVariants();
