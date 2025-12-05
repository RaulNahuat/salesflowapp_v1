const testRegister = async () => {
    const url = 'http://localhost:3000/api/auth/register';

    const userData = {
        nombre: 'Juan Pérez',
        correo: `juan.perez.${Date.now()}@example.com`,
        password: 'password123'
    };

    console.log('Enviando solicitud de registro a:', url);
    console.log('Datos:', userData);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        console.log('STATUS:', response.status);
        console.log('DATA:', JSON.stringify(data));

        if (response.ok && data.success) {
            console.log('SUCCESS');
        } else {
            console.log('FAILED:', data.error || data.message || 'Unknown error');
        }

    } catch (error) {
        console.error('Error al conectar con el servidor:', error.message);
        console.log('Asegúrate de que el servidor esté corriendo (npm run dev).');
    }
};

testRegister();
