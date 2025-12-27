import { useState, useEffect } from "react";
import { getClientes, createCliente, updateCliente, changeClienteStatus } from "../../services/clientApi";
import ClientForm from "./ClientForm";

export default function ClientsPage() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await getClientes();
            setClientes(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Error al cargar clientes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleCreate = () => {
        setCurrentClient(null);
        setIsEditing(true);
    };

    const handleEdit = (client) => {
        setCurrentClient(client);
        setIsEditing(true);
    };

    const handleSubmit = async (formData) => {
        try {
            if (currentClient) {
                await updateCliente(currentClient.cliente_id, formData);
            } else {
                await createCliente(formData);
            }
            setIsEditing(false);
            setCurrentClient(null);
            loadClients();
        } catch (err) {
            console.error(err);
            alert("Error al guardar cliente: " + (err.response?.data?.message || err.message));
        }
    };

    const handleStatusChange = async (id, currentStatusId) => {
        // Assuming status_id 1 is Activo, 2 is Inactivo. 
        // Logic might need adjustment based on your specific IDs.
        // Based on backend Middleware logic: 'activar' -> Activo, 'inactivar' -> Inactivo
        // Let's guess: if currentStatusId === 1 (Activo) -> inactivar.

        const action = currentStatusId === 1 ? "inactivar" : "activar";

        if (!window.confirm(`¿Estás seguro de que deseas ${action} este cliente?`)) return;

        try {
            await changeClienteStatus(id, action);
            loadClients();
        } catch (err) {
            console.error(err);
            alert("Error al cambiar estatus: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading && !isEditing) return <div className="p-4 text-white">Cargando clientes...</div>;

    if (isEditing) {
        return (
            <div className="p-4">
                <ClientForm
                    client={currentClient}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Gestión de Clientes</h1>
                <button
                    onClick={handleCreate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
                >
                    + Nuevo Cliente
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clientes.map((client) => (
                            <tr key={client.cliente_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{client.nombre} {client.apellido}</div>
                                    {client.es_frecuente && <span className="text-xs text-indigo-600 font-semibold">Frecuente</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{client.telefono}</div>
                                    <div className="text-sm text-gray-500">{client.direccion}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.estatus_id === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {client.estatus_id === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(client.cliente_id, client.estatus_id)}
                                        className={`${client.estatus_id === 1 ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                    >
                                        {client.estatus_id === 1 ? 'Inactivar' : 'Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {clientes.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    No hay clientes registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
