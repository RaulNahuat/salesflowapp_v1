import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || 'development';

// 🔍 DEBUG: Log database configuration (mask password)
console.log('🔍 Database Configuration:');
console.log(`   Environment: ${env}`);
console.log(`   Host: ${process.env.DB_HOST || 'NOT SET'}`);
console.log(`   Port: ${process.env.DB_PORT || 'NOT SET'}`);
console.log(`   Database: ${process.env.DB_DATABASE || 'NOT SET'}`);
console.log(`   Username: ${process.env.DB_USERNAME || 'NOT SET'}`);
console.log(`   Password: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET'}`);

// ✅ POOL CONFIG: Ajustado para Aiven Free Tier (1GB RAM)
// Evitamos saturar la memoria y las conexiones permitidas por Aiven.
const poolConfig = {
    development: {
        max: 5,
        min: 1,
        acquire: 60000,  // Aumentado a 60s para mejor tolerancia con Aiven
        idle: 10000,
        evict: 1000
    },
    production: {
        max: 8,          // Bajamos de 20 a 8 para ser conservadores con el Free Tier
        min: 2,
        acquire: 60000,  // Aumentado a 60s para mejor tolerancia con Aiven
        idle: 10000,
        evict: 1000
    },
    test: {
        max: 2,
        min: 1,
        acquire: 30000,  // Aumentado a 30s
        idle: 5000
    }
};

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 16862,
        dialect: process.env.DB_DIALECT || 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },

        // 🔒 SECURITY: Deshabilitar logging SQL en producción\n        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: poolConfig[env],

        retry: {
            max: 3,
            timeout: 3000
        },

        benchmark: env === 'development',
        define: {
            timestamps: true,
            underscored: false
        }
    }
);

export const testConnection = async (retries = 5, delay = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await sequelize.authenticate();
            console.log("✅ Conexión a Aiven MySQL establecida correctamente.");

            if (env === 'development') {
                const pool = sequelize.connectionManager.pool;
                // console.log(`📊 Pool Stats - Max: ${pool.max}, Size: ${pool.size}, Available: ${pool.available}`);
            }
            return; // Conexión exitosa, salir
        } catch (error) {
            console.error(`❌ Error de conexión (intento ${attempt}/${retries}):`, error.message);

            if (attempt < retries) {
                const waitTime = delay * attempt; // Exponential backoff
                console.log(`⏳ Reintentando en ${waitTime / 1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                console.error('❌ No se pudo establecer conexión con la base de datos después de múltiples intentos.');
                throw error;
            }
        }
    }
}

export { sequelize };