import db from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Initialization Script
 * Synchronizes models, applies schema patches if needed, and verifies connection.
 */
async function initDatabase() {
    try {
        console.log('🔄 Starting Database Initialization...');

        // 1. Authenticate
        await db.sequelize.authenticate();
        console.log('✓ Database connection established.');

        // 2. Sync Models (safe mode)
        // We use alter: true to update schema without dropping tables
        await db.sequelize.sync({ alter: true });
        console.log('✓ Models synchronized with database.');

        // 3. Verify specifically the problematic indexes are gone
        const [indexes] = await db.sequelize.query("SHOW INDEX FROM clients");
        const hasUniquePhone = indexes.some(idx => idx.Column_name === 'phone' && idx.Non_unique === 0);

        if (hasUniquePhone) {
            console.log('⚠️  Warning: Unique index on phone still detected. Manual intervention might be needed.');
        } else {
            console.log('✓ Verification: No unique constraint on phone column. Soft-deletes will work.');
        }

        console.log('✅ Database Initialization Complete.');
        await db.sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database Initialization Failed:', error.message);
        process.exit(1);
    }
}

initDatabase();
