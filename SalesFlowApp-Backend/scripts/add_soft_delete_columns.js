import { sequelize } from '../config/db.js';

const addSoftDeleteColumns = async () => {
    try {
        await sequelize.authenticate();
        console.log('🔄 Conectado a la base de datos...');

        const tables = [
            'Businesses',
            'BusinessMembers',
            'Clients',
            'Payments',
            'Products',
            'ProductImages',
            'ProductVariants',
            'Raffles',
            'RaffleTickets',
            'Sales',
            'SaleDetails',
            'Users'
        ];

        for (const table of tables) {
            console.log(`\n📦 Procesando tabla: ${table}`);

            // Check columns
            const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${table}`);
            const columnNames = columns.map(c => c.Field);

            // Add deletedAt
            if (!columnNames.includes('deletedAt')) {
                console.log(`   ➕ Añadiendo deletedAt a ${table}...`);
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN deletedAt DATETIME DEFAULT NULL`);
            } else {
                console.log(`   ✅ deletedAt ya existe en ${table}`);
            }

            // Add createdAt if missing (some tables might not have it if timestamps were off)
            if (!columnNames.includes('createdAt')) {
                console.log(`   ➕ Añadiendo createdAt a ${table}...`);
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`);
            }

            // Add updatedAt if missing
            if (!columnNames.includes('updatedAt')) {
                console.log(`   ➕ Añadiendo updatedAt a ${table}...`);
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            }
        }

        console.log('\n🎉 ¡Proceso completado con éxito!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error durante la actualización:', error);
        process.exit(1);
    }
};

addSoftDeleteColumns();
