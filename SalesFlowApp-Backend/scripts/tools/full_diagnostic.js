import db from './models/index.js';

const fullDiagnostic = async () => {
    console.log("=== FULL SYSTEM DIAGNOSTIC ===\n");

    try {
        // Test 1: Database connection
        console.log("1. Testing database connection...");
        await db.sequelize.authenticate();
        console.log("   ✅ Database connected\n");

        // Test 2: Check models
        console.log("2. Checking models...");
        console.log("   Product model:", db.Product ? "✅ EXISTS" : "❌ MISSING");
        console.log("   ProductVariant model:", db.ProductVariant ? "✅ EXISTS" : "❌ MISSING");
        console.log("   Business model:", db.Business ? "✅ EXISTS" : "❌ MISSING\n");

        // Test 3: Find a business
        console.log("3. Finding a business...");
        const business = await db.Business.findOne();
        if (!business) {
            console.log("   ❌ NO BUSINESS FOUND - This is the problem!");
            console.log("   Creating a test business...");
            const testBusiness = await db.Business.create({
                name: 'Test Business',
                email: 'test@test.com'
            });
            console.log(`   ✅ Created business: ${testBusiness.id}\n`);
        } else {
            console.log(`   ✅ Business found: ${business.id} - ${business.name}\n`);
        }

        // Test 4: Simple product query WITHOUT include
        console.log("4. Testing simple product query (no includes)...");
        const simpleProducts = await db.Product.findAll({
            limit: 5
        });
        console.log(`   ✅ Found ${simpleProducts.length} products\n`);

        // Test 5: Product query with BusinessId filter
        console.log("5. Testing product query with BusinessId filter...");
        const business2 = await db.Business.findOne();
        const filteredProducts = await db.Product.findAll({
            where: { BusinessId: business2.id },
            order: [['createdAt', 'DESC']]
        });
        console.log(`   ✅ Found ${filteredProducts.length} products for business ${business2.id}\n`);

        console.log("=== ALL TESTS PASSED ===");

    } catch (error) {
        console.error("\n❌ ERROR FOUND:");
        console.error("Message:", error.message);
        console.error("Name:", error.name);
        if (error.sql) console.error("SQL:", error.sql);
        console.error("\nFull stack:");
        console.error(error.stack);
    } finally {
        process.exit();
    }
};

fullDiagnostic();
