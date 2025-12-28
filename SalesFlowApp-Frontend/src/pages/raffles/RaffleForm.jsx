import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import raffleApi from '../../services/raffleApi';
import { FaArrowLeft, FaSave, FaGift } from 'react-icons/fa';

const RaffleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [raffle, setRaffle] = useState({
        motive: '',
        prize: '',
        ticketPrice: '',
        drawDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode) {
            fetchRaffle();
        }
    }, [id]);

    const fetchRaffle = async () => {
        try {
            const data = await raffleApi.getRaffle(id);
            setRaffle({
                motive: data.motive,
                prize: data.prize || '',
                ticketPrice: data.ticketPrice,
                drawDate: data.drawDate ? new Date(data.drawDate).toISOString().split('T')[0] : ''
            });
        } catch (error) {
            toast.error('Error al cargar sorteo');
            navigate('/raffles');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRaffle(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                await raffleApi.updateRaffle(id, raffle);
                toast.success('Sorteo actualizado');
            } else {
                await raffleApi.createRaffle(raffle);
                toast.success('Sorteo creado');
            }
            navigate('/raffles');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar sorteo');
        } finally {
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
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/raffles')}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4 font-semibold"
                >
                    <FaArrowLeft /> Volver
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <FaGift className="text-blue-600" />
                    {isEditMode ? 'Editar Sorteo' : 'Nuevo Sorteo'}
                </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                <div className="space-y-6">
                    {/* Motive */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Motivo del Sorteo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="motive"
                            value={raffle.motive}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Ej: Sorteo de Navidad 2024"
                            required
                        />
                    </div>

                    {/* Prize */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Premio
                        </label>
                        <input
                            type="text"
                            name="prize"
                            value={raffle.prize}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Ej: iPhone 15 Pro"
                        />
                    </div>

                    {/* Ticket Price */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Monto por Boleto <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input
                                type="number"
                                name="ticketPrice"
                                value={raffle.ticketPrice}
                                onChange={handleChange}
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="100.00"
                                step="0.01"
                                min="0.01"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Por cada ${raffle.ticketPrice || '___'} de compra, el cliente recibe 1 boleto
                        </p>
                    </div>

                    {/* Draw Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fecha del Sorteo
                        </label>
                        <input
                            type="date"
                            name="drawDate"
                            value={raffle.drawDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/raffles')}
                        className="w-full sm:w-auto px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors order-2 sm:order-1"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                        <FaSave /> {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Sorteo')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RaffleForm;
