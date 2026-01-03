# Database Migrations - Consolidated

## Overview

Los índices y restricciones de la base de datos ahora están **consolidados directamente en los modelos de Sequelize** en lugar de estar dispersos en archivos de migración SQL.

## Cambios Realizados

### 1. Modelo User.js
- ✅ Índices únicos para `email` y `phone` definidos en el modelo
- ✅ Validación de email agregada
- ✅ Soft delete (paranoid) habilitado
- ✅ Lógica de validación de duplicados manejada en `authService.js`

### 2. Estrategia de Soft Delete

**Problema Original:** MySQL no soporta índices parciales con cláusula `WHERE` (esa es una característica de PostgreSQL).

**Solución Implementada:**
- Los índices únicos se mantienen en `email` y `phone`
- La lógica de negocio en `authService.js` verifica duplicados considerando soft-deletes:
  ```javascript
  const existingEmail = await db.User.findOne({
      where: { email },
      paranoid: false // Include soft-deleted records
  });
  if (existingEmail && !existingEmail.deletedAt) {
      throw new Error("Ya existe una cuenta con este correo electrónico");
  }
  ```

### 3. Archivos Obsoletos

Los siguientes archivos de migración ya NO son necesarios:
- ❌ `add_partial_unique_indexes.sql` - Sintaxis no compatible con MySQL
- ❌ `quick_migration.sql` - Sintaxis no compatible con MySQL
- ❌ `sync_indexes.js` - Ya no necesario, índices en modelo
- ❌ `mysql_virtual_sync.js` - Ya no necesario
- ❌ `MIGRATION_GUIDE.md` - Obsoleto

## Cómo Funciona Ahora

### Registro de Usuario
1. Usuario intenta registrarse con email/phone
2. `authService.js` verifica si existe un usuario con ese email/phone (incluyendo soft-deleted)
3. Si existe y NO está eliminado (`deletedAt IS NULL`), rechaza el registro
4. Si existe pero SÍ está eliminado (`deletedAt IS NOT NULL`), permite el registro
5. El nuevo usuario se crea con el mismo email/phone

### Eliminación de Cuenta
1. Usuario elimina su cuenta desde el perfil
2. Sequelize hace soft delete (establece `deletedAt` a la fecha actual)
3. El usuario ya no aparece en consultas normales
4. El email/phone queda disponible para re-registro

## Sincronización de Base de Datos

Para aplicar los cambios del modelo a la base de datos:

```bash
# Opción 1: Sync automático (solo desarrollo)
npm run sync-db

# Opción 2: Manual con Sequelize
node -e "import db from './models/index.js'; await db.sequelize.sync({ alter: true }); process.exit(0);"
```

⚠️ **IMPORTANTE:** En producción, los índices ya deberían existir. Si no existen, Sequelize los creará automáticamente en el primer `sync()`.

## Verificación

Para verificar que los índices están correctamente creados:

```sql
SHOW INDEX FROM users;
```

Deberías ver:
- `users_email_unique` en la columna `email`
- `users_phone_unique` en la columna `phone`

## Migración desde Sistema Anterior

Si ya tienes índices parciales creados con los scripts antiguos, necesitas eliminarlos:

```sql
-- Eliminar índices parciales antiguos (si existen)
DROP INDEX IF EXISTS users_phone_active_unique ON users;
DROP INDEX IF EXISTS users_email_active_unique ON users;

-- Los índices correctos se crearán automáticamente por Sequelize
```

## Beneficios de Esta Aproximación

1. ✅ **Todo en un lugar:** Definición de esquema consolidada en modelos
2. ✅ **Compatible con MySQL:** No usa características de PostgreSQL
3. ✅ **Mantenible:** Cambios de esquema se hacen en el modelo, no en SQL
4. ✅ **Funcional:** Permite re-registro después de eliminación de cuenta
5. ✅ **Seguro:** Previene duplicados en usuarios activos
