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
    FaExternalLinkAlt
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
                setSales(salesData);
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

    // --- FILTERS ---
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

    if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold">Cargando historial...</div>;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaFileInvoiceDollar className="text-blue-500" /> Historial de Ventas
                    </h1>
                    <p className="text-gray-500 text-sm">Administra y revisa todas tus transacciones</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`flex-1 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilterType('this_week')}
                        className={`flex-1 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'this_week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Esta Semana
                    </button>
                    <button
                        onClick={() => setFilterType('today')}
                        className={`flex-1 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'today' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Hoy
                    </button>
                </div>
            </div>

            {/* Stats & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o folio..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex flex-col justify-center">
                    <p className="text-xs text-blue-100 font-medium">Total en vista</p>
                    <p className="text-xl font-bold">${stats.total.toFixed(2)}</p>
                    <p className="text-[10px] opacity-80">{stats.count} ventas encontradas</p>
                </div>
            </div>

            {/* Sales Content */}
            <div className="space-y-3">
                {filteredSales.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
                        <FaFilter className="mx-auto text-4xl text-gray-200 mb-3" />
                        <p className="text-gray-500 font-medium">No se encontraron ventas con los filtros actuales</p>
                    </div>
                ) : (
                    filteredSales.map(sale => (
                        <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 transition-colors">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpand(sale.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                        {sale.Client ? sale.Client.firstName.charAt(0) : 'C'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {sale.Client ? `${sale.Client.firstName} ${sale.Client.lastName}` : 'Cliente Casual'}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                            <span className="flex items-center gap-1 font-medium bg-gray-100 px-2 py-0.5 rounded">
                                                <FaClock className="text-[10px]" /> {new Date(sale.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                Folio: <span className="text-gray-900 font-semibold">#{sale.id}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-bold text-gray-900 text-lg">${parseFloat(sale.total).toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{sale.paymentMethod === 'cash' ? 'Efectivo' : sale.paymentMethod}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {sale.receiptTokenId && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewReceipt(sale); }}
                                                    className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Ver ticket digital"
                                                >
                                                    <FaReceipt className="text-lg" />
                                                </button>
                                                {sale.Client?.phone && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(sale); }}
                                                        className="p-2.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                        title="Compartir ticket por WhatsApp"
                                                    >
                                                        <FaWhatsapp className="text-lg" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <div className={`p-2 rounded-lg transition-colors ${expandedSale === sale.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
                                            {expandedSale === sale.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedSale === sale.id && (
                                <div className="px-4 pb-4 border-t border-gray-50 bg-gray-50/30 animate-fade-in">
                                    <div className="pt-4 space-y-3">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                            <FaBox className="text-blue-500" /> Detalle de Compra
                                        </p>
                                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">Producto</th>
                                                        <th className="px-4 py-2 text-center">Cant.</th>
                                                        <th className="px-4 py-2 text-right">Precio</th>
                                                        <th className="px-4 py-2 text-right">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {sale.SaleDetails?.map(detail => (
                                                        <tr key={detail.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-700">
                                                                {detail.Product?.name || 'Producto'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-gray-600">{detail.quantity}</td>
                                                            <td className="px-4 py-3 text-right text-gray-600">${parseFloat(detail.unitPrice).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">${parseFloat(detail.subtotal).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-blue-50/50">
                                                        <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-600">Total Pagado:</td>
                                                        <td className="px-4 py-3 text-right font-black text-blue-600 text-lg">${parseFloat(sale.total).toFixed(2)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* Notes or extra info if available */}
                                        {sale.notes && (
                                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic text-sm text-yellow-800">
                                                <span className="font-bold not-italic mr-1">Nota:</span> {sale.notes}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FaUser className="text-gray-300" />
                                                Vendedor: <span className="font-bold text-gray-700">{sale.Seller?.User?.firstName || 'Sistema'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FaTruckLoading className="text-gray-300" />
                                                Estado: <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">{sale.status}</span>
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
