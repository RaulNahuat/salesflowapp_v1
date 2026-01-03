import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
    // If using Gmail, 'service' option is more reliable
    ...(process.env.SMTP_HOST?.includes('gmail') ? {
        service: 'gmail'
    } : {
        host: process.env.SMTP_HOST?.trim(),
        port: parseInt(process.env.SMTP_PORT?.trim() || '587'),
        secure: process.env.SMTP_PORT?.trim() === '465',
    }),
    auth: {
        user: process.env.SMTP_USER?.trim(),
        pass: process.env.SMTP_PASS?.trim(),
    },
    tls: {
        // Do not fail on invalid certs (common in local dev)
        rejectUnauthorized: false
    }
});

/**
 * Send a generic email
 * @param {string} to 
 * @param {string} subject 
 * @param {string} html 
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'SalesFlowApp'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`[EMAIL] Message sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        throw new Error('No se pudo enviar el correo electrónico');
    }
};

/**
 * Send Password Reset Email
 * @param {string} email 
 * @param {string} token 
 */
export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    const subject = 'Restablece tu contraseña - SalesFlowApp';
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">SalesFlowApp</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Control total para tu negocio</p>
            </div>
            
            <div style="padding: 20px; color: #334155;">
                <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 20px;">Restablecer tu contraseña</h2>
                <p style="line-height: 1.6; margin-bottom: 25px;">
                    Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva clave. Este enlace caducará en 1 hora.
                </p>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                        Cambiar Contraseña
                    </a>
                </div>
                
                <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                    Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no se verá afectada.
                </p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
            
            <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                <p>© ${new Date().getFullYear()} SalesFlowApp. Todos los derechos reservados.</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html);
};
