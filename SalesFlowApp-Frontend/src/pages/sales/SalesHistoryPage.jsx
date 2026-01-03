import React, { useState, useEffect, useMemo } from 'react';
import {
    FaSearch,
    FaWhatsapp,
    FaCalendarAlt,
    FaFilter,
    FaFileInvoiceDollar,
    FaChevronDown,
    FaChevronUp,
    FaBox,
    FaUser,
    FaClock,
    FaTruckLoading,
    FaReceipt,
    FaExternalLinkAlt,
    FaHistory
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import saleApi from '../../services/saleApi';
import businessApi from '../../services/businessApi';

const SalesHistoryPage = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, today, this_week
    const [expandedSale, setExpandedSale] = useState(null);
    const [businessSlug, setBusinessSlug] = useState('');
    const [businessName, setBusinessName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [salesData, businessData] = await Promise.all([
                    saleApi.getSales({ limit: 100 }),
                    businessApi.getBusiness()
                ]);
                setSales(salesData.sales || []);
                setBusinessSlug(businessData.slug || '');
                setBusinessName(businessData.name || 'SalesFlow');
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const dateFilteredSales = useMemo(() => {
        let result = [...sales];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filterType === 'today') {
            result = result.filter(s => new Date(s.createdAt) >= today);
        } else if (filterType === 'this_week') {
            const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            firstDayOfWeek.setHours(0, 0, 0, 0);
            result = result.filter(s => new Date(s.createdAt) >= firstDayOfWeek);
        }
        return result;
    }, [sales, filterType]);

    const filteredSales = useMemo(() => {
        let result = [...dateFilteredSales];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s => {
                const clientName = s.Client ? `${s.Client.firstName} ${s.Client.lastName}`.toLowerCase() : 'cliente casual';
                return clientName.includes(term) || s.id.toString().includes(term);
            });
        }
        return result;
    }, [dateFilteredSales, searchTerm]);

    const stats = useMemo(() => {
        const totalAmount = filteredSales.reduce((acc, s) => acc + parseFloat(s.total), 0);
        return {
            count: filteredSales.length,
            total: totalAmount
        };
    }, [filteredSales]);

    const handleViewReceipt = (sale) => {
        if (!sale.receiptTokenId) {
            toast.error('Esta venta no tiene un ticket generado');
            return;
        }
        const url = businessSlug
            ? `${window.location.origin}/${businessSlug}/r/${sale.receiptTokenId}`
            : `${window.location.origin}/r/${sale.receiptTokenId}`;
        window.open(url, '_blank');
    };

    const handleShareWhatsApp = (sale) => {
        if (!sale.Client || !sale.Client.phone) {
            toast.error('Este cliente no tiene un teléfono registrado');
            return;
        }

        if (!sale.receiptTokenId) {
            toast.error('Esta venta no tiene un ticket generado');
            return;
        }

        const receiptUrl = businessSlug
            ? `${window.location.origin}/${businessSlug}/r/${sale.receiptTokenId}`
            : `${window.location.origin}/r/${sale.receiptTokenId}`;
        const clientName = `${sale.Client.firstName} ${sale.Client.lastName}`;
        const totalFormatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(sale.total);

        const msg = `*¡Hola ${sale.Client.firstName}!* 👋\n\nGracias por tu compra en *${businessName}*\n\n💰 Total: ${totalFormatted}\n📄 Ver ticket: ${receiptUrl}\n\n¡Esperamos verte pronto! ✨`;

        const url = `https://wa.me/${sale.Client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const toggleExpand = (id) => {
        setExpandedSale(expandedSale === id ? null : id);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Historial...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-up">
            {/* 1. Header Section - Vibrant Style */}
            <div className="relative overflow-hidden bg-vibrant rounded-3xl p-6 sm:p-8 shadow-vibrant">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                <FaHistory size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">Trazabilidad de Ventas</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Historial de Ventas</h1>
                        <p className="text-blue-50/70 text-xs font-medium max-w-lg leading-relaxed">
                            Consulta transacciones y gestiona comprobantes digitales.
                        </p>
                    </div>

                    <div className="flex bg-black/10 backdrop-blur-md p-1 rounded-2xl w-full md:w-auto border border-white/10">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`flex-1 px-5 py-2 rounded-[1rem] text-[9px] font-bold uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilterType('this_week')}
                            className={`flex-1 px-5 py-2 rounded-[1rem] text-[9px] font-bold uppercase tracking-widest transition-all ${filterType === 'this_week' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setFilterType('today')}
                            className={`flex-1 px-5 py-2 rounded-[1rem] text-[9px] font-bold uppercase tracking-widest transition-all ${filterType === 'today' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Hoy
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Search & Stats - Ultra Compact */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                    <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, folio o fecha..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-6 self-start">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">En Vista</span>
                        <span className="text-xl font-bold tracking-tighter text-blue-600 leading-none mt-1">${stats.total.toLocaleString('es-MX', { minimumFractionDigits: 1 })}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Transacciones</span>
                        <span className="text-xl font-bold tracking-tighter leading-none mt-1">{stats.count}</span>
                    </div>
                </div>
            </div>

            {/* 3. Infinite List / History Feed */}
            <div className="space-y-4">
                {filteredSales.length === 0 ? (
                    <div className="premium-card py-24 text-center">
                        <FaFilter className="mx-auto text-4xl text-slate-100 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No hay transacciones registradas con estos filtros</p>
                    </div>
                ) : (
                    filteredSales.map((sale, index) => (
                        <div
                            key={sale.id}
                            className={`premium-card group border-l-4 transition-all duration-300 ${expandedSale === sale.id ? 'border-l-blue-600 bg-blue-50/10' : 'border-l-transparent hover:border-l-slate-200'}`}
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            <div
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-6"
                                onClick={() => toggleExpand(sale.id)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400 text-lg shadow-sm group-hover:border-blue-400 group-hover:text-blue-600 transition-all">
                                        {sale.Client ? sale.Client.firstName.charAt(0) : 'C'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                            {sale.Client ? `${sale.Client.firstName} ${sale.Client.lastName}` : 'Cliente Casual'}
                                            <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">#{sale.id}</span>
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase mt-1">
                                            <span className="flex items-center gap-1.5"><FaCalendarAlt size={10} className="text-blue-500" /> {new Date(sale.createdAt).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                            <span className="flex items-center gap-1.5"><FaClock size={10} /> {new Date(sale.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-10">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-slate-800 tracking-tighter">${parseFloat(sale.total).toLocaleString('es-MX', { minimumFractionDigits: 1 })}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{sale.paymentMethod || 'Contado'}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {sale.receiptTokenId && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewReceipt(sale); }}
                                                    className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center p-0"
                                                    title="Ver ticket digital"
                                                >
                                                    <FaReceipt size={16} />
                                                </button>
                                                {sale.Client?.phone && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(sale); }}
                                                        className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center p-0"
                                                        title="Compartir ticket por WhatsApp"
                                                    >
                                                        <FaWhatsapp size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedSale === sale.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                            {expandedSale === sale.id ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Streamlined Expanded Details */}
                            {expandedSale === sale.id && (
                                <div className="px-5 pb-5 animate-fade-up">
                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                            {/* Articles Column */}
                                            <div className="lg:col-span-8">
                                                <div className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100/50">
                                                    <div className="px-4 py-2 bg-white/50 border-b border-slate-100 flex justify-between items-center">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Resumen de Artículos</span>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{sale.SaleDetails?.length || 0} items</span>
                                                    </div>
                                                    <div className="divide-y divide-slate-100/30">
                                                        {sale.SaleDetails?.map((detail, dIdx) => (
                                                            <div key={detail.id || dIdx} className="flex items-center justify-between p-2.5 px-4 hover:bg-white transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-100 w-6 h-6 flex items-center justify-center rounded-md">{detail.quantity}</span>
                                                                    <span className="font-bold text-slate-700 text-xs">{detail.Product?.name || 'Producto'}</span>
                                                                </div>
                                                                <p className="font-bold text-slate-800 text-xs">${parseFloat(detail.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 1 })}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Column - Ultra Compact */}
                                            <div className="lg:col-span-4 space-y-3">
                                                <div className="bg-white border border-slate-100/80 rounded-xl p-4 shadow-sm/30">
                                                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Vendedor</span>
                                                            <span className="text-[11px] text-slate-700 font-bold truncate">{sale.Seller?.User?.firstName || 'Admin'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Método</span>
                                                            <span className="text-[11px] text-slate-700 font-bold uppercase tracking-widest">{sale.paymentMethod}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Estado</span>
                                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">OPERACIÓN OK</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Final</span>
                                                            <span className="text-[13px] font-black text-blue-600 tracking-tighter leading-none mt-0.5">${parseFloat(sale.total).toLocaleString('es-MX', { minimumFractionDigits: 1 })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {sale.notes && (
                                                    <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-100/30">
                                                        <p className="text-[10px] font-medium text-slate-500 italic leading-snug">"{sale.notes}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SalesHistoryPage;
