import db from './models/index.js';

const testProductVariants = async () => {
    try {
        console.log("🧪 Testing Product with Variants...\n");

        const business = await db.Business.findOne();
        if (!business) {
            console.log("❌ No business found");
            process.exit(1);
        }

        console.log(`✅ Business found: ${business.id}\n`);

        // Test 1: Get all products with variants
        console.log("Test 1: Fetching all products with variants...");
        const products = await db.Product.findAll({
            where: { BusinessId: business.id },
            include: [{
                model: db.ProductVariant,
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        console.log(`✅ Fetched ${products.length} products`);
        if (products.length > 0) {
            console.log(`   First product: "${products[0].name}"`);
            console.log(`   Variants: ${products[0].ProductVariants?.length || 0}\n`);
        }

        // Test 2: Create a product with variants
        console.log("Test 2: Creating product with variants...");
        const newProduct = await db.Product.create({
            name: 'Test Camiseta',
            sellingPrice: 25.00,
            stock: 20,
            BusinessId: business.id,
            ProductVariants: [
                { size: 'S', color: 'Rojo', stock: 5 },
                { size: 'M', color: 'Azul', stock: 10 },
                { size: 'L', color: 'Verde', stock: 5 }
            ]
        }, {
            include: [db.ProductVariant]
        });

        console.log(`✅ Created product: ${newProduct.id}`);
        console.log(`   Variants created: ${newProduct.ProductVariants?.length || 0}\n`);

        // Test 3: Fetch the created product
        console.log("Test 3: Fetching created product...");
        const fetchedProduct = await db.Product.findOne({
            where: { id: newProduct.id },
            include: [{
                model: db.ProductVariant,
                required: false
            }]
        });

        console.log(`✅ Product fetched: "${fetchedProduct.name}"`);
        console.log(`   Variants: ${fetchedProduct.ProductVariants?.length || 0}`);
        fetchedProduct.ProductVariants?.forEach(v => {
            console.log(`   - ${v.size} ${v.color}: ${v.stock} units`);
        });

        console.log("\n🎉 All tests passed!");

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        console.error("Stack:", error.stack);
    } finally {
        process.exit();
    }
};

testProductVariants();
