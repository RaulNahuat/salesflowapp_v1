# Database Schema - User Soft Delete Strategy

## Cómo Funciona

### Problema
MySQL no soporta índices parciales (con cláusula `WHERE`), por lo que no podemos tener índices únicos que solo apliquen a usuarios activos.

### Solución Implementada
Cuando un usuario elimina su cuenta:
1. Se hace soft delete (se establece `deletedAt`)
2. **El email y phone se modifican** agregando un prefijo con timestamp: `deleted_{timestamp}_{original_value}`
3. Esto libera el email/phone original para que pueda ser usado por un nuevo usuario

### Ejemplo
```javascript
// Usuario original
email: "juan@example.com"
phone: "5551234567"

// Después de eliminar la cuenta
email: "deleted_1704312000000_juan@example.com"
phone: "deleted_1704312000000_5551234567"
deletedAt: "2026-01-03 14:00:00"

// Ahora "juan@example.com" y "5551234567" están disponibles para re-registro
```

## Archivos Modificados

### `models/User.js`
- Agregado hook `beforeDestroy` que modifica email/phone antes de soft delete
- Índices únicos normales en email y phone
- `allowNull: true` para email y phone (permiten NULL en usuarios eliminados)

### `services/authService.js`
- Simplificada la validación de duplicados
- Ya no necesita buscar usuarios soft-deleted porque tienen emails/phones modificados

## Sincronización de Base de Datos

Para aplicar los cambios:

```bash
npm run sync-db
```

Esto creará los índices únicos necesarios.

## Verificación

```sql
-- Ver índices
SHOW INDEX FROM users;

-- Probar eliminación y re-registro
-- 1. Crear usuario con email test@example.com
-- 2. Eliminar cuenta
-- 3. Verificar que el email fue modificado
SELECT email, phone, deletedAt FROM users WHERE email LIKE 'deleted_%';

-- 4. Crear nuevo usuario con test@example.com
-- 5. Debería funcionar sin errores
```

## Beneficios

1. ✅ Compatible con MySQL (no usa características de PostgreSQL)
2. ✅ Permite re-registro después de eliminación
3. ✅ Mantiene integridad de datos únicos en usuarios activos
4. ✅ No requiere lógica compleja en la aplicación
5. ✅ Los usuarios eliminados mantienen su historial con email/phone modificado
