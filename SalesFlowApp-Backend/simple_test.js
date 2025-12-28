import db from './models/index.js';

const simpleTest = async () => {
    try {
        console.log("Testing basic product fetch...\n");

        // Get any business
        const business = await db.Business.findOne();
        console.log("Business ID:", business.id);

        // Try the EXACT query from productController
        console.log("\nExecuting query...");
        const products = await db.Product.findAll({
            where: { BusinessId: business.id },
            order: [['createdAt', 'DESC']]
        });

        console.log(`\n✅ SUCCESS! Got ${products.length} products`);
        if (products.length > 0) {
            console.log("First product:", products[0].name);
        }

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error(error.message);
        console.error("\nSQL:", error.sql);
    } finally {
        process.exit();
    }
};

simpleTest();
