
import sequelize from './config/db.js';

console.log('Attempting to sync/connect...');
try {
    await sequelize.authenticate();
    console.log('Auth success');
    await sequelize.sync();
    console.log('Sync success');
    process.exit(0);
} catch (e) {
    console.log('ERROR_START');
    console.log('Message:', e.message);
    if (e.original) console.log('Original Error:', e.original.message);
    if (e.parent) console.log('Error Code:', e.parent.code);
    console.log('ERROR_END');
    process.exit(1);
}
