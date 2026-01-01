# 📁 Scripts de Base de Datos

Esta carpeta contiene scripts de utilidad para gestionar la base de datos de SalesFlowApp.

---

## 🚀 Scripts Activos (Usar estos)

### `rebuild_database.js` ⭐ **IMPORTANTE**
**Propósito:** Reconstruye completamente la base de datos desde cero.

**Cuándo usar:**
- 🚨 Recuperación de desastres (si borraste la DB accidentalmente)
- 🆕 Crear una nueva base de datos en otro servidor
- 🧪 Resetear ambiente de desarrollo/testing

**Cómo usar:**
```bash
node scripts/rebuild_database.js
```

**⚠️ ADVERTENCIA:** Este script BORRA todos los datos existentes. Solo úsalo cuando estés seguro.

**Qué hace:**
1. ✅ Crea todas las 13 tablas
2. ✅ Agrega columnas especiales (`deletedAt`, `SellerId`, etc.)
3. ✅ Crea todos los índices de rendimiento
4. ✅ Configura todas las relaciones (foreign keys)

---

### `backup_schema.js` 💾
**Propósito:** Crea un backup de la estructura de la base de datos (sin datos).

**Cuándo usar:**
- 📋 Antes de hacer cambios importantes
- 📦 Para documentar la estructura actual
- 🔄 Antes de migrar a otro servidor

**Cómo usar:**
```bash
node scripts/backup_schema.js
```

**Resultado:** Crea un archivo en `backups/schema_YYYY-MM-DD_HH-MM-SS.sql`

**Qué incluye:**
- Definición de todas las tablas
- Índices
- Foreign keys
- Constraints

---

## 📜 Scripts Históricos (Ya aplicados)

### `add_soft_delete_columns.js`
**Estado:** ✅ Ya aplicado

**Qué hizo:** Agregó las columnas `deletedAt`, `createdAt`, `updatedAt` a todas las tablas.

**Nota:** Ya no es necesario ejecutarlo. La funcionalidad está incluida en `rebuild_database.js`.

---

### `cleanup_duplicate_tables.sql`
**Estado:** ✅ Ya aplicado

**Qué hizo:** Limpió tablas duplicadas durante la migración inicial a Aiven.io.

**Nota:** Ya no es necesario. Fue un parche de un solo uso.

---

## 🗂️ Carpeta `tools/` (Obsoleta)

Esta carpeta contiene **34 scripts de parches temporales** que ya cumplieron su función:

- `fix_*.js` - Parches para arreglar problemas específicos
- `patch_*.js` - Modificaciones puntuales ya aplicadas
- `test_*.js` - Scripts de prueba
- `migrate_*.js` - Migraciones manuales ya ejecutadas

**Estado:** ✅ Seguros para eliminar

**Por qué:** Todos estos cambios ya están:
1. Aplicados en la base de datos de Aiven.io
2. Incluidos en los modelos de `models/`
3. Incorporados en `rebuild_database.js`

---

## 📋 Flujo de Trabajo Recomendado

### Para Desarrollo Normal

1. **Modificar modelos** en `models/`
2. **Crear migración** (si es producción):
   ```bash
   npx sequelize-cli migration:generate --name descripcion-del-cambio
   ```
3. **Ejecutar migración**:
   ```bash
   npx sequelize-cli db:migrate
   ```

### Para Recuperación de Desastres

1. **Crear backup** (si aún tienes acceso):
   ```bash
   node scripts/backup_schema.js
   ```
2. **Reconstruir DB**:
   ```bash
   node scripts/rebuild_database.js
   ```
3. **Restaurar datos** (si tienes backup):
   ```bash
   mysql -h <HOST> -u <USER> -p <DATABASE> < backup_data.sql
   ```

### Para Nuevo Servidor

1. **Configurar `.env`** con nuevas credenciales
2. **Ejecutar reconstrucción**:
   ```bash
   node scripts/rebuild_database.js
   ```
3. **Crear usuario admin** y datos iniciales

---

## 🗑️ Limpieza Recomendada

### Archivos seguros para eliminar:

```bash
# Eliminar carpeta tools completa
rm -rf scripts/tools/

# Eliminar scripts históricos
rm scripts/add_soft_delete_columns.js
rm scripts/cleanup_duplicate_tables.sql

# Eliminar logs antiguos (en la raíz del proyecto)
rm *.txt *.log *.json
```

### Archivos a CONSERVAR:

- ✅ `scripts/rebuild_database.js` - **CRÍTICO**
- ✅ `scripts/backup_schema.js` - **IMPORTANTE**
- ✅ `scripts/README.md` - Esta documentación

---

## 📚 Documentación Adicional

Para más información, consulta:
- [`DATABASE_RECOVERY.md`](../DATABASE_RECOVERY.md) - Guía completa de recuperación
- [`models/README.md`](../models/README.md) - Documentación de modelos (si existe)
- [Documentación de Sequelize](https://sequelize.org/docs/v6/)

---

## 🆘 Soporte

Si tienes problemas:

1. **Verifica la conexión** a Aiven.io
2. **Revisa las credenciales** en `.env`
3. **Consulta los logs** de los scripts
4. **Lee** `DATABASE_RECOVERY.md` para más detalles

---

**Última actualización:** 2026-01-01  
**Mantenido por:** Raúl Nahuat
