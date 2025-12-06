
const BASE_URL = 'http://localhost:3000/api/auth';
const TEST_USER = {
    nombre: 'Test User',
    correo: 'test@example.com',
    password: 'password123'
};

async function checkLogin() {
    console.log('--- Comprobando Registro y Login ---');

    // 1. Intentar Registrar
    try {
        console.log(`Intentando registrar usuario: ${TEST_USER.correo}`);
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const regData = await regRes.json();
        console.log('Respuesta de Registro:', regRes.status, regData);

    } catch (error) {
        console.error('Error en petición de registro:', error.message);
    }

    // 2. Intentar Login
    try {
        console.log(`\nIntentando login con: ${TEST_USER.correo}`);
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correo: TEST_USER.correo,
                password: TEST_USER.password
            })
        });

        const loginData = await loginRes.json();
        console.log('Respuesta de Login:', loginRes.status, loginData);

        if (loginRes.ok && loginData.token) {
            console.log('\n✅ ¡LOGIN EXITOSO! El sistema te deja loguearte correctamente.');
        } else {
            console.log('\n❌ LOGIN FALLIDO. Revisa los logs de arriba.');
        }

    } catch (error) {
        console.error('Error en petición de login:', error.message);
    }
}

checkLogin();
