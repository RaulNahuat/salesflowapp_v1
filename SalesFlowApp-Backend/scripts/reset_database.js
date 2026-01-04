import { sequelize } from '../config/db.js';
import db from '../models/index.js';

const resetDatabase = async () => {
    try {
        console.log('⚠️ IMPORTANTE: Este script BORRARÁ todos los datos y recreará las tablas.');
        console.log('⏳ Esperando 5 segundos por seguridad... (Ctrl+C para cancelar)');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('\n🔄 Iniciando reinicio de base de datos...');

        // Verify connection first
        await sequelize.authenticate();
        console.log('✅ Conexión establecida.');

        // Force Sync: Drops tables and re-creates them
        await db.sequelize.sync({ force: true });
        console.log('✅ Tablas recreadas correctamente (Datos borrados).');

        // Optional: Run Seeds
        // console.log('🌱 Ejecutando seeders iniciales...');
        // await seedEstatus();
        // console.log('✅ Seeds completados.');

        console.log('\n🎉 Base de datos reiniciada y lista para producción.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
};

resetDatabase();
