import axios from 'axios';

const testAPI = async () => {
    try {
        console.log("Making direct API call to /api/products...\n");

        // First, login to get a token
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'owner',
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log("✅ Login successful, got token\n");

        // Now try to get products
        const productsRes = await axios.get('http://localhost:3000/api/products/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("✅ Products fetched successfully!");
        console.log(`   Total products: ${productsRes.data.length}`);
        if (productsRes.data.length > 0) {
            console.log(`   First product: ${productsRes.data[0].name}`);
            console.log(`   Variants: ${productsRes.data[0].ProductVariants?.length || 0}`);
        }

    } catch (error) {
        console.error("\n❌ ERROR DETAILS:");
        console.error("Status:", error.response?.status);
        console.error("Message:", error.response?.data?.message || error.message);
        console.error("Full error:", JSON.stringify(error.response?.data, null, 2));
        if (error.response?.data?.stack) {
            console.error("\nStack trace:");
            console.error(error.response.data.stack);
        }
    }
};

testAPI();
