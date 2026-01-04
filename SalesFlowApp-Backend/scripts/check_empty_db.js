import { sequelize } from '../config/db.js';

const checkEmptyDb = async () => {
    try {
        console.log('🔍 Verificando si la base de datos está vacía...\n');

        await sequelize.authenticate();

        const tablesToCheck = [
            'users',
            'products',
            'sales',
            'clients',
            'raffles',
            'businessmembers',
            'businesses'
        ];

        let hasData = false;

        for (const table of tablesToCheck) {
            try {
                const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = results[0].count;

                if (count > 0) {
                    console.log(`❌ Tabla '${table}' tiene ${count} registros.`);
                    hasData = true;
                } else {
                    console.log(`✅ Tabla '${table}' está vacía.`);
                }
            } catch (error) {
                // Ignore errors if table doesn't exist yet (safe to assume it implies no data)
                console.log(`⚠️ Tabla '${table}' no encontrada o inaccesible.`);
            }
        }

        console.log('\n' + '='.repeat(40));
        if (hasData) {
            console.log('⚠️ LA BASE DE DATOS NO ESTÁ VACÍA.');
        } else {
            console.log('✨ LA BASE DE DATOS ESTÁ COMPLETAMENTE VACÍA.');
        }
        console.log('='.repeat(40) + '\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
};

checkEmptyDb();
