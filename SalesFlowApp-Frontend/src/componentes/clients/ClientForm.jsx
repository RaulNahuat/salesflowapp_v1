import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import clientApi from '../../services/clientApi';
import { FaSave, FaArrowLeft, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaStickyNote } from 'react-icons/fa';

const ClientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [client, setClient] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchClient = async () => {
                try {
                    const data = await clientApi.getClient(id);
                    setClient({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        notes: data.notes || ''
                    });
                } catch (err) {
                    setError('Error al cargar el cliente para editar');
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchClient();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClient(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditMode) {
                await clientApi.updateClient(id, client);
                toast.success('Cliente actualizado correctamente');
            } else {
                await clientApi.createClient(client);
                toast.success('Cliente creado correctamente');
            }
            navigate('/clients');
        } catch (err) {
            let msg = 'Error al guardar el cliente';

            // Handle specific error types
            if (err.status === 403) {
                msg = `❌ Permiso denegado: ${err.message}. Contacta al propietario del negocio.`;
            } else if (err.status === 409 && err.data?.existingClient) {
                // Duplicate phone error
                const existing = err.data.existingClient;
                msg = `El teléfono ${existing.phone} ya está registrado para ${existing.firstName} ${existing.lastName}`;
            } else if (err.status === 400) {
                msg = `⚠️ Validación: ${err.message}`;
            } else {
                msg = err.message || msg;
            }

            setError(msg);
            toast.error(msg, { duration: 5000 });
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link to="/clients" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4">
                    <FaArrowLeft className="mr-2" /> Volver a Clientes
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode ? 'Actualiza los datos del cliente.' : 'Registra un nuevo cliente para futuras ventas.'}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="firstName">
                            Nombre
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={client.firstName}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                                placeholder="Ej. Juan"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="lastName">
                            Apellido (Opcional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={client.lastName}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                                placeholder="Ej. Pérez"
                            />
                        </div>
                    </div>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="phone">
                            Teléfono
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaPhone className="text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={client.phone}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                                placeholder="55 1234 5678"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaEnvelope className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={client.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                                placeholder="juan@ejemplo.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Dirección */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="address">
                        Dirección
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaMapMarkerAlt className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={client.address}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="Calle, Número, Colonia"
                        />
                    </div>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="notes">
                        Notas (Opcional)
                    </label>
                    <div className="relative">
                        <div className="absolute top-3 left-4 flex items-center pointer-events-none">
                            <FaStickyNote className="text-gray-400" />
                        </div>
                        <textarea
                            id="notes"
                            name="notes"
                            value={client.notes}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 min-h-[100px]"
                            placeholder="Preferencias del cliente, cumpleaños..."
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Link
                        to="/clients"
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <FaSave className="mr-2" /> Guardar Cliente
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;
