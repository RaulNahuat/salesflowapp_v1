import db from './models/index.js';

async function checkIndexes() {
    try {
        const [indexes] = await db.sequelize.query(`
            SHOW INDEX FROM clients
        `);

        console.log('\n📊 Indexes on clients table:\n');

        const uniqueIndexes = indexes.filter(idx => idx.Non_unique === 0);

        console.log('Unique indexes:');
        uniqueIndexes.forEach(idx => {
            console.log(`  - ${idx.Key_name} on column '${idx.Column_name}'`);
        });

        console.log('\nAll indexes:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.Key_name}: ${idx.Column_name} (unique: ${idx.Non_unique === 0 ? 'YES' : 'NO'})`);
        });

        await db.sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await db.sequelize.close();
    }
}

checkIndexes();
