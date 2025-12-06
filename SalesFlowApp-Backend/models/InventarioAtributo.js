import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Producto } from "./Producto.js";

export const InventarioAtributo = sequelize.define("InventarioAtributo", {
  inventario_id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  producto_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  nombre_atributo: { 
    type: DataTypes.STRING(50), 
    allowNull: false 
  },
  valor_atributo: { 
    type: DataTypes.STRING(50), 
    allowNull: false 
  },
  stock_atributo: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  },
}, {
  tableName: "InventarioAtributo",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["producto_id", "nombre_atributo", "valor_atributo"]
    }
  ]
});
