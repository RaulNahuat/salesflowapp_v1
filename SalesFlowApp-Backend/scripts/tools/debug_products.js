import db from './models/index.js';

const testGetProducts = async () => {
    try {
        console.log("Testing getProducts with include ProductVariant...");

        // Find a business first
        const business = await db.Business.findOne();
        if (!business) {
            console.log("No business found!");
            process.exit(1);
        }

        console.log(`Business found: ${business.id}`);

        // Try the exact query from productController
        const products = await db.Product.findAll({
            where: { BusinessId: business.id },
            include: [db.ProductVariant],
            order: [['createdAt', 'DESC']]
        });

        console.log(`✅ SUCCESS! Fetched ${products.length} products`);
        console.log("Sample product:", JSON.stringify(products[0], null, 2));

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        console.error("Stack:", error.stack);
    } finally {
        process.exit();
    }
};

testGetProducts();
