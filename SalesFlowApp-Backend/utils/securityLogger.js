import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔒 SECURITY: Logger estructurado para eventos de seguridad
const securityLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/security.log'),
            level: 'warn'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log')
        })
    ]
});

// En desarrollo, también loguear a consola
if (process.env.NODE_ENV !== 'production') {
    securityLogger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

/**
 * Loguear evento de seguridad genérico
 */
export const logSecurityEvent = (event, details) => {
    securityLogger.warn(event, {
        ...details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Loguear intento de autenticación fallido
 */
export const logAuthFailure = (email, ip, reason) => {
    logSecurityEvent('AUTH_FAILURE', { email, ip, reason });
};

/**
 * Loguear autenticación exitosa
 */
export const logAuthSuccess = (userId, email, ip) => {
    logSecurityEvent('AUTH_SUCCESS', { userId, email, ip });
};

/**
 * Loguear acceso denegado
 */
export const logAccessDenied = (userId, resource, action, ip) => {
    logSecurityEvent('ACCESS_DENIED', { userId, resource, action, ip });
};

/**
 * Loguear cambio de permisos
 */
export const logPermissionChange = (adminId, targetUserId, oldPermissions, newPermissions, ip) => {
    logSecurityEvent('PERMISSION_CHANGE', {
        adminId,
        targetUserId,
        oldPermissions,
        newPermissions,
        ip
    });
};

/**
 * Loguear eliminación de cuenta
 */
export const logAccountDeletion = (userId, email, ip, reason) => {
    logSecurityEvent('ACCOUNT_DELETION', { userId, email, ip, reason });
};

export default securityLogger;
