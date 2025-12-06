import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Cliente } from "./Cliente.js";
import { Estatus } from "./Estatus.js";

export const Venta = sequelize.define("Ventas", {
  venta_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  cliente_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  fecha_venta: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  total_venta: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  estatus_id: { type: DataTypes.INTEGER, allowNull: false },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: "Ventas",
  timestamps: false,
});
