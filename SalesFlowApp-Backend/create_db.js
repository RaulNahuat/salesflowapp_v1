import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER || process.env.DB_USERNAME, // Handle variations
            password: process.env.DB_PASS || process.env.DB_PASSWORD,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE || process.env.DB_NAME || 'salesflowapp'}`);
        console.log('✅ Base de datos creada o ya existente.');
        await connection.end();
    } catch (error) {
        console.error('❌ Error al crear la base de datos:', error.message);
    }
};

createDatabase();
