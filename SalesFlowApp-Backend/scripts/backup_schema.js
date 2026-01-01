/**
 * 📦 SCRIPT DE BACKUP DE BASE DE DATOS
 * 
 * Este script crea un backup completo de la estructura de la base de datos
 * (schema) sin incluir los datos. Es útil para:
 * 
 * 1. Documentar la estructura actual
 * 2. Tener un respaldo de la configuración
 * 3. Migrar a otro servidor
 * 
 * El backup incluye:
 * - Definición de todas las tablas
 * - Índices
 * - Foreign keys
 * - Constraints
 * 
 * USO:
 * node scripts/backup_schema.js
 * 
 * El archivo se guardará en: backups/schema_YYYY-MM-DD_HH-MM-SS.sql
 */

import { sequelize } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupSchema = async () => {
    try {
        console.log('📦 Iniciando backup de estructura de base de datos...\n');

        // Crear carpeta de backups si no existe
        const backupsDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
            console.log('📁 Carpeta de backups creada\n');
        }

        // Nombre del archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `schema_${timestamp}.sql`;
        const filepath = path.join(backupsDir, filename);

        console.log('🔍 Obteniendo estructura de la base de datos...\n');

        // Obtener lista de tablas
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME
        `);

        let sqlContent = '';
        sqlContent += `-- ========================================\n`;
        sqlContent += `-- BACKUP DE ESTRUCTURA - SalesFlowApp\n`;
        sqlContent += `-- Fecha: ${new Date().toISOString()}\n`;
        sqlContent += `-- Base de datos: ${process.env.DB_DATABASE}\n`;
        sqlContent += `-- ========================================\n\n`;

        console.log(`📊 Procesando ${tables.length} tablas...\n`);

        // Para cada tabla, obtener su CREATE TABLE statement
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            console.log(`   📋 Procesando: ${tableName}`);

            // Obtener CREATE TABLE
            const [createTable] = await sequelize.query(`SHOW CREATE TABLE ${tableName}`);
            const createStatement = createTable[0]['Create Table'];

            sqlContent += `-- ========================================\n`;
            sqlContent += `-- Tabla: ${tableName}\n`;
            sqlContent += `-- ========================================\n\n`;
            sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n\n`;
            sqlContent += createStatement + ';\n\n';
        }

        // Obtener información de índices
        sqlContent += `-- ========================================\n`;
        sqlContent += `-- ÍNDICES\n`;
        sqlContent += `-- ========================================\n\n`;

        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            const [indexes] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);

            if (indexes.length > 0) {
                sqlContent += `-- Índices de ${tableName}\n`;
                const uniqueIndexes = [...new Set(indexes.map(i => i.Key_name))];
                uniqueIndexes.forEach(indexName => {
                    if (indexName !== 'PRIMARY') {
                        const indexInfo = indexes.filter(i => i.Key_name === indexName);
                        const columns = indexInfo.map(i => i.Column_name).join(', ');
                        const unique = indexInfo[0].Non_unique === 0 ? 'UNIQUE ' : '';
                        sqlContent += `-- ${unique}INDEX ${indexName} ON ${tableName} (${columns})\n`;
                    }
                });
                sqlContent += '\n';
            }
        }

        // Guardar archivo
        fs.writeFileSync(filepath, sqlContent, 'utf8');

        console.log('\n' + '='.repeat(60));
        console.log('✅ BACKUP COMPLETADO EXITOSAMENTE');
        console.log('='.repeat(60));
        console.log(`\n📄 Archivo guardado en:`);
        console.log(`   ${filepath}`);
        console.log(`\n📊 Estadísticas:`);
        console.log(`   - Tablas respaldadas: ${tables.length}`);
        console.log(`   - Tamaño del archivo: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
        console.log('\n💡 Para restaurar este backup:');
        console.log(`   mysql -h <HOST> -P <PORT> -u <USER> -p --ssl-mode=REQUIRED <DATABASE> < ${filename}`);
        console.log('\n');

        // Crear también un archivo JSON con metadata
        const metadata = {
            timestamp: new Date().toISOString(),
            database: process.env.DB_DATABASE,
            host: process.env.DB_HOST,
            tables: tables.map(t => t.TABLE_NAME),
            tableCount: tables.length,
            backupFile: filename
        };

        const metadataFile = filepath.replace('.sql', '.json');
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf8');
        console.log(`📋 Metadata guardada en: ${path.basename(metadataFile)}\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR DURANTE EL BACKUP:', error);
        console.error('\nDetalles:', error.message);
        process.exit(1);
    }
};

// Ejecutar el script
backupSchema();
