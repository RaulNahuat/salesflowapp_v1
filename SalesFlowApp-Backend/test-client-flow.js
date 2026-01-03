import db from './models/index.js';

async function testClientFlow() {
    try {
        console.log('\n🧪 Testing Client Create -> Delete -> Re-create Flow\n');

        const testData = {
            firstName: 'Rosario',
            lastName: 'NAHUAT',
            phone: '986113997',
            email: 'juan@ejemplo.com',
            address: 'CONOCIDO',
            BusinessId: 'YOUR_BUSINESS_ID_HERE', // Replace with actual business ID
            createdById: 'YOUR_USER_ID_HERE' // Replace with actual user ID
        };

        // Step 1: Create client
        console.log('Step 1: Creating client...');
        const client = await db.Client.create(testData);
        console.log(`✓ Client created with ID: ${client.id}\n`);

        // Step 2: Delete client (soft delete)
        console.log('Step 2: Deleting client (soft delete)...');
        await client.destroy();
        console.log(`✓ Client soft-deleted\n`);

        // Step 3: Check if client exists (should NOT find it)
        console.log('Step 3: Checking for existing client with same phone...');
        const existingClient = await db.Client.findOne({
            where: {
                phone: testData.phone,
                BusinessId: testData.BusinessId
            }
        });
        console.log(`Result: ${existingClient ? '❌ FOUND (BUG!)' : '✓ NOT FOUND (correct)'}\n`);

        if (existingClient) {
            console.log('Client details:', {
                id: existingClient.id,
                phone: existingClient.phone,
                deletedAt: existingClient.deletedAt
            });
        }

        // Step 4: Try to create again
        console.log('Step 4: Attempting to create client again...');
        try {
            const newClient = await db.Client.create(testData);
            console.log(`✓ SUCCESS! New client created with ID: ${newClient.id}\n`);
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}\n`);
            console.log('Error name:', error.name);
            if (error.errors) {
                console.log('Validation errors:', error.errors);
            }
        }

        // Cleanup
        console.log('Cleaning up test data...');
        await db.Client.destroy({
            where: { phone: testData.phone },
            force: true
        });
        console.log('✓ Cleanup complete\n');

        await db.sequelize.close();
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        await db.sequelize.close();
    }
}

testClientFlow();
