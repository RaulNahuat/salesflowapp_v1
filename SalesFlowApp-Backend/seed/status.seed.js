import { Estatus } from "../models/Estatus.js";

// Lista de estatus iniciales
const estatusData = [
  // CLIENTES
  { nombre: "Activo", tipo: "Cliente" },
  { nombre: "Inactivo", tipo: "Cliente" },

  // PRODUCTOS
  { nombre: "Disponible", tipo: "Producto" },
  { nombre: "Agotado", tipo: "Producto" },

  // VENTAS
  { nombre: "Pendiente", tipo: "Venta" },
  { nombre: "Pagado", tipo: "Venta" },
  { nombre: "Cancelado", tipo: "Venta" },
  { nombre: "Entregado", tipo: "Venta" },
];

export const seedEstatus = async () => {
  try {
    for (const estatus of estatusData) {
      const exists = await Estatus.findOne({
        where: {
          nombre: estatus.nombre,
          tipo: estatus.tipo
        }
      });

      if (!exists) {
        await Estatus.create(estatus);
        console.log(`✔ Estatus creado: ${estatus.nombre} (${estatus.tipo})`);
      } else {
        console.log(`↷ Estatus ya existe: ${estatus.nombre} (${estatus.tipo})`);
      }
    }

    console.log("Seed de Estatus completado.");
  } catch (error) {
    console.error("Error al ejecutar seed de Estatus:", error);
  }
};
