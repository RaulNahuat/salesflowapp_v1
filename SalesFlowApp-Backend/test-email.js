import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
    console.log('--- DIAGNÓSTICO DE CORREO ---');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    // No imprimimos la contraseña por seguridad, pero verificamos si existe
    console.log(`Pass check: ${process.env.SMTP_PASS ? 'PRESENTE (' + process.env.SMTP_PASS.trim().length + ' caracteres)' : 'MISSING'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER?.trim(),
            pass: process.env.SMTP_PASS?.trim(),
        }
    });

    try {
        console.log('\nIntentando conectar con Gmail...');
        await transporter.verify();
        console.log('✅ ¡CONEXIÓN EXITOSA! Tus credenciales son correctas.');

        console.log('\nEnviando correo de prueba...');
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'SalesFlowApp'}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: 'Prueba de Conexión SalesFlowApp',
            text: 'Si recibes esto, el sistema de correos está funcionando perfectamente.'
        });

        console.log(`✅ Correo enviado con éxito: ${info.messageId}`);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR DE AUTENTICACIÓN:');
        console.error(error.message);
        if (error.code === 'EAUTH') {
            console.log('\nSugerencia: Google sigue rechazando la clave. Asegúrate de que:');
            console.log('1. No haya espacios extra en el .env');
            console.log('2. La Verificación en 2 Pasos esté activa.');
            console.log('3. Hayas generado una "Contraseña de Aplicación" recientemente.');
        }
        process.exit(1);
    }
}

testEmail();
