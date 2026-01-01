import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || 'development';

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
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },

        logging: console.log, // Temporalmente habilitado para Debug
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

export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a Aiven MySQL establecida correctamente.");

        if (env === 'development') {
            const pool = sequelize.connectionManager.pool;
            // console.log(`📊 Pool Stats - Max: ${pool.max}, Size: ${pool.size}, Available: ${pool.available}`);
        }
    } catch (error) {
        console.error("❌ Error de conexión:", error.message);
        throw error;
    }
}

export { sequelize };