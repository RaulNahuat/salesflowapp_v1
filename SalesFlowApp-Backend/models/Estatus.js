import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Estatus = sequelize.define("Estatus", {
  estatus_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: "Ej: Activo, Inactivo, Entregado, Disponible",
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "Ej: Cliente, Venta, Producto",
  },
}, {
  tableName: "Estatus",
  timestamps: false,
});
