/**
 * 🚀 SCRIPT TODO-EN-UNO: Backup + Verificación
 * 
 * Este script ejecuta automáticamente:
 * 1. Backup de la estructura de la DB
 * 2. Verificación de integridad
 * 
 * Ejecuta este script cuando Aiven.io esté respondiendo bien.
 * 
 * USO:
 * node scripts/backup_and_verify.js
 */

import { execSync } from 'child_process';
import { testConnection } from '../config/db.js';

const runBackupAndVerify = async () => {
    console.log('🚀 Iniciando proceso de Backup y Verificación...\n');

    try {
        // ============================================
        // PASO 1: Verificar conexión
        // ============================================
        console.log('📡 PASO 1/3: Verificando conexión a Aiven.io...');
        await testConnection();
        console.log('✅ Conexión establecida correctamente\n');

        // ============================================
        // PASO 2: Crear backup
        // ============================================
        console.log('💾 PASO 2/3: Creando backup de la estructura...');
        console.log('⏳ Esto puede tomar unos segundos...\n');

        try {
            execSync('node scripts/backup_schema.js', {
                stdio: 'inherit',
                cwd: process.cwd()
            });
            console.log('\n✅ Backup completado\n');
        } catch (error) {
            console.error('❌ Error durante el backup:', error.message);
            throw error;
        }

        // ============================================
        // PASO 3: Verificar integridad
        // ============================================
        console.log('🔍 PASO 3/3: Verificando integridad de la base de datos...');
        console.log('⏳ Esto puede tomar unos segundos...\n');

        try {
            execSync('node scripts/verify_database.js', {
                stdio: 'inherit',
                cwd: process.cwd()
            });
            console.log('\n✅ Verificación completada\n');
        } catch (error) {
            console.error('❌ Error durante la verificación:', error.message);
            throw error;
        }

        // ============================================
        // RESUMEN FINAL
        // ============================================
        console.log('='.repeat(60));
        console.log('🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!');
        console.log('='.repeat(60));
        console.log('\n✅ Backup creado en carpeta backups/');
        console.log('✅ Base de datos verificada correctamente');
        console.log('\n💡 Recomendación: Ejecuta este script regularmente (semanal/mensual)');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR DURANTE EL PROCESO:', error.message);
        console.error('\n💡 Posibles causas:');
        console.error('   - Aiven.io está experimentando latencia alta');
        console.error('   - Problemas de conexión a internet');
        console.error('   - Credenciales incorrectas en .env');
        console.error('\n💡 Solución: Intenta ejecutar este script más tarde');
        console.error('\n');
        process.exit(1);
    }
};

// Ejecutar el script
runBackupAndVerify();
