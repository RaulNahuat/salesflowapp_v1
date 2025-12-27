import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clientApi from '../../services/clientApi';
import { FaUser, FaPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle, FaPhone, FaEnvelope } from 'react-icons/fa';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await clientApi.getClients();
                setClients(data);
            } catch (err) {
                console.error("Fetch clients error:", err);
                setError(err.message || 'Error al cargar clientes');
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const confirmDelete = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Cliente',
            message: '¿Estás seguro de que deseas eliminar este cliente? Se borrará de tu base de datos.',
            isDatgerous: true,
            confirmText: 'Eliminar',
            action: async () => {
                try {
                    await clientApi.deleteClient(id);
                    setClients(prev => prev.filter(c => c.id !== id));
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    toast.success('Cliente eliminado correctamente');
                } catch (err) {
                    toast.error('No se pudo eliminar el cliente');
                }
            }
        });
    };

    const filteredClients = clients.filter(client =>
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.lastName && client.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-500 text-sm">Administra tu base de datos de clientes</p>
                </div>
                <Link
                    to="/clients/new"
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all"
                >
                    <FaPlus className="mr-2" /> Nuevo Cliente
                </Link>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center">
                    <FaExclamationTriangle className="mr-3 text-red-500" />
                    <div>
                        <p className="font-bold">Ha ocurrido un error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && clients.length === 0 && !error && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FaUser className="text-blue-200 text-3xl" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No tienes clientes aún</h3>
                    <p className="text-gray-500 mb-6">Registra a tus clientes para vender más rápido.</p>
                    <Link
                        to="/clients/new"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Registrar Cliente &rarr;
                    </Link>
                </div>
            )}

            {/* Client List */}
            {clients.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cliente por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Ubicación</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                                    {client.firstName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{client.firstName} {client.lastName}</p>
                                                    <p className="text-xs text-gray-500">Registrado recientemente</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 space-y-1">
                                                {client.phone && (
                                                    <div className="flex items-center">
                                                        <FaPhone className="text-gray-400 mr-2 text-xs" />
                                                        {client.phone}
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="flex items-center">
                                                        <FaEnvelope className="text-gray-400 mr-2 text-xs" />
                                                        {client.email}
                                                    </div>
                                                )}
                                                {!client.phone && !client.email && <span className="text-gray-400 italic">Sin contacto</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {client.address || <span className="text-gray-400 italic">No especificada</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Link
                                                    to={`/clients/edit/${client.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => confirmDelete(client.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* Modal de Confirmación */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDatgerous={modalConfig.isDatgerous}
                confirmText={modalConfig.confirmText}
            />
        </div>
    );
};

export default ClientList;
