
import db from './models/index.js';

const testFetch = async () => {
    try {
        console.log("Testing Product Fetch...");
        // Simulate a businessId (assuming 1 or uuid, but lets try to find one first or just run without where clause if possible, but the code uses where)
        // Let's just find any business first.
        const business = await db.Business.findOne();
        if (!business) {
            console.log("No business found, cannot fully test tenant query.");
            return;
        }

        console.log(`Fetching products for BusinessId: ${business.id}`);
        const products = await db.Product.findAll({
            where: { BusinessId: business.id },
            include: [db.ProductVariant],
            order: [['createdAt', 'DESC']]
        });
        console.log(`Successfully fetched ${products.length} products.`);
        if (products.length > 0) {
            console.log("Sample product variants:", JSON.stringify(products[0].ProductVariants, null, 2));
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        process.exit();
    }
};

testFetch();
