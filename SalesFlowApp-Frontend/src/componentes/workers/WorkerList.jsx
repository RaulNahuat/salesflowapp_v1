import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import workerApi from '../../services/workerApi';
import {
    FaUserPlus,
    FaEdit,
    FaTrash,
    FaUserTie,
    FaArrowRight,
    FaShieldAlt,
    FaCheckCircle,
    FaEnvelope,
    FaLock,
    FaUsersCog
} from 'react-icons/fa';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const WorkerList = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const data = await workerApi.getWorkers();
            setWorkers(data);
        } catch (err) {
            setError('Error al cargar trabajadores');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Colaborador',
            message: '¿Estás seguro de que deseas eliminar este colaborador? Perderá el acceso al sistema de forma inmediata.',
            isDatgerous: true,
            confirmText: 'Remover del Equipo',
            action: async () => {
                try {
                    await workerApi.deleteWorker(id);
                    setWorkers(prev => prev.filter(w => w.id !== id));
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    toast.success('Colaborador eliminado correctamente');
                } catch (err) {
                    toast.error(err.message || 'Error al eliminar trabajador');
                }
            }
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Plantilla...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-up">
            {/* 1. Slim Header - Vibrant Style */}
            <div className="relative overflow-hidden bg-vibrant rounded-3xl p-6 mb-6 shadow-vibrant">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Equipo de Trabajo</h1>
                        <p className="text-[10px] font-medium text-blue-100/80 uppercase tracking-widest mt-0.5">Gestión de accesos y permisos del personal</p>
                    </div>
                    <Link
                        to="/workers/new"
                        className="bg-white text-blue-600 flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-lg shadow-black/5"
                    >
                        <FaUserPlus size={10} />
                        <span>Agregar Miembro</span>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center mb-6 animate-fade-up">
                    <FaShieldAlt className="mr-3 text-rose-500" size={18} />
                    <p className="font-bold text-sm">{error}</p>
                </div>
            )}

            {/* 2. Worker List Content (Ultra-Compact) */}
            <div className="space-y-2">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-1 opacity-40">
                    <div className="col-span-4 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Colaborador</div>
                    <div className="col-span-5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Permisos / Seguridad</div>
                    <div className="col-span-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</div>
                </div>
                <div className="space-y-2">
                    {workers.map((worker, index) => (
                        <div
                            key={worker.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-3 bg-white border border-slate-100/60 rounded-xl hover:border-blue-200 hover:shadow-soft transition-all items-center group animate-fade-up shadow-sm/30"
                        >
                            <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[11px] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] flex-shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-all shadow-sm">
                                    {worker.User.firstName[0]}{worker.User.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-tight truncate">
                                        {worker.User.firstName} {worker.User.lastName}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <div className={`w-1 h-1 rounded-full ${worker.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                            {worker.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-5 flex flex-wrap gap-1">
                                {Object.entries(worker.permissions).map(([key, val]) => (
                                    val && (
                                        <span key={key} className="bg-slate-50 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-slate-100/50">
                                            {key}
                                        </span>
                                    )
                                ))}
                            </div>

                            <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-1.5">
                                <Link
                                    to={`/workers/edit/${worker.id}`}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-blue-100"
                                    title="Configurar"
                                >
                                    <FaEdit size={12} />
                                </Link>
                                <button
                                    onClick={() => confirmDelete(worker.id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-rose-100"
                                    title="Remover"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!loading && workers.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 py-20 flex flex-col items-center text-center px-10 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                        <FaUserTie className="text-slate-300 text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1">Aún no tienes equipo</h3>
                    <p className="text-slate-400 text-xs max-w-sm mb-6 font-medium">Delega tareas agregando trabajadores.</p>
                    <Link to="/workers/new" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Agregar Miembro</Link>
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
                cancelText="Mantener Acceso"
            />
        </div>
    );
};

export default WorkerList;
