import db from './models/index.js';

async function checkClients() {
    try {
        // Check all clients including soft-deleted
        const allClients = await db.Client.findAll({
            paranoid: false,
            where: {
                phone: '986113997'
            }
        });

        console.log(`\n📊 Clients with phone 986113997:`);
        console.log(`Total found (including deleted): ${allClients.length}\n`);

        allClients.forEach((client, index) => {
            console.log(`Client ${index + 1}:`);
            console.log(`  ID: ${client.id}`);
            console.log(`  Name: ${client.firstName} ${client.lastName}`);
            console.log(`  Phone: ${client.phone}`);
            console.log(`  BusinessId: ${client.BusinessId}`);
            console.log(`  Deleted: ${client.deletedAt ? 'YES (' + client.deletedAt + ')' : 'NO'}`);
            console.log('');
        });

        // Check only active clients
        const activeClients = await db.Client.findAll({
            where: {
                phone: '986113997'
            }
        });

        console.log(`Active clients: ${activeClients.length}`);

        await db.sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await db.sequelize.close();
    }
}

checkClients();
