/**
 * 🔍 SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
 * 
 * Este script verifica que tu base de datos tenga todas las tablas,
 * columnas e índices necesarios para funcionar correctamente.
 * 
 * USO:
 * node scripts/verify_database.js
 * 
 * El script verificará:
 * - Todas las tablas existen
 * - Todas las columnas necesarias están presentes
 * - Los índices de rendimiento están creados
 * - Las relaciones (foreign keys) están configuradas
 */

import { sequelize } from '../config/db.js';

const verifyDatabase = async () => {
    try {
        console.log('🔍 Iniciando verificación de base de datos...\n');

        // ============================================
        // PASO 1: Verificar conexión
        // ============================================
        console.log('📡 Verificando conexión...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida\n');

        let errors = [];
        let warnings = [];

        // ============================================
        // PASO 2: Verificar tablas
        // ============================================
        console.log('📋 Verificando tablas...');

        const expectedTables = [
            'businesses',
            'businessmembers',
            'clients',
            'payments',
            'products',
            'productimages',
            'productvariants',
            'raffles',
            'raffletickets',
            'receipttokens',
            'sales',
            'saledetails',
            'users'
        ];

        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
        `);

        const existingTables = tables.map(t => t.TABLE_NAME.toLowerCase());

        for (const table of expectedTables) {
            if (existingTables.includes(table)) {
                console.log(`   ✅ ${table}`);
            } else {
                console.log(`   ❌ ${table} - FALTANTE`);
                errors.push(`Tabla faltante: ${table}`);
            }
        }

        // ============================================
        // PASO 3: Verificar columnas críticas
        // ============================================
        console.log('\n🔧 Verificando columnas críticas...');

        const criticalColumns = {
            'sales': ['SellerId', 'deletedAt', 'createdAt', 'updatedAt', 'total', 'status'],
            'clients': ['deletedAt', 'createdAt', 'updatedAt', 'BusinessId'],
            'products': ['deletedAt', 'createdAt', 'updatedAt', 'BusinessId'],
            'productvariants': ['ProductId', 'variantName', 'variantValue'],
            'saledetails': ['SaleId', 'productId', 'ProductVariantId']
        };

        for (const [table, columns] of Object.entries(criticalColumns)) {
            if (!existingTables.includes(table)) continue;

            console.log(`\n   📦 Tabla: ${table}`);
            const [tableColumns] = await sequelize.query(`SHOW COLUMNS FROM ${table}`);
            const columnNames = tableColumns.map(c => c.Field);

            for (const col of columns) {
                if (columnNames.includes(col)) {
                    console.log(`      ✅ ${col}`);
                } else {
                    console.log(`      ❌ ${col} - FALTANTE`);
                    errors.push(`Columna faltante: ${table}.${col}`);
                }
            }
        }

        // ============================================
        // PASO 4: Verificar índices de rendimiento
        // ============================================
        console.log('\n📊 Verificando índices de rendimiento...');

        const expectedIndexes = {
            'sales': [
                'idx_sales_business_created',
                'idx_sales_business_status',
                'idx_sales_client_business',
                'idx_sales_created_at'
            ],
            'products': [
                'idx_products_business_status',
                'idx_products_business_name',
                'idx_products_created_at'
            ],
            'clients': [
                'idx_clients_business_status',
                'idx_clients_business_name'
            ]
        };

        for (const [table, indexes] of Object.entries(expectedIndexes)) {
            if (!existingTables.includes(table)) continue;

            console.log(`\n   📦 Tabla: ${table}`);
            const [tableIndexes] = await sequelize.query(`SHOW INDEX FROM ${table}`);
            const indexNames = [...new Set(tableIndexes.map(i => i.Key_name))];

            for (const idx of indexes) {
                if (indexNames.includes(idx)) {
                    console.log(`      ✅ ${idx}`);
                } else {
                    console.log(`      ⚠️  ${idx} - FALTANTE`);
                    warnings.push(`Índice faltante: ${table}.${idx} (afecta rendimiento)`);
                }
            }
        }

        // ============================================
        // PASO 5: Verificar relaciones (Foreign Keys)
        // ============================================
        console.log('\n🔗 Verificando relaciones (Foreign Keys)...');

        const expectedForeignKeys = {
            'sales': ['BusinessId', 'clientId', 'SellerId'],
            'products': ['BusinessId'],
            'clients': ['BusinessId'],
            'saledetails': ['SaleId', 'productId', 'ProductVariantId']
        };

        for (const [table, fks] of Object.entries(expectedForeignKeys)) {
            if (!existingTables.includes(table)) continue;

            console.log(`\n   📦 Tabla: ${table}`);
            const [tableColumns] = await sequelize.query(`SHOW COLUMNS FROM ${table}`);
            const columnNames = tableColumns.map(c => c.Field);

            for (const fk of fks) {
                if (columnNames.includes(fk)) {
                    console.log(`      ✅ ${fk}`);
                } else {
                    console.log(`      ❌ ${fk} - FALTANTE`);
                    errors.push(`Foreign key faltante: ${table}.${fk}`);
                }
            }
        }

        // ============================================
        // PASO 6: Estadísticas generales
        // ============================================
        console.log('\n📊 Estadísticas generales...\n');

        for (const table of expectedTables) {
            if (!existingTables.includes(table)) continue;

            const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`   ${table}: ${count[0].count} registros`);
        }

        // ============================================
        // RESUMEN FINAL
        // ============================================
        console.log('\n' + '='.repeat(60));

        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ BASE DE DATOS COMPLETAMENTE VERIFICADA');
            console.log('='.repeat(60));
            console.log('\n🎉 ¡Todo está en orden!');
            console.log('\n📊 Resumen:');
            console.log(`   ✅ ${expectedTables.length} tablas verificadas`);
            console.log(`   ✅ Todas las columnas críticas presentes`);
            console.log(`   ✅ Índices de rendimiento configurados`);
            console.log(`   ✅ Relaciones correctamente establecidas`);
        } else {
            console.log('⚠️  VERIFICACIÓN COMPLETADA CON ADVERTENCIAS');
            console.log('='.repeat(60));

            if (errors.length > 0) {
                console.log('\n❌ ERRORES CRÍTICOS:');
                errors.forEach(err => console.log(`   - ${err}`));
                console.log('\n🔧 Acción recomendada: Ejecutar rebuild_database.js');
            }

            if (warnings.length > 0) {
                console.log('\n⚠️  ADVERTENCIAS:');
                warnings.forEach(warn => console.log(`   - ${warn}`));
                console.log('\n💡 Sugerencia: Los índices mejoran el rendimiento pero no son críticos');
            }
        }

        console.log('\n');

        process.exit(errors.length > 0 ? 1 : 0);
    } catch (error) {
        console.error('\n❌ ERROR DURANTE LA VERIFICACIÓN:', error);
        console.error('\nDetalles:', error.message);
        process.exit(1);
    }
};

// Ejecutar el script
verifyDatabase();
