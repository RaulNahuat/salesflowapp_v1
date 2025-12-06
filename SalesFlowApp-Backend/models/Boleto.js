import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Boleto = sequelize.define("Boletos", {
  boleto_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  rifa_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  cliente_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  venta_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  codigo_unico: { 
    type: DataTypes.STRING(20), 
    allowNull: false, 
    unique: true 
  },
  motivo_generacion: { 
    type: DataTypes.STRING(255) 
  },
  fecha_generacion: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  fecha_caducidad: { 
    type: DataTypes.DATE 
  },
  ganador: { 
    type: DataTypes.BOOLEAN, defaultValue: false 
  },
}, {
  tableName: "Boletos",
  timestamps: false,
});
