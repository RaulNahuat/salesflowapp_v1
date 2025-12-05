import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Rifa = sequelize.define("Rifas", {
  rifa_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  premio: { type: DataTypes.STRING(255), allowNull: false },
  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_sorteo: { type: DataTypes.DATEONLY, allowNull: false },
}, {
  tableName: "Rifas",
  timestamps: false,
});
