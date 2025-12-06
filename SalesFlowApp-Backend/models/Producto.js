import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Estatus } from "./Estatus.js";

export const Producto = sequelize.define("Productos", {
  producto_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nombre: { 
    type: DataTypes.STRING(150), 
    unique: true, 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.TEXT 
  },
  stock_actual: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  },
  precio_base: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  fecha_registro: { 
    type: DataTypes.DATEONLY, 
    defaultValue: DataTypes.NOW 
  },
  estatus_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Estatus, key: "estatus_id" }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: "Productos",
  timestamps: false,
});
