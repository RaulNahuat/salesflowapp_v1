/**
 * Centralized Error Handling Middleware
 * Standardizes error responses for Sequelize and Application errors.
 */
export const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    if (err.stack) {
        // Log stack trace only in development
        if (process.env.NODE_ENV === 'development') {
            console.error(err.stack);
        }
    }

    // 1. Sequelize Validation Error (e.g. invalid email format)
    if (err.name === 'SequelizeValidationError') {
        const validationErrors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));

        return res.status(400).json({
            success: false,
            type: 'VALIDATION_ERROR',
            message: validationErrors[0].message, // Provide the first error as the main message
            field: validationErrors[0].field,
            errors: validationErrors
        });
    }

    // 2. Sequelize Unique Constraint Error (e.g. duplicate key)
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'unknown';
        const value = err.errors[0]?.value || '';

        return res.status(409).json({
            success: false,
            type: 'DUPLICATE_ERROR',
            field: field,
            message: `Ya existe un registro con ${field === 'phone' ? 'el teléfono' : field === 'email' ? 'el email' : 'este valor'}: ${value}`
        });
    }

    // 3. Sequelize Foreign Key Constraint Error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            type: 'REFERENCE_ERROR',
            message: 'No se puede realizar la operación porque este registro está siendo utilizado en otra parte.'
        });
    }

    // 4. Custom Application Errors (thrown with err.status)
    const statusCode = err.status || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        success: false,
        type: err.type || 'SERVER_ERROR',
        message: message,
        field: err.field || null
    });
};
