import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import raffleApi from '../../services/raffleApi';
import { FaPlus, FaGift, FaTrophy, FaTicketAlt, FaCalendar, FaTrash, FaEye } from 'react-icons/fa';
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
            message: '¿Estás seguro de que deseas eliminar este sorteo?',
            isDatgerous: true,
            confirmText: 'Eliminar',
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <FaGift className="text-blue-600" />
                        Sorteos
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">Gestiona tus sorteos y rifas</p>
                </div>
                <button
                    onClick={() => navigate('/raffles/new')}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    <FaPlus /> Nuevo Sorteo
                </button>
            </div>

            {/* Raffles Grid */}
            {raffles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FaGift className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No hay sorteos</h3>
                    <p className="text-gray-500 mb-6">Crea tu primer sorteo para comenzar</p>
                    <button
                        onClick={() => navigate('/raffles/new')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Crear Sorteo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {raffles.map(raffle => (
                        <div
                            key={raffle.id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
                        >
                            {/* Status Badge */}
                            <div className={`px-4 py-3 ${raffle.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                                <div className="flex items-center justify-between text-white">
                                    <span className="font-bold text-sm uppercase tracking-wide">
                                        {raffle.status === 'active' ? '🎯 Activo' : '🏆 Finalizado'}
                                    </span>
                                    <FaTrophy className="text-white/80" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                    {raffle.motive}
                                </h3>

                                {raffle.prize && (
                                    <p className="text-gray-600 mb-4 flex items-center gap-2">
                                        <FaGift className="text-blue-500" />
                                        <span className="font-semibold">{raffle.prize}</span>
                                    </p>
                                )}

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FaTicketAlt className="text-blue-500" />
                                        <span><strong>{raffle.ticketCount || 0}</strong> boletos</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FaCalendar className="text-blue-500" />
                                        <span>
                                            {raffle.drawDate
                                                ? new Date(raffle.drawDate).toLocaleDateString('es-MX')
                                                : 'Sin fecha'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-blue-600">
                                            ${parseFloat(raffle.ticketPrice).toFixed(2)}
                                        </span> por boleto
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/raffles/${raffle.id}`)}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaEye /> Ver
                                    </button>
                                    <button
                                        onClick={() => handleDelete(raffle.id)}
                                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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

export default RaffleList;
