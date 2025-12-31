import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import businessApi from '../../services/businessApi';
import {
    FaStore,
    FaSave,
    FaArrowLeft,
    FaGlobe,
    FaReceipt,
    FaMoneyBillWave,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaRegBuilding,
    FaCalendarCheck,
    FaChevronLeft
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

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
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const data = await businessApi.getBusiness();
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
                        ...data.settings
                    }
                });
            } catch (err) {
                toast.error('Error al cargar la información del negocio');
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusiness(prev => ({ ...prev, [name]: value }));
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
        if (!business.name.trim()) newErrors.name = 'El nombre del negocio es requerido.';
        if (business.settings.taxRate < 0 || business.settings.taxRate > 100) newErrors.taxRate = 'Rango inválido (0-100).';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        try {
            await businessApi.updateBusiness(business);
            toast.success('Perfil actualizado correctamente');
        } catch (err) {
            toast.error(err.message || 'Error al actualizar');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Configuración...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-up">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center gap-3 text-slate-400 hover:text-slate-800 transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
                >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
                        <FaChevronLeft className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    Volver al Panel
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Negocio Verificado</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Identity Card */}
                <div className="premium-card overflow-hidden border-0 shadow-soft">
                    <div className="bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-8 sm:p-12 border-b border-slate-100 relative">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-lg shadow-blue-500/5 flex items-center justify-center p-1 group border border-blue-50">
                                {business.logoURL ? (
                                    <img src={business.logoURL} alt="Logo" className="w-full h-full object-contain rounded-[1.8rem] group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <FaStore size={32} className="text-blue-400" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">Perfil del Negocio</h1>
                                <p className="text-slate-500 font-medium max-w-md">Identidad de marca y detalles operativos.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12 space-y-10">
                        <section>
                            <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Identidad Digital
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={business.name}
                                        onChange={handleChange}
                                        className="premium-input-style w-full"
                                        placeholder="Ej. Boutique Elegante"
                                    />
                                    {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-2">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">URL del Logo (Link)</label>
                                    <div className="relative group">
                                        <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="logoURL"
                                            value={business.logoURL}
                                            onChange={handleChange}
                                            className="premium-input-style w-full pl-12"
                                            placeholder="https://imgur.com/logo.png"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Identificador del Negocio (Slug)</label>
                                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-400 font-bold text-sm">
                                        <span className="opacity-50">salesflow.app/</span>
                                        <span className="text-slate-800 font-bold ml-1">{business.slug}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-300 italic ml-2">Este enlace es único y se genera automáticamente.</p>
                                </div>
                            </div>
                        </section>

                        <div className="w-full h-px bg-slate-50"></div>

                        <section>
                            <h3 className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div> Información de Contacto
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Número Telefónico</label>
                                    <div className="relative group">
                                        <FaPhone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={business.phone}
                                            onChange={handleChange}
                                            className="premium-input-style w-full pl-12"
                                            placeholder="+52 55 1234 5678"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Correo Corporativo</label>
                                    <div className="relative group">
                                        <FaEnvelope size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={business.email}
                                            onChange={handleChange}
                                            className="premium-input-style w-full pl-12"
                                            placeholder="contacto@empresa.com"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Dirección Física</label>
                                    <div className="relative group">
                                        <FaMapMarkerAlt size={14} className="absolute left-4 top-6 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                                        <textarea
                                            name="address"
                                            value={business.address}
                                            onChange={handleChange}
                                            rows="3"
                                            className="premium-input-style w-full pl-12 pt-5 resize-none"
                                            placeholder="Calle, Número, Colonia, Ciudad, CP"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* 2. Operations Card */}
                <div className="premium-card p-8 sm:p-12 space-y-10">
                    <section>
                        <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div> Configuración Operativa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Moneda del Sistema</label>
                                <div className="relative group">
                                    <FaMoneyBillWave size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <select
                                        name="currency"
                                        value={business.settings.currency}
                                        onChange={handleSettingChange}
                                        className="premium-input-style w-full pl-12 appearance-none cursor-pointer"
                                    >
                                        <option value="MXN">Pesos Mexicanos (MXN)</option>
                                        <option value="USD">Dólares Americanos (USD)</option>
                                        <option value="EUR">Euros (EUR)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Tasa de Impuestos (IVA/Tax %)</label>
                                <div className="relative group">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">%</div>
                                    <input
                                        type="number"
                                        name="taxRate"
                                        value={business.settings.taxRate}
                                        onChange={handleSettingChange}
                                        className="premium-input-style w-full"
                                        min="0" max="100" step="0.01"
                                    />
                                </div>
                                {errors.taxRate && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-2">{errors.taxRate}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Inicio de Semana Fiscal</label>
                                <select
                                    name="weekStartDay"
                                    value={business.weekStartDay}
                                    onChange={handleChange}
                                    className="premium-input-style w-full"
                                >
                                    <option value={0}>Domingo</option>
                                    <option value={1}>Lunes</option>
                                    <option value={2}>Martes</option>
                                    <option value={3}>Miércoles</option>
                                    <option value={4}>Jueves</option>
                                    <option value={5}>Viernes</option>
                                    <option value={6}>Sábado</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="w-full h-px bg-slate-50"></div>

                    <section>
                        <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div> Días de Operación Especial (Live)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                            {[
                                { val: 0, l: 'Dom' },
                                { val: 1, l: 'Lun' },
                                { val: 2, l: 'Mar' },
                                { val: 3, l: 'Mié' },
                                { val: 4, l: 'Jue' },
                                { val: 5, l: 'Vie' },
                                { val: 6, l: 'Sáb' }
                            ].map(day => (
                                <button
                                    key={day.val}
                                    type="button"
                                    onClick={() => handleLiveDayToggle(day.val)}
                                    className={`h-14 rounded-2xl flex flex-col items-center justify-center transition-all border ${(business.liveDays || []).includes(day.val)
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-500'
                                        }`}
                                >
                                    <FaCalendarCheck size={14} className="mb-1" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{day.l}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-4 italic">Selecciona los días en los que realizas dinámicas de venta en vivo para segmentar tus reportes.</p>
                    </section>

                    <div className="w-full h-px bg-slate-50"></div>

                    <section>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Textos Legales y de Ticket
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Pie de Página del Ticket</label>
                                <textarea
                                    name="ticketFooter"
                                    value={business.settings.ticketFooter}
                                    onChange={handleSettingChange}
                                    rows="2"
                                    className="premium-input-style w-full pt-5 resize-none"
                                    placeholder="Ej. ¡Gracias por apoyar el comercio local!"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Política de Privacidad y Devoluciones</label>
                                <textarea
                                    name="returnPolicy"
                                    value={business.returnPolicy}
                                    onChange={handleChange}
                                    rows="4"
                                    className="premium-input-style w-full pt-5 resize-none"
                                    placeholder="Describe los términos bajo los cuales aceptas cambios o devoluciones..."
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* 3. Floating Action Footer */}
                <div className="sticky bottom-8 left-0 right-0 z-40 px-4">
                    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
                        >
                            Ignorar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary min-w-[200px] flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaSave className="text-blue-200" />
                                    <span>Guardar Perfil</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BusinessProfilePage;
