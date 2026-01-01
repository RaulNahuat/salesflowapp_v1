# 🛡️ Guía de Recuperación de Base de Datos

## 📋 Resumen

Esta guía te ayudará a recuperar completamente tu base de datos en caso de pérdida accidental o para crear una nueva instancia desde cero.

---

## 🚨 Escenarios de Uso

### Escenario 1: Pérdida Total de la Base de Datos
Si borraste accidentalmente tu base de datos en Aiven.io:

```bash
# 1. Crear una nueva base de datos en Aiven.io
# 2. Actualizar las credenciales en .env
# 3. Ejecutar el script de reconstrucción
node scripts/rebuild_database.js
```

### Escenario 2: Nueva Instalación
Para crear una base de datos en un nuevo servidor:

```bash
node scripts/rebuild_database.js
```

### Escenario 3: Ambiente de Desarrollo/Testing
Para resetear tu base de datos de desarrollo:

```bash
node scripts/rebuild_database.js
```

---

## 📦 ¿Qué Incluye el Script de Reconstrucción?

El script `rebuild_database.js` reconstruye **TODO** lo necesario:

### ✅ Tablas Creadas
- `businesses` - Negocios
- `businessmembers` - Miembros/Empleados
- `users` - Usuarios del sistema
- `clients` - Clientes
- `products` - Productos
- `productvariants` - Variantes de productos (tallas, colores)
- `productimages` - Imágenes de productos
- `sales` - Ventas
- `saledetails` - Detalles de cada venta
- `payments` - Pagos
- `raffles` - Rifas
- `raffletickets` - Boletos de rifa
- `receipttokens` - Tokens de recibos

### ✅ Columnas Especiales
- `deletedAt` - Para soft delete (eliminación suave)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización
- `SellerId` - ID del vendedor en ventas

### ✅ Índices de Rendimiento
- Índices compuestos para búsquedas rápidas
- Índices únicos para validación
- Índices de fechas para reportes

### ✅ Relaciones (Foreign Keys)
- Business → Products, Sales, Clients, Raffles
- User → BusinessMembers
- Client → Sales
- Product → ProductVariants, ProductImages, SaleDetails
- Sale → SaleDetails, Payments, RaffleTickets
- Raffle → RaffleTickets

---

## 🔧 Estructura de la Base de Datos

### Definición Principal
**Ubicación:** `models/`

Cada archivo en `models/` define una tabla:
- `Business.js` → Tabla `businesses`
- `Client.js` → Tabla `clients`
- `Product.js` → Tabla `products`
- etc.

**Archivo Maestro:** `models/index.js`
- Define todas las relaciones entre tablas
- Importa todos los modelos
- Configura las asociaciones

### Migraciones
**Ubicación:** `migrations/`

Archivos que modifican la estructura existente:
- `20250101000000-add-performance-indexes.js` - Índices de optimización
- `20250101000000-add-seller-id-to-sales.cjs` - Columna de vendedor

---

## 📝 Cómo Hacer Cambios Futuros

### Opción 1: Modificar Modelos (Recomendado para nuevas tablas)

