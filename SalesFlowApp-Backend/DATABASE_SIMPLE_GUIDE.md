# 🎯 Guía Simple de Base de Datos

## ✅ **Enfoque Recomendado (SIMPLE)**

Tu base de datos se maneja de forma simple y directa:

---

## 📋 **Cómo Funciona Actualmente**

### **1. Los Modelos SON la Fuente de Verdad**

**Ubicación:** `models/`

Cada archivo define completamente una tabla:
- `Client.js` → Tabla `clients`
- `Product.js` → Tabla `products`
- `Sale.js` → Tabla `sales`
- etc.

**Características automáticas:**
- ✅ `timestamps: true` → Crea `createdAt` y `updatedAt`
- ✅ `paranoid: true` → Crea `deletedAt` (soft delete)
- ✅ Relaciones definidas en `models/index.js`

### **2. Sincronización Automática (Desactivada en Producción)**

**En `server.js` línea 119:**
```javascript
// await sequelize.sync(); // DESACTIVADO para evitar cambios accidentales
```

**Por qué está desactivado:**
- ⚠️ En producción, `sync()` puede ser peligroso
- ⚠️ Puede borrar datos si usas `{ force: true }`
- ⚠️ Puede causar errores con índices

---

## 🚀 **Flujo de Trabajo Recomendado**

### **Para Desarrollo (Tu Máquina Local)**

#### **Opción 1: Usar `rebuild_database.js`** ⭐ (RECOMENDADO)

Cuando quieras recrear la DB desde cero:

```bash
node scripts/rebuild_database.js
```

**Qué hace:**
- ✅ Borra todas las tablas
- ✅ Crea todas las tablas desde los modelos
- ✅ Agrega todos los índices
- ✅ Configura todas las relaciones

**Cuándo usar:**
- 🆕 Primera vez que configuras el proyecto
- 🔄 Cuando quieras empezar de cero
- 🐛 Cuando la DB esté corrupta

#### **Opción 2: Activar `sync()` temporalmente**

Para desarrollo rápido, puedes activar sync en `server.js`:

```javascript
// En server.js, línea 119:
await sequelize.sync({ alter: true }); // Descomentar solo en desarrollo
console.log('Base de datos sincronizada correctamente');
```

**⚠️ IMPORTANTE:** 
- Solo para desarrollo local
- NUNCA en producción
- Comentar de nuevo cuando termines

---

### **Para Producción (Aiven.io)**

#### **Opción 1: Usar el backup SQL**

Si necesitas recrear la DB en producción:

```bash
mysql -h <AIVEN_HOST> -P <PORT> -u <USER> -p --ssl-mode=REQUIRED defaultdb < backups/schema_2026-01-01T20-10-07.sql
```

#### **Opción 2: Usar `rebuild_database.js`**

```bash
# Asegúrate de que .env apunte a producción
node scripts/rebuild_database.js
```

---

## 🔧 **Cómo Hacer Cambios en la DB**

### **Escenario 1: Agregar una Nueva Columna**

**Ejemplo:** Agregar `email` a clientes

1. **Editar el modelo** `models/Client.js`:
   ```javascript
   email: {
       type: DataTypes.STRING,
       allowNull: true,
       validate: {
           isEmail: true
       }
   }
   ```

2. **Aplicar el cambio:**

   **En desarrollo:**
   ```bash
   # Opción A: Recrear DB completa
   node scripts/rebuild_database.js
   
   # Opción B: Usar sync con alter
   # Descomentar en server.js: await sequelize.sync({ alter: true });
   # Reiniciar servidor
   ```

   **En producción:**
   ```sql
   # Conectar a Aiven y ejecutar:
   ALTER TABLE clients ADD COLUMN email VARCHAR(255);
   ```

### **Escenario 2: Crear una Nueva Tabla**

**Ejemplo:** Agregar tabla `categories`

