import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const DetalleVenta = sequelize.define("DetalleVenta", {
  detalle_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  venta_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  producto_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  cantidad: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  precio_registrado: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  atributo_usado: { 
    type: DataTypes.STRING(255) 
  },
}, {
  tableName: "DetalleVenta",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["venta_id", "producto_id"] }
  ]
});
