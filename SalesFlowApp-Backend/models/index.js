import { sequelize } from "../config/db.js";

import { Estatus } from "./Estatus.js";
import { Cliente } from "./Cliente.js";
import { Producto } from "./Producto.js";
import { InventarioAtributo } from "./InventarioAtributo.js";
import { Venta } from "./Venta.js";
import { DetalleVenta } from "./DetalleVenta.js";
import { Rifa } from "./Rifa.js";
import { Boleto } from "./Boleto.js";
import { Usuario } from "./Usuario.js";

// =========== RELACIONES ===========

// CLIENTES → ESTATUS
Cliente.belongsTo(Estatus, { foreignKey: "estatus_id" });

// PRODUCTOS → ESTATUS
Producto.belongsTo(Estatus, { foreignKey: "estatus_id" });

// INVENTARIO → PRODUCTO
InventarioAtributo.belongsTo(Producto, { foreignKey: "producto_id" });
Producto.hasMany(InventarioAtributo, { foreignKey: "producto_id" });

// VENTAS → CLIENTES
Venta.belongsTo(Cliente, { foreignKey: "cliente_id" });

// VENTAS → ESTATUS
Venta.belongsTo(Estatus, { foreignKey: "estatus_id" });

// DETALLE_VENTA → VENTAS & PRODUCTOS
DetalleVenta.belongsTo(Venta, { foreignKey: "venta_id" });
DetalleVenta.belongsTo(Producto, { foreignKey: "producto_id" });

Venta.hasMany(DetalleVenta, { foreignKey: "venta_id" });
Producto.hasMany(DetalleVenta, { foreignKey: "producto_id" });

// BOLETOS → RIFAS, CLIENTES, VENTAS
Boleto.belongsTo(Rifa, { foreignKey: "rifa_id" });
Boleto.belongsTo(Cliente, { foreignKey: "cliente_id" });
Boleto.belongsTo(Venta, { foreignKey: "venta_id" });

// EXPORTAR
export {
  sequelize,
  Estatus,
  Cliente,
  Producto,
  InventarioAtributo,
  Venta,
  DetalleVenta,
  Rifa,
  Boleto,
  Usuario
};
