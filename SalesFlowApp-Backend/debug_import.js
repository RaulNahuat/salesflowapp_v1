
console.log('Starting debug...');
try {
    console.log('Importing db...');

    // Mock envs to ensure Sequelize doesn't throw on undefined if that's the issue
    process.env.DB_DATABASE = process.env.DB_DATABASE || 'test_db';
    process.env.DB_USERNAME = process.env.DB_USERNAME || 'root';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
    process.env.DB_HOST = process.env.DB_HOST || 'localhost';
    process.env.DB_DIALECT = process.env.DB_DIALECT || 'mysql';

    const d = await import('./config/db.js');
    console.log('DB imported successfully');
} catch (e) {
    console.log('ERROR_START');
    console.log('Message:', e.message);
    console.log('Code:', e.code);
    console.log('ERROR_END');
}

try {
    console.log('Importing Cliente model...');
    const m = await import('./models/Cliente.js');
    console.log('Cliente model imported successfully');
} catch (e) {
    console.log('MODEL_ERROR_START');
    console.log('Message:', e.message);
    console.log('MODEL_ERROR_END');
}
