/**
 * Middleware Global de Manejo de Errores
 * 
 * Propósito: Capturar todos los errores no manejados y retornar respuestas seguras
 * 
 * Seguridad:
 * - Oculta stack traces y detalles internos en producción
 * - Sanitiza mensajes de error de base de datos
 * - Previene exposición de estructura de BD
 * 
 * IMPORTANTE: Este middleware debe ser el ÚLTIMO en la cadena de middlewares
 */

/**
 * Clases de error personalizadas para mejor control
 */
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Errores esperados vs bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflicto con el estado actual del recurso') {
        super(message, 409);
    }
}

/**
 * Detectar tipo de error de Sequelize y sanitizar mensaje
 */
const sanitizeSequelizeError = (error) => {
    // Errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
        return {
            statusCode: 400,
            message: 'Error de validación en los datos',
            details: error.errors?.map(e => ({
                field: e.path,
                message: e.message
            }))
        };
    }

    // Errores de constraint único (duplicados)
    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors?.[0]?.path || 'campo';
        return {
            statusCode: 409,
            message: `Ya existe un registro con ese ${field}`
        };
    }

    // Errores de foreign key
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return {
            statusCode: 400,
            message: 'No se puede completar la operación debido a dependencias de datos'
        };
    }

    // Errores de conexión a BD
    if (error.name === 'SequelizeConnectionError' ||
        error.name === 'SequelizeConnectionRefusedError') {
        return {
            statusCode: 503,
            message: 'Servicio temporalmente no disponible. Intente más tarde.'
        };
    }

    // Errores de timeout
    if (error.name === 'SequelizeTimeoutError') {
        return {
            statusCode: 504,
            message: 'La operación tardó demasiado tiempo. Intente nuevamente.'
        };
    }

    // Error genérico de base de datos
    return {
        statusCode: 500,
        message: 'Error al procesar la solicitud en la base de datos'
    };
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
    // Log completo del error en servidor (solo desarrollo o logs internos)
    if (process.env.NODE_ENV === 'development') {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('🔴 ERROR CAPTURADO:');
        console.error('Tipo:', err.name);
        console.error('Mensaje:', err.message);
        console.error('Stack:', err.stack);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
        // En producción, solo loguear información esencial (usar logger como Winston)
        console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
    }

    // Si ya se envió la respuesta, delegar al error handler por defecto de Express
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = 500;
    let message = 'Ocurrió un error en el servidor. Por favor intente más tarde.';
    let details = null;

    // Errores personalizados de la aplicación
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Errores de Sequelize
    else if (err.name && err.name.startsWith('Sequelize')) {
        const sanitized = sanitizeSequelizeError(err);
        statusCode = sanitized.statusCode;
        message = sanitized.message;
        details = sanitized.details;
    }
    // Errores de JWT
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token de autenticación inválido';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token de autenticación expirado';
    }
    // Errores de sintaxis JSON
    else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'JSON inválido en el cuerpo de la solicitud';
    }

    // Construir respuesta
    const response = {
        success: false,
        message: message
    };

    // Incluir detalles solo si existen y estamos en desarrollo
    if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
    }

    // Incluir stack trace SOLO en desarrollo
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.errorType = err.name;
    }

    res.status(statusCode).json(response);
};

/**
 * Middleware para rutas no encontradas (404)
 * Debe colocarse ANTES del errorHandler pero DESPUÉS de todas las rutas
 */
export const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    next(error);
};

/**
 * Wrapper para funciones async en rutas
 * Captura errores de promesas rechazadas y las pasa al error handler
 * 
 * Uso:
 *   router.get('/products', asyncHandler(async (req, res) => {
 *       const products = await Product.findAll();
 *       res.json(products);
 *   }));
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
