import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware para manejar errores de validación
 * 
 * Propósito: Capturar errores de express-validator y retornar respuesta consistente
 * 
 * Seguridad:
 * - Sanitiza los mensajes de error antes de enviarlos al cliente
 * - No expone detalles internos de validación
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación en los datos enviados',
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }

    next();
};

/**
 * Validaciones para Productos
 */
export const validateCreateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del producto es obligatorio')
        .isLength({ min: 2, max: 200 }).withMessage('El nombre debe tener entre 2 y 200 caracteres')
        .escape(), // Sanitiza contra XSS

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
        .escape(), // Sanitiza contra XSS

    body('costPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio de costo debe ser un número positivo')
        .toFloat(),

    body('sellingPrice')
        .notEmpty().withMessage('El precio de venta es obligatorio')
        .isFloat({ min: 0.01 }).withMessage('El precio de venta debe ser mayor a 0')
        .toFloat(),

    body('stock')
        .optional({ values: 'falsy' }) // Treat empty string as absent
        .isInt({ min: 0 }).withMessage('El stock debe ser un número entero no negativo')
        .toInt(),

    body('status')
        .optional({ values: 'falsy' })
        .isIn(['active', 'inactive', 'discontinued']).withMessage('Estado inválido'),

    body('imageUrl')
        .optional({ values: 'falsy' })
        .trim()
        .isURL().withMessage('La URL de la imagen no es válida'),

    body('variants')
        .optional({ values: 'falsy' })
        .isArray().withMessage('Las variantes deben ser un array'),

    body('variants.*.color')
        .optional({ values: 'falsy' })
        .trim()
        .escape(),

    body('variants.*.size')
        .optional({ values: 'falsy' })
        .trim()
        .escape(),

    body('variants.*.sku')
        .optional({ values: 'falsy' })
        .trim()
        .escape(),

    body('variants.*.stock')
        .optional({ values: 'falsy' })
        .isInt({ min: 0 }).withMessage('El stock de la variante debe ser no negativo')
        .toInt(),

    handleValidationErrors
];

export const validateUpdateProduct = [
    param('id')
        .isUUID().withMessage('ID de producto inválido'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 }).withMessage('El nombre debe tener entre 2 y 200 caracteres')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
        .escape(),

    body('costPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio de costo debe ser positivo')
        .toFloat(),

    body('sellingPrice')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('El precio de venta debe ser mayor a 0')
        .toFloat(),

    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock debe ser no negativo')
        .toInt(),

    handleValidationErrors
];

/**
 * Validaciones para Clientes
 */
export const validateCreateClient = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .escape(),

    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('El apellido no puede exceder 100 caracteres')
        .escape(),

    body('email')
        .optional({ checkFalsy: true }) // Allow empty strings
        .trim()
        .isEmail().withMessage('El email no es válido')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono contiene caracteres inválidos')
        .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La dirección no puede exceder 500 caracteres')
        .escape(),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres')
        .escape(), // CRÍTICO: Previene XSS persistente

    handleValidationErrors
];

export const validateUpdateClient = [
    param('id')
        .isUUID().withMessage('ID de cliente inválido'),

    ...validateCreateClient.slice(0, -1), // Reutilizar validaciones de creación

    handleValidationErrors
];

/**
 * Validaciones para Ventas
 */
export const validateCreateSale = [
    body('items')
        .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto en la venta'),

    body('items.*.productId')
        .notEmpty().withMessage('ID de producto es requerido'),

    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1')
        .toInt(),

    body('items.*.variantId')
        .optional({ nullable: true }),

    body('items.*.price')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio debe ser positivo'),

    body('items.*.cartItemId')
        .optional(), // Frontend uses this for cart management

    body('items.*.name')
        .optional(), // Frontend includes product name

    body('items.*.maxStock')
        .optional(), // Frontend includes max stock

    body('clientId')
        .optional({ nullable: true }),

    body('paymentMethod')
        .notEmpty().withMessage('El método de pago es obligatorio')
        .isIn(['cash', 'card', 'transfer', 'other']).withMessage('Método de pago inválido'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Las notas no pueden exceder 500 caracteres')
        .escape(),

    body('total')
        .isFloat({ min: 0 }).withMessage('El total debe ser un número positivo')
        .toFloat(),

    handleValidationErrors
];

/**
 * Validaciones para Sorteos
 */
export const validateCreateRaffle = [
    body('motive')
        .trim()
        .notEmpty().withMessage('El motivo del sorteo es obligatorio')
        .isLength({ min: 3, max: 200 }).withMessage('El motivo debe tener entre 3 y 200 caracteres')
        .escape(),

    body('prize')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('El premio no puede exceder 200 caracteres')
        .escape(),

    body('ticketPrice')
        .notEmpty().withMessage('El precio del boleto es obligatorio')
        .isFloat({ min: 0.01 }).withMessage('El precio del boleto debe ser mayor a 0')
        .toFloat(),

    body('drawDate')
        .optional()
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            // Validar que la fecha sea futura
            const drawDate = new Date(value);
            const now = new Date();
            if (drawDate <= now) {
                throw new Error('La fecha del sorteo debe ser futura');
            }
            return true;
        }),

    handleValidationErrors
];

export const validateUpdateRaffle = [
    param('id')
        .isUUID().withMessage('ID de sorteo inválido'),

    body('motive')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('El motivo debe tener entre 3 y 200 caracteres')
        .escape(),

    body('ticketPrice')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('El precio del boleto debe ser mayor a 0')
        .toFloat(),

    handleValidationErrors
];

/**
 * Validaciones para parámetros de ID
 */
export const validateIdParam = [
    param('id')
        .isUUID().withMessage('ID inválido'),

    handleValidationErrors
];

/**
 * Validaciones para queries de paginación
 */
export const validatePagination = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
        .toInt(),

    query('offset')
        .optional()
        .isInt({ min: 0 }).withMessage('El offset debe ser no negativo')
        .toInt(),

    handleValidationErrors
];
