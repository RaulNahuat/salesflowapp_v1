import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import businessApi from '../../services/businessApi';
import { FaStore, FaSave, FaArrowLeft, FaGlobe, FaReceipt, FaMoneyBillWave, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const BusinessProfilePage = () => {
    const [business, setBusiness] = useState({
        name: '',
        slug: '',
        logoURL: '',
        phone: '',
        email: '',
        address: '',
        returnPolicy: '',
        weekStartDay: 1,
        liveDays: [],
        settings: {
            currency: 'MXN',
            taxRate: 0,
            ticketFooter: ''
        }
    });

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const data = await businessApi.getBusiness();
                // Ensure settings object exists
                setBusiness({
                    name: data.name || '',
                    slug: data.slug || '',
                    logoURL: data.logoURL || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || '',
                    returnPolicy: data.returnPolicy || '',
                    weekStartDay: data.weekStartDay !== undefined ? data.weekStartDay : 1,
                    liveDays: data.liveDays || [],
                    settings: {
                        currency: 'MXN',
                        taxRate: 0,
                        ticketFooter: '',
                        ...data.settings // Merges existing settings
                    }
                });
            } catch (err) {
                setStatus({ type: 'error', msg: err.message || 'Error al cargar información' });
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusiness(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSettingChange = (e) => {
        const { name, value } = e.target;
        setBusiness(prev => ({
            ...prev,
            settings: { ...prev.settings, [name]: value }
        }));
    };

    const handleLiveDayToggle = (day) => {
        setBusiness(prev => {
            const liveDays = prev.liveDays || [];
            if (liveDays.includes(day)) {
                return { ...prev, liveDays: liveDays.filter(d => d !== day) };
            } else {
                return { ...prev, liveDays: [...liveDays, day].sort() };
            }
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!business.name.trim()) newErrors.name = 'El nombre del negocio es obligatorio.';
        if (business.settings.taxRate < 0 || business.settings.taxRate > 100) newErrors.taxRate = 'El impuesto debe estar entre 0 y 100.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        if (!validate()) return;

        try {
            await businessApi.updateBusiness(business);
            setStatus({ type: 'success', msg: 'Información guardada correctamente.' });
            setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
        } catch (err) {
            setStatus({ type: 'error', msg: err.message || 'Error al actualizar.' });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Navbar area could go here */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                {/* Navigation Back */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium"
                >
                    <FaArrowLeft className="mr-2" /> Volver al Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm mr-4">
                                <FaStore className="text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Perfil del Negocio</h1>
                                <p className="text-blue-100 text-sm opacity-90">Personaliza la identidad y configuración de tu empresa</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {status.msg && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                                }`}>
                                {status.msg}
                            </div>
                        )}

                        {/* Identidad Section */}
                        <div className="mb-10">
                            <h2 className="text-lg font-bold text-gray-800 mb-1 border-b pb-2 border-gray-100">Identidad Digital</h2>
                            <p className="text-sm text-gray-400 mb-6">Información visible para tus clientes y en el sistema.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nombre del Negocio</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={business.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                                        placeholder="Ej. Abarrotes La Familia"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                                        URL del Logo <FaGlobe className="ml-1 text-gray-300" />
                                    </label>
                                    <input
                                        type="text"
                                        name="logoURL"
                                        value={business.logoURL || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Slug (Identificador)</label>
                                    <div className="flex items-center w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 select-none">
                                        <span className="text-gray-400 mr-2">salesflow.app/</span>
                                        <span className="font-mono font-medium text-gray-700">{business.slug}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Este enlace es único y automático.</p>
                                </div>
                            </div>
                        </div>

                        {/* Configuración Operativa Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-1 border-b pb-2 border-gray-100 flex items-center">
                                <FaReceipt className="mr-2 text-indigo-500 opacity-75" /> Configuración de Ventas & Tickets
                            </h2>
                            <p className="text-sm text-gray-400 mb-6">Estos datos aparecerán impresos en tus recibos.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                                        <FaPhone className="mr-1" /> Teléfono de Contacto
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={business.phone || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                                        placeholder="(55) 1234-5678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email de Contacto</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={business.email || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                                        placeholder="contacto@negocio.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                                        <FaMapMarkerAlt className="mr-1" /> Dirección Física
                                    </label>
                                    <textarea
                                        name="address"
                                        value={business.address || ''}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 resize-none"
                                        placeholder="Calle 123, Colonia Centro, Ciudad, CP 12345"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                                        <FaMoneyBillWave className="mr-1" /> Moneda
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="currency"
                                            value={business.settings?.currency || 'MXN'}
                                            onChange={handleSettingChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 appearance-none"
                                        >
                                            <option value="MXN">Peso Mexicano (MXN)</option>
                                            <option value="USD">Dólar Americano (USD)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Impuesto / IVA (%)</label>
                                    <input
                                        type="number"
                                        name="taxRate"
                                        value={business.settings?.taxRate || 0}
                                        onChange={handleSettingChange}
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 ${errors.taxRate ? 'border-red-300' : ''}`}
                                        min="0" max="100" step="0.01"
                                    />
                                    {errors.taxRate && <p className="text-red-500 text-xs mt-1">{errors.taxRate}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pie de Página del Ticket</label>
                                    <textarea
                                        name="ticketFooter"
                                        value={business.settings?.ticketFooter || ''}
                                        onChange={handleSettingChange}
                                        rows="2"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 resize-none"
                                        placeholder="Ej. ¡Gracias por su compra! Síganos en redes sociales."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Política de Devolución</label>
                                    <textarea
                                        name="returnPolicy"
                                        value={business.returnPolicy || ''}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 resize-none"
                                        placeholder="Ej. Aceptamos devoluciones dentro de los 7 días con ticket de compra."
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Esta política aparecerá en los tickets digitales.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Inicio de Semana (Reportes)</label>
                                    <select
                                        name="weekStartDay"
                                        value={business.weekStartDay}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                                    >
                                        <option value={0}>Domingo</option>
                                        <option value={1}>Lunes</option>
                                        <option value={2}>Martes</option>
                                        <option value={3}>Miércoles</option>
                                        <option value={4}>Jueves</option>
                                        <option value={5}>Viernes</option>
                                        <option value={6}>Sábado</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Define cuándo inicia tu semana laboral para los reportes.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Días de Live de Ventas</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                        {[
                                            { value: 0, label: 'Dom' },
                                            { value: 1, label: 'Lun' },
                                            { value: 2, label: 'Mar' },
                                            { value: 3, label: 'Mié' },
                                            { value: 4, label: 'Jue' },
                                            { value: 5, label: 'Vie' },
                                            { value: 6, label: 'Sáb' }
                                        ].map(day => (
                                            <button
                                                key={day.value}
                                                type="button"
                                                onClick={() => handleLiveDayToggle(day.value)}
                                                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${(business.liveDays || []).includes(day.value)
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Selecciona los días que haces transmisiones en vivo para vender.</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="mr-4 px-6 py-2.5 rounded-lg text-gray-500 font-medium hover:bg-gray-100 transition-all duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center"
                            >
                                <FaSave className="mr-2" /> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessProfilePage;
