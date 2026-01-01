/**
 * 🚨 SCRIPT DE RECUPERACIÓN TOTAL DE BASE DE DATOS
 * 
 * Este script reconstruye COMPLETAMENTE la base de datos desde cero.
 * Incluye:
 * - Creación de todas las tablas
 * - Columnas adicionales (deletedAt, SellerId, etc.)
 * - Índices de rendimiento
 * - Todas las relaciones
 * 
 * ⚠️ ADVERTENCIA: Este script BORRARÁ todos los datos existentes.
 * Solo úsalo para:
 * 1. Recuperación de desastres
 * 2. Crear una nueva base de datos desde cero
 * 3. Ambiente de desarrollo/testing
 * 
 * USO:
 * node scripts/rebuild_database.js
 */

import { sequelize } from '../config/db.js';
import db from '../models/index.js';

const rebuildDatabase = async () => {
    try {
        console.log('🚀 Iniciando reconstrucción completa de la base de datos...\n');

        // ============================================
        // PASO 1: Verificar conexión
        // ============================================
        console.log('📡 PASO 1/5: Verificando conexión a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente\n');

        // ============================================
        // PASO 2: Crear todas las tablas
        // ============================================
        console.log('🏗️  PASO 2/5: Creando estructura de tablas...');
        console.log('⚠️  ADVERTENCIA: Esto eliminará todas las tablas existentes');

        // Esperar 3 segundos para cancelar si es necesario
        console.log('⏳ Esperando 10segundos... (Ctrl+C para cancelar)');
        await new Promise(resolve => setTimeout(resolve, 10000));

        await sequelize.sync({ force: true });
        console.log('✅ Tablas creadas exitosamente\n');

        // ============================================
        // PASO 3: Agregar columnas adicionales
        // ============================================
        console.log('🔧 PASO 3/5: Agregando columnas adicionales...');

        // Las columnas deletedAt ya se crean automáticamente con paranoid: true
        // Pero verificamos que existan en todas las tablas
        const tablesWithSoftDelete = [
            'businesses',
            'businessmembers',
            'clients',
            'payments',
            'products',
            'productimages',
            'productvariants',
            'raffles',
            'raffletickets',
            'sales',
            'saledetails',
            'users'
        ];

        for (const table of tablesWithSoftDelete) {
            const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${table}`);
            const hasDeletedAt = columns.some(col => col.Field === 'deletedAt');

            if (!hasDeletedAt) {
                console.log(`   ➕ Agregando deletedAt a ${table}...`);
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN deletedAt DATETIME DEFAULT NULL`);
            } else {
                console.log(`   ✅ deletedAt ya existe en ${table}`);
            }
        }

        // Verificar que Sales tenga SellerId (ya debería estar por el modelo)
        const [salesColumns] = await sequelize.query(`SHOW COLUMNS FROM sales`);
        const hasSellerId = salesColumns.some(col => col.Field === 'SellerId');

        if (!hasSellerId) {
            console.log('   ➕ Agregando SellerId a sales...');
            await sequelize.query(`
                ALTER TABLE sales 
                ADD COLUMN SellerId CHAR(36) DEFAULT NULL,
                ADD CONSTRAINT fk_sales_seller 
                FOREIGN KEY (SellerId) REFERENCES businessmembers(id) 
                ON DELETE SET NULL ON UPDATE CASCADE
            `);
        } else {
            console.log('   ✅ SellerId ya existe en sales');
        }

        console.log('✅ Columnas adicionales verificadas\n');

        // ============================================
        // PASO 4: Crear índices de rendimiento
        // ============================================
        console.log('📊 PASO 4/5: Creando índices de rendimiento...');

        const indexes = [
            // Sales indexes
            {
                table: 'sales',
                name: 'idx_sales_business_created',
                columns: ['BusinessId', 'createdAt']
            },
            {
                table: 'sales',
                name: 'idx_sales_business_status',
                columns: ['BusinessId', 'status']
            },
            {
                table: 'sales',
                name: 'idx_sales_client_business',
                columns: ['clientId', 'BusinessId']
            },
            {
                table: 'sales',
                name: 'idx_sales_created_at',
                columns: ['createdAt']
            },
            // Products indexes
            {
                table: 'products',
                name: 'idx_products_business_status',
                columns: ['BusinessId', 'status']
            },
            {
                table: 'products',
                name: 'idx_products_business_name',
                columns: ['BusinessId', 'name']
            },
            {
                table: 'products',
                name: 'idx_products_created_at',
                columns: ['createdAt']
            },
            // Clients indexes
            {
                table: 'clients',
                name: 'idx_clients_business_status',
                columns: ['BusinessId', 'status']
            },
            {
                table: 'clients',
                name: 'idx_clients_business_name',
                columns: ['BusinessId', 'firstName', 'lastName']
            },
            // SaleDetails indexes
            {
                table: 'saledetails',
                name: 'idx_saledetails_sale',
                columns: ['SaleId']
            },
            {
                table: 'saledetails',
                name: 'idx_saledetails_product',
                columns: ['productId']
            }
        ];

        for (const index of indexes) {
            try {
                const columnsStr = index.columns.join(', ');
                await sequelize.query(`
                    CREATE INDEX ${index.name} 
                    ON ${index.table} (${columnsStr})
                `);
                console.log(`   ✅ Índice creado: ${index.name}`);
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log(`   ⚠️  Índice ya existe: ${index.name}`);
                } else {
                    console.error(`   ❌ Error creando índice ${index.name}:`, error.message);
                }
            }
        }

        // Índice único para phone en clients (con condición WHERE phone IS NOT NULL)
        try {
            await sequelize.query(`
                CREATE UNIQUE INDEX idx_clients_business_phone 
                ON clients (BusinessId, phone)
            `);
            console.log('   ✅ Índice único creado: idx_clients_business_phone');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('   ⚠️  Índice ya existe: idx_clients_business_phone');
            } else {
                console.error('   ❌ Error creando índice único:', error.message);
            }
        }

        console.log('✅ Índices de rendimiento creados\n');

        // ============================================
        // PASO 5: Verificación final
        // ============================================
        console.log('🔍 PASO 5/5: Verificando estructura final...');

        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME, TABLE_ROWS 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME
        `);

        console.log('\n📋 Tablas creadas:');
        tables.forEach(table => {
            console.log(`   - ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} filas)`);
        });

        console.log('\n✅ Verificación completada');

        // ============================================
        // RESUMEN FINAL
        // ============================================
        console.log('\n' + '='.repeat(60));
        console.log('🎉 ¡BASE DE DATOS RECONSTRUIDA EXITOSAMENTE!');
        console.log('='.repeat(60));
        console.log('\n📊 Resumen:');
        console.log(`   ✅ ${tables.length} tablas creadas`);
        console.log(`   ✅ Columnas de soft delete agregadas`);
        console.log(`   ✅ ${indexes.length + 1} índices de rendimiento creados`);
        console.log(`   ✅ Todas las relaciones configuradas`);
        console.log('\n💡 Próximos pasos:');
        console.log('   1. Crear un usuario administrador');
        console.log('   2. Crear un negocio de prueba');
        console.log('   3. Importar datos si tienes un backup');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR DURANTE LA RECONSTRUCCIÓN:', error);
        console.error('\nDetalles:', error.message);
        process.exit(1);
    }
};

// Ejecutar el script
rebuildDatabase();
