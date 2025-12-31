import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clientApi from '../../services/clientApi';
import {
    FaUser,
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaExclamationTriangle,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaArrowRight,
    FaUserFriends,
    FaChevronRight,
    FaStar
} from 'react-icons/fa';
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
            message: '¿Estás seguro de que deseas eliminar este cliente? Se borrará de tu base de datos permanentemente.',
            isDatgerous: true,
            confirmText: 'Eliminar Cliente',
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
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Directorio...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-up">
            {/* 1. Global Header */}
            {/* 1. Slim Header - Vibrant Style */}
            <div className="relative overflow-hidden bg-vibrant rounded-3xl p-6 mb-6 shadow-vibrant">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Directorio de Clientes</h1>
                        <p className="text-[10px] font-medium text-blue-100/80 uppercase tracking-widest mt-0.5">Gestión de contactos y clientes frecuentas</p>
                    </div>
                    <Link
                        to="/clients/new"
                        className="bg-white text-blue-600 flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-lg shadow-black/5"
                    >
                        <FaPlus size={10} />
                        <span>Nuevo Cliente</span>
                    </Link>
                </div>
            </div>

            {/* 2. Compact Search */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                        <FaSearch size={14} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o contacto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm text-sm"
                    />
                </div>
                <button className="h-12 px-5 bg-white border border-slate-100 rounded-2xl text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
                    <FaStar size={12} className="text-amber-400" /> Frecuentes
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center mb-6 animate-fade-up">
                    <FaExclamationTriangle className="mr-3 text-rose-500" size={18} />
                    <div>
                        <p className="font-bold text-sm">Error de Conectividad</p>
                        <p className="text-[10px] opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && clients.length === 0 && !error && (
                <div className="bg-white rounded-3xl border border-slate-100 py-20 flex flex-col items-center text-center px-10 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                        <FaUser className="text-slate-300 text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1">Tu agenda está vacía</h3>
                    <p className="text-slate-400 text-xs max-w-sm mb-6 font-medium">Registra clientes para agilizar tus ventas.</p>
                    <Link to="/clients/new" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Registrar Primero</Link>
                </div>
            )}

            {/* 3. List Content (Ultra-Compact) */}
            <div className="space-y-2">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-1 opacity-40">
                    <div className="col-span-5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Resumen Cliente</div>
                    <div className="col-span-4 text-[8px] font-bold text-slate-500 uppercase tracking-widest px-2">Contacto Directo</div>
                    <div className="col-span-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</div>
                </div>
                <div className="space-y-2">
                    {filteredClients.map((client, index) => (
                        <div
                            key={client.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-3 bg-white border border-slate-100/60 rounded-xl hover:border-blue-200 hover:shadow-soft transition-all items-center group animate-fade-up shadow-sm/30"
                        >
                            <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[11px] bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-bold text-[11px] flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    {client.firstName.charAt(0)}{client.lastName?.charAt(0) || ''}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-tight truncate">
                                        {client.firstName} {client.lastName}
                                        {client.esFrecuente && (
                                            <FaStar size={8} className="text-amber-400 inline ml-1.5" />
                                        )}
                                    </h3>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">ID: {client.id.slice(0, 8)}</p>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-4 px-0 md:px-2 flex items-center gap-4">
                                <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                    <FaPhone className="text-blue-400" size={9} /> {client.phone || '---'}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 truncate hidden lg:block">{client.email || ''}</p>
                            </div>

                            <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-1.5">
                                <Link
                                    to={`/clients/edit/${client.id}`}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-blue-100"
                                    title="Editar"
                                >
                                    <FaEdit size={12} />
                                </Link>
                                <button
                                    onClick={() => confirmDelete(client.id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-rose-100"
                                    title="Eliminar"
                                >
                                    <FaTrash size={12} />
                                </button>
                                <button
                                    className="p-2 bg-slate-900 text-white hover:bg-blue-600 rounded-lg transition-all active:scale-90 shadow-sm"
                                    title="Ver Detalles"
                                >
                                    <FaChevronRight size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {filteredClients.length === 0 && searchTerm && (
                <div className="py-20 text-center animate-fade-up">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                        <FaSearch size={20} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold">No se encontró a "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm('')} className="mt-4 text-sm font-bold text-blue-600 uppercase tracking-widest hover:underline decoration-blue-200 underline-offset-4">Ver todos</button>
                </div>
            )}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDatgerous={modalConfig.isDatgerous}
                confirmText={modalConfig.confirmText}
                cancelText="Mantener Cliente"
            />
        </div>
    );
};

export default ClientList;
