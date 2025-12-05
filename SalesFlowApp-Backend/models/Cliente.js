import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Estatus } from "./Estatus.js";

export const Cliente = sequelize.define("Clientes", {
  cliente_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  telefono: { type: DataTypes.STRING(15), unique: true },
  direccion: { type: DataTypes.STRING(255) },
  es_frecuente: { type: DataTypes.BOOLEAN, defaultValue: false },
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  estatus_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Estatus, key: "estatus_id" }
  },
}, {
  tableName: "Clientes",
  timestamps: false,
});