1. **Crear/Modificar archivo en `models/`**
   ```javascript
   // models/Category.js
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

2. **Registrar en `models/index.js`**
   ```javascript
   import CategoryModel from './Category.js';
   
   db.Category = CategoryModel(sequelize, DataTypes);
   
   // Relaciones
   db.Category.hasMany(db.Product);
   db.Product.belongsTo(db.Category);
   ```

3. **Ejecutar script de reconstrucción** (solo en desarrollo)
   ```bash
   node scripts/rebuild_database.js
   ```

### Opción 2: Crear Migración (Recomendado para producción)

1. **Instalar Sequelize CLI**
   ```bash
   npm install --save-dev sequelize-cli
   ```

2. **Crear archivo de migración**
   ```bash
   npx sequelize-cli migration:generate --name add-category-table
   ```

3. **Editar el archivo generado**
   ```javascript
   export async function up(queryInterface, Sequelize) {
       await queryInterface.createTable('categories', {
           id: {
               type: Sequelize.UUID,
               defaultValue: Sequelize.UUIDV4,
               primaryKey: true
           },
           name: {
               type: Sequelize.STRING,
               allowNull: false
           },
           createdAt: {
               type: Sequelize.DATE,
               allowNull: false
           },
           updatedAt: {
               type: Sequelize.DATE,
               allowNull: false
           },
           deletedAt: {
               type: Sequelize.DATE,
               allowNull: true
           }
       });
   }

   export async function down(queryInterface, Sequelize) {
       await queryInterface.dropTable('categories');
   }
   ```

4. **Ejecutar migración**
   ```bash
   npx sequelize-cli db:migrate
   ```

---

## 💾 Backup y Restauración

### Crear Backup

#### Opción 1: Desde Aiven.io Dashboard
1. Ir a tu servicio en Aiven.io
2. Pestaña "Backups"
3. Crear backup manual

#### Opción 2: Usando mysqldump
```bash
# Exportar toda la base de datos
mysqldump -h <AIVEN_HOST> -P <AIVEN_PORT> -u <AIVEN_USER> -p --ssl-mode=REQUIRED <DATABASE_NAME> > backup.sql

# Exportar solo estructura (sin datos)
mysqldump -h <AIVEN_HOST> -P <AIVEN_PORT> -u <AIVEN_USER> -p --ssl-mode=REQUIRED --no-data <DATABASE_NAME> > schema.sql

# Exportar solo datos
mysqldump -h <AIVEN_HOST> -P <AIVEN_PORT> -u <AIVEN_USER> -p --ssl-mode=REQUIRED --no-create-info <DATABASE_NAME> > data.sql
```

### Restaurar Backup

```bash
# Restaurar desde archivo SQL
mysql -h <AIVEN_HOST> -P <AIVEN_PORT> -u <AIVEN_USER> -p --ssl-mode=REQUIRED <DATABASE_NAME> < backup.sql
```

---

## 🗑️ Archivos Seguros para Eliminar

### ✅ Puedes Borrar (Scripts Temporales)
- `scripts/tools/` - Todos los archivos (34 scripts de parches)
- `scripts/add_soft_delete_columns.js` - Ya aplicado
- `scripts/cleanup_duplicate_tables.sql` - Ya aplicado
- `*.txt`, `*.log`, `*.json` - Archivos de log antiguos

### ⚠️ CONSERVAR (Archivos Importantes)
- `models/` - **CRÍTICO** - Define toda la estructura
- `migrations/` - **IMPORTANTE** - Historial de cambios
- `scripts/rebuild_database.js` - **NUEVO** - Script de recuperación
- `config/db.js` - Configuración de conexión
- `.env` - Credenciales

---

## 🔍 Verificación de Integridad

### Verificar que todas las tablas existen
```bash
node -e "
import { sequelize } from './config/db.js';
const [tables] = await sequelize.query('SHOW TABLES');
console.log('Tablas:', tables.map(t => Object.values(t)[0]));
process.exit(0);
"
```

### Verificar columnas de una tabla
```bash
node -e "
import { sequelize } from './config/db.js';
const [cols] = await sequelize.query('SHOW COLUMNS FROM sales');
console.log('Columnas:', cols.map(c => c.Field));
process.exit(0);
"
```

### Verificar índices
```bash
node -e "
import { sequelize } from './config/db.js';
const [indexes] = await sequelize.query('SHOW INDEX FROM sales');
console.log('Índices:', indexes.map(i => i.Key_name));
process.exit(0);
"
```

---

## 📞 Soporte

Si tienes problemas durante la recuperación:

1. **Verifica las credenciales** en `.env`
2. **Revisa los logs** del script de reconstrucción
3. **Verifica la conexión** a Aiven.io
4. **Consulta los errores** específicos en la consola

---

## 📚 Recursos Adicionales

- [Documentación de Sequelize](https://sequelize.org/docs/v6/)
- [Documentación de Aiven.io](https://docs.aiven.io/)
- [Guía de Migraciones de Sequelize](https://sequelize.org/docs/v6/other-topics/migrations/)

---

**Última actualización:** 2026-01-01
**Versión:** 1.0.0
