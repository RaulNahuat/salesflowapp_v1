import db from './models/index.js';

const testGetProducts = async () => {
    try {
        console.log("Testing getProducts with variants include...\n");

        const business = await db.Business.findOne();
        console.log("Business ID:", business.id);

        // Test the exact query from controller
        const products = await db.Product.findAll({
            where: { BusinessId: business.id },
            include: [{
                association: 'ProductVariants',
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        console.log(`\n✅ SUCCESS! Got ${products.length} products`);
        if (products.length > 0) {
            console.log(`\nFirst product: "${products[0].name}"`);
            console.log(`Variants: ${products[0].ProductVariants?.length || 0}`);
            if (products[0].ProductVariants?.length > 0) {
                products[0].ProductVariants.forEach(v => {
                    console.log(`  - ${v.size} ${v.color}: ${v.stock} units`);
                });
            }
        }

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error("Message:", error.message);
        console.error("Name:", error.name);
        if (error.sql) console.error("SQL:", error.sql);
    } finally {
        process.exit();
    }
};

testGetProducts();
