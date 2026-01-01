/**
 * 🧹 SCRIPT DE LIMPIEZA DE TABLAS DUPLICADAS
 * 
 * Este script elimina las tablas legacy con mayúsculas que quedaron
 * de migraciones anteriores.
 * 
 * USO:
 * node scripts/cleanup_duplicate_tables.js
 */

import { sequelize } from '../config/db.js';

const cleanupDuplicateTables = async () => {
    try {
        console.log('🧹 Iniciando limpieza de tablas duplicadas...\n');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión establecida\n');

        // Tablas duplicadas a eliminar
        const duplicateTables = ['Businesses', 'Users'];

        for (const table of duplicateTables) {
            try {
                console.log(`🗑️  Eliminando tabla: ${table}...`);
                await sequelize.query(`DROP TABLE IF EXISTS \`${table}\``);
                console.log(`✅ Tabla ${table} eliminada\n`);
            } catch (error) {
                console.error(`❌ Error eliminando ${table}:`, error.message);
            }
        }

        // Verificar tablas restantes
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME
        `);

        console.log('📋 Tablas restantes en la base de datos:');
        tables.forEach((table, index) => {
            console.log(`   ${index + 1}. ${table.TABLE_NAME}`);
        });

        console.log(`\n✅ Total de tablas: ${tables.length}`);
        console.log('\n🎉 ¡Limpieza completada exitosamente!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error);
        console.error('\nDetalles:', error.message);
        process.exit(1);
    }
};

cleanupDuplicateTables();
