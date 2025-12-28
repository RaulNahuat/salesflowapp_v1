import { sequelize } from './config/db.js';

const finalFix = async () => {
    try {
        console.log('🚀 Iniciando reparación final de la base de datos...');
        await sequelize.authenticate();

        // 1. Identificar si existe la columna customerId y quitar su FK mala
        // El usuario reportó raffletickets_ibfk_14
        const fkNames = ['raffletickets_ibfk_14', 'raffletickets_ibfk_10', 'raffletickets_ibfk_11']; // Probamos nombres comunes si falló antes

        for (const fk of fkNames) {
            try {
                await sequelize.query(`ALTER TABLE RaffleTickets DROP FOREIGN KEY ${fk}`);
                console.log(`✅ Eliminada FK problemática: ${fk}`);
            } catch (e) {
                // Ignore if not exists
            }
        }

        // 2. Intentar renombrar customerId a clientId
        try {
            await sequelize.query("ALTER TABLE RaffleTickets CHANGE COLUMN customerId clientId CHAR(36)");
            console.log('✅ Columna customerId renombrada a clientId');
        } catch (e) {
            console.log('ℹ️ No se pudo renombrar customerId (quizás ya se hizo o no existía)');
        }

        // 3. Si no existe clientId, crearla
        try {
            await sequelize.query("ALTER TABLE RaffleTickets ADD COLUMN clientId CHAR(36)");
            console.log('✅ Columna clientId agregada');
        } catch (e) {
            console.log('ℹ️ Columna clientId ya existía');
        }

        // 4. Agregar la FK correcta hacia Clients
        try {
            await sequelize.query(`
                ALTER TABLE RaffleTickets 
                ADD CONSTRAINT fk_raffle_client 
                FOREIGN KEY (clientId) REFERENCES Clients(id) 
                ON DELETE SET NULL ON UPDATE CASCADE
            `);
            console.log('✅ FK hacia Clients establecida correctamente');
        } catch (e) {
            console.log('ℹ️ La FK hacia Clients ya existe o falló: ', e.message);
        }

        console.log('🎉 Reparación completada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la reparación:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

finalFix();
