/**
 * RBAC Middleware - Role-Based Access Control
 * 
 * Propósito: Verificar que el usuario autenticado tenga uno de los roles permitidos
 * para acceder a un recurso específico.
 * 
 * Seguridad:
 * - Verifica que req.user exista (debe usarse después de 'protect' middleware)
 * - Compara el rol del usuario contra una lista blanca de roles permitidos
 * - Retorna 403 Forbidden si el usuario no tiene permisos
 * 
 * Uso:
 *   router.delete('/products/:id', protect, authorize(['owner', 'admin']), deleteProduct);
 */

import { logAccessDenied } from '../utils/securityLogger.js';

/**
 * Mapeo de permisos RBAC a permisos de empleado
 * Traduce los permisos del sistema RBAC a las claves de permisos personalizados de empleados
 */
const EMPLOYEE_PERMISSION_MAP = {
    // Productos
    'PRODUCT_CREATE': 'products',
    'PRODUCT_READ': 'products',
    'PRODUCT_UPDATE': 'products',
    'PRODUCT_DELETE': 'products',

    // Clientes
    'CLIENT_CREATE': 'pos', // POS incluye gestión de clientes
    'CLIENT_READ': 'pos',
    'CLIENT_UPDATE': 'pos',
    'CLIENT_DELETE': 'pos',

    // Ventas
    'SALE_CREATE': 'pos',
    'SALE_READ': 'pos',
    'SALE_DELETE': 'pos',

    // Sorteos
    'RAFFLE_CREATE': 'raffles',
    'RAFFLE_READ': 'raffles',
    'RAFFLE_UPDATE': 'raffles',
    'RAFFLE_DELETE': 'raffles',
    'RAFFLE_DRAW': 'raffles',

    // Reportes
    'REPORT_READ': 'reports',

    // Configuración (solo owner)
    'BUSINESS_UPDATE': null,
    'BUSINESS_DELETE': null,
    'WORKER_CREATE': null,
    'WORKER_READ': null,
    'WORKER_UPDATE': null,
    'WORKER_DELETE': null
};

export const authorize = (allowedRoles = [], permissionKey = null) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Acceso no autorizado. Debe iniciar sesión.'
            });
        }

        // Verificar que el usuario tenga un rol asignado
        if (!req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. No se ha asignado un rol a este usuario.'
            });
        }

        // Si el rol del usuario está en la lista de roles permitidos, autorizar
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        // Si el usuario es un empleado, verificar permisos personalizados
        if (req.user.role === 'employee' && req.user.permissions) {
            // Si se proporcionó una clave de permiso específica, usarla
            const employeePermKey = permissionKey || EMPLOYEE_PERMISSION_MAP[allowedRoles[0]];

            if (employeePermKey && req.user.permissions[employeePermKey] === true) {
                return next();
            }

            // REGLA ESPECIAL: El permiso 'pos' implica acceso de lectura a productos y clientes
            // porque el POS necesita ver productos y clientes para funcionar
            if (req.user.permissions.pos === true &&
                (employeePermKey === 'products' || employeePermKey === 'clients')) {
                return next();
            }
        }

        // 🔒 SECURITY: Loguear acceso denegado
        logAccessDenied(
            req.user.userId,
            req.originalUrl,
            req.method,
            req.ip
        );

        // Acceso denegado
        return res.status(403).json({
            success: false,
            message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
        });
    };
};

/**
 * Middleware de verificación de propiedad de negocio
 * 
 * Propósito: Asegurar que el usuario solo pueda acceder a recursos de su propio negocio
 * 
 * Seguridad:
 * - Valida que req.user.businessId exista
 * - Previene IDOR al nivel de middleware
 * 
 * Uso:
 *   router.use(protect);
 *   router.use(ensureBusinessAccess);
 */
export const ensureBusinessAccess = (req, res, next) => {
    if (!req.user || !req.user.businessId) {
        return res.status(403).json({
            success: false,
            message: 'No se encontró el negocio asociado al usuario.'
        });
    }

    // Asegurar compatibilidad con código legacy
    req.businessId = req.user.businessId;

    next();
};

/**
 * Definición de roles y permisos del sistema
 * 
 * owner: Propietario del negocio - Acceso total
 * admin: Administrador - Puede gestionar todo excepto configuración crítica
 * seller: Vendedor - Puede crear ventas, ver productos y clientes
 * viewer: Visualizador - Solo lectura
 */
export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    SELLER: 'seller',
    VIEWER: 'viewer'
};

/**
 * Permisos predefinidos por recurso
 * Facilita la aplicación consistente de RBAC en todas las rutas
 */
export const PERMISSIONS = {
    // Productos
    PRODUCT_CREATE: [ROLES.OWNER, ROLES.ADMIN],
    PRODUCT_READ: [ROLES.OWNER, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER],
    PRODUCT_UPDATE: [ROLES.OWNER, ROLES.ADMIN],
    PRODUCT_DELETE: [ROLES.OWNER, ROLES.ADMIN],

    // Clientes
    CLIENT_CREATE: [ROLES.OWNER, ROLES.ADMIN, ROLES.SELLER],
    CLIENT_READ: [ROLES.OWNER, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER],
    CLIENT_UPDATE: [ROLES.OWNER, ROLES.ADMIN, ROLES.SELLER],
    CLIENT_DELETE: [ROLES.OWNER, ROLES.ADMIN],

    // Ventas
    SALE_CREATE: [ROLES.OWNER, ROLES.ADMIN, ROLES.SELLER],
    SALE_READ: [ROLES.OWNER, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER],
    SALE_DELETE: [ROLES.OWNER, ROLES.ADMIN],

    // Sorteos
    RAFFLE_CREATE: [ROLES.OWNER, ROLES.ADMIN],
    RAFFLE_READ: [ROLES.OWNER, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER],
    RAFFLE_UPDATE: [ROLES.OWNER, ROLES.ADMIN],
    RAFFLE_DELETE: [ROLES.OWNER, ROLES.ADMIN],
    RAFFLE_DRAW: [ROLES.OWNER, ROLES.ADMIN],

    // Trabajadores
    WORKER_CREATE: [ROLES.OWNER],
    WORKER_READ: [ROLES.OWNER, ROLES.ADMIN],
    WORKER_UPDATE: [ROLES.OWNER],
    WORKER_DELETE: [ROLES.OWNER],

    // Configuración de negocio
    BUSINESS_UPDATE: [ROLES.OWNER],
    BUSINESS_DELETE: [ROLES.OWNER]
};
