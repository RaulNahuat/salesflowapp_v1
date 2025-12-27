import { useState, useEffect } from "react";

export default function ClientForm({ client, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        es_frecuente: false,
        estatus_id: 1, // Default to Activo
    });

    useEffect(() => {
        if (client) {
            setFormData({
                nombre: client.nombre || "",
                apellido: client.apellido || "",
                telefono: client.telefono || "",
                direccion: client.direccion || "",
                es_frecuente: client.es_frecuente || false,
                estatus_id: client.estatus_id || 1,
            });
        }
    }, [client]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{client ? "Editar Cliente" : "Nuevo Cliente"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border text-black border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                        type="text"
                        name="apellido"
                        required
                        value={formData.apellido}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border text-black border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border text-black border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border text-black border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            name="es_frecuente"
                            checked={formData.es_frecuente}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-gray-700">Es Cliente Frecuente</span>
                    </label>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Guardar
                </button>
            </div>
        </form>
    );
}