1. **Crear modelo** `models/Category.js`:
   ```javascript
   export default (sequelize, DataTypes) => {
       return sequelize.define('Category', {
           id: {
               type: DataTypes.UUID,
               defaultValue: DataTypes.UUIDV4,
               primaryKey: true
           },
           name: {
               type: DataTypes.STRING,
               allowNull: false
           }
       }, {
           tableName: 'categories',
           timestamps: true,
           paranoid: true
       });
   };
   ```

2. **Registrar en** `models/index.js`:
   ```javascript
   import CategoryModel from './Category.js';
   
   db.Category = CategoryModel(sequelize, DataTypes);
   
   // Relaciones
   db.Category.hasMany(db.Product);
   db.Product.belongsTo(db.Category);
   ```

3. **Aplicar el cambio:**
   ```bash
   # Recrear DB
   node scripts/rebuild_database.js
   ```

### **Escenario 3: Modificar una Columna Existente**

**Ejemplo:** Cambiar `phone` de opcional a requerido

1. **Editar el modelo:**
   ```javascript
   phone: {
       type: DataTypes.STRING,
       allowNull: false  // Cambiar de true a false
   }
   ```

2. **Aplicar en producción:**
   ```sql
   ALTER TABLE clients MODIFY COLUMN phone VARCHAR(255) NOT NULL;
   ```

---

## 🎯 **Cuándo Usar Migraciones**

**Solo necesitas migraciones cuando:**

1. ❌ **NO las necesitas para desarrollo** - Usa `rebuild_database.js`
2. ✅ **Sí las necesitas en producción con datos importantes**
3. ✅ **Cuando el cambio puede perder datos** (renombrar columnas, cambiar tipos)
4. ✅ **Cuando trabajas en equipo** (control de versiones de la DB)

**Para tu caso actual:** NO necesitas migraciones todavía.

---

## 📦 **Backups Regulares**

**Recomendación:** Hacer backup antes de cambios importantes

```bash
# Crear backup
node scripts/backup_schema.js

# Se guarda en: backups/schema_YYYY-MM-DD_HH-MM-SS.sql
```

**Frecuencia recomendada:**
- 📅 Semanal (automático si quieres)
- ⚠️ Antes de cambios importantes
- 🚀 Antes de deploy a producción

---

## 🗑️ **Archivos que NO Necesitas**

### **Puedes eliminar:**
- ❌ `migrations/` - No las usas actualmente
- ❌ Configuración de Sequelize CLI

### **Debes conservar:**
- ✅ `models/` - **CRÍTICO** - Fuente de verdad
- ✅ `scripts/rebuild_database.js` - Recuperación
- ✅ `scripts/backup_schema.js` - Backups
- ✅ `backups/` - Backups guardados

---

## 🎯 **Resumen del Flujo Simple**

### **Desarrollo:**
```
1. Modificar modelo en models/
2. Ejecutar: node scripts/rebuild_database.js
3. ¡Listo!
```

### **Producción:**
```
1. Modificar modelo en models/
2. Crear backup: node scripts/backup_schema.js
3. Ejecutar SQL manualmente en Aiven
   O ejecutar: node scripts/rebuild_database.js (si no hay datos importantes)
4. ¡Listo!
```

---

## ✅ **Ventajas de Este Enfoque**

- ✅ **Simple** - Un solo lugar de verdad
- ✅ **Rápido** - No archivos extra
- ✅ **Claro** - El modelo ES la estructura
- ✅ **Flexible** - Fácil de cambiar
- ✅ **Seguro** - Backups automáticos disponibles

---

## 🚀 **Próximos Pasos**

1. **Mantén tus modelos actualizados** - Son la fuente de verdad
2. **Usa `rebuild_database.js`** - Para desarrollo
3. **Haz backups regulares** - Antes de cambios importantes
4. **SQL directo en producción** - Para cambios pequeños
5. **Considera migraciones** - Solo cuando tengas datos críticos en producción

---

**Última actualización:** 2026-01-01  
**Filosofía:** Keep It Simple, Stupid (KISS) 🎯
