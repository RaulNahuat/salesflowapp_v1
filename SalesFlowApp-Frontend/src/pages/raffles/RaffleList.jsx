import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import raffleApi from '../../services/raffleApi';
import {
    FaPlus,
    FaGift,
    FaTrophy,
    FaTicketAlt,
    FaCalendar,
    FaTrash,
    FaEye,
    FaArrowRight,
    FaRegStar,
    FaClock
} from 'react-icons/fa';
import ConfirmationModal from '../../componentes/ui/ConfirmationModal';

const RaffleList = () => {
    const [raffles, setRaffles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });
    const navigate = useNavigate();

    useEffect(() => {
        fetchRaffles();
    }, []);

    const fetchRaffles = async () => {
        try {
            const data = await raffleApi.getRaffles();
            setRaffles(data);
        } catch (error) {
            toast.error('Error al cargar sorteos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Sorteo',
            message: '¿Estás seguro de que deseas eliminar este sorteo permanentemente?',
            isDatgerous: true,
            confirmText: 'Eliminar Sorteo',
            action: async () => {
                try {
                    await raffleApi.deleteRaffle(id);
                    toast.success('Sorteo eliminado');
                    fetchRaffles();
                } catch (error) {
                    toast.error('Error al eliminar sorteo');
                }
            }
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Eventos...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-20 animate-fade-up">
            {/* 1. Global Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                            <FaGift size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em]">Fidelización & Dinámicas</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Sorteos y Rifas</h1>
                    <p className="text-slate-500 font-medium max-w-lg">
                        Crea experiencias inolvidables para tus clientes y aumenta el engagement de tu comunidad.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/raffles/new')}
                    className="btn-primary flex items-center justify-center gap-2 group sm:min-w-[220px]"
                >
                    <FaPlus className="text-blue-200 group-hover:rotate-90 transition-transform" />
                    <span>Nuevo Sorteo</span>
                </button>
            </div>

            {/* Empty State */}
            {raffles.length === 0 ? (
                <div className="premium-card py-24 flex flex-col items-center text-center px-10">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-dashed border-slate-200">
                        <FaRegStar className="text-slate-300 text-4xl" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Aún no hay dinámicas activas</h3>
                    <p className="text-slate-500 text-sm max-w-sm mb-8 font-medium italic">Los sorteos son una excelente manera de premiar a tus clientes frecuentes.</p>
                    <button onClick={() => navigate('/raffles/new')} className="btn-primary">Lanzar Primer Sorteo</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {raffles.map((raffle, index) => (
                        <div
                            key={raffle.id}
                            className="premium-card group hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 transition-all flex flex-col overflow-hidden animate-fade-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Status Header */}
                            <div className={`p-5 flex items-center justify-between ${raffle.status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-slate-900'}`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                        {raffle.status === 'active' ? 'Sorteo Activo' : 'Evento Finalizado'}
                                    </span>
                                </div>
                                <FaTrophy className="text-white/30" size={14} />
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                    {raffle.motive}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <FaGift size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Premio Mayor</p>
                                            <p className="text-sm font-bold text-slate-700">{raffle.prize || 'Misterio'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FaTicketAlt className="text-blue-500" size={12} />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">Boletos</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-800 leading-none">{raffle.ticketCount || 0}</p>
                                        </div>
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FaClock className="text-blue-500" size={12} />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">Costo</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-800 leading-none">${parseFloat(raffle.ticketPrice).toFixed(0)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <FaCalendar className="text-slate-300" />
                                        <span>Fecha del sorteo: <span className="text-slate-800">{raffle.drawDate ? new Date(raffle.drawDate).toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Por definir'}</span></span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex gap-3">
                                    <button
                                        onClick={() => navigate(`/raffles/${raffle.id}`)}
                                        className="flex-1 btn-primary h-12 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <FaEye size={12} className="text-blue-200" />
                                        <span>Gestionar</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(raffle.id)}
                                        className="w-12 h-12 bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-all active:scale-95 border border-transparent hover:border-rose-100"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
                cancelText="Mantener Sorteo"
            />
        </div>
    );
};

export default RaffleList;
