import db from './models/index.js';

const minimalTest = async () => {
    try {
        console.log("Minimal test - just fetch products\n");

        const business = await db.Business.findOne();
        console.log("Business:", business?.id);

        // Test WITHOUT include first
        console.log("\n1. Fetching products WITHOUT variants...");
        const productsNoVariants = await db.Product.findAll({
            where: { BusinessId: business.id }
        });
        console.log(`✅ Got ${productsNoVariants.length} products`);

        // Test WITH include
        console.log("\n2. Fetching products WITH variants...");
        const productsWithVariants = await db.Product.findAll({
            where: { BusinessId: business.id },
            include: [{
                model: db.ProductVariant,
                required: false
            }]
        });
        console.log(`✅ Got ${productsWithVariants.length} products`);
        console.log(`   First product variants: ${productsWithVariants[0]?.ProductVariants?.length || 0}`);

        console.log("\n🎉 Success!");

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        if (error.sql) console.error("SQL:", error.sql);
    } finally {
        process.exit();
    }
};

minimalTest();
