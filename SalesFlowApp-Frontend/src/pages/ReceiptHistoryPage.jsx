import React, { useEffect, useState } from 'react';
import { FaSearch, FaWhatsapp, FaCopy, FaExternalLinkAlt, FaCheck, FaEye, FaReceipt, FaChartLine, FaFilter } from 'react-icons/fa';
import saleApi from '../services/saleApi';
import businessApi from '../services/businessApi';

const ReceiptHistoryPage = () => {
    const [receipts, setReceipts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [businessSlug, setBusinessSlug] = useState('');
    const [businessName, setBusinessName] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        clientName: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const businessData = await businessApi.getBusiness();
                setBusinessSlug(businessData.slug || '');
                setBusinessName(businessData.name || 'SalesFlow');
            } catch (error) {
                console.error('Error fetching business:', error);
            }
            fetchHistory();
        };
        fetchData();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const cleanFilters = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) cleanFilters[key] = filters[key];
            });

            const data = await saleApi.getReceiptHistory(cleanFilters);
            setReceipts(data.receipts || []);
            setStats(data.stats || {});
        } catch (error) {
            console.error('Error fetching receipt history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchHistory();
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({
            clientName: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: ''
        });
        setTimeout(() => fetchHistory(), 100);
    };

    const getReceiptUrl = (token) => {
        const baseUrl = window.location.origin;
        return businessSlug
            ? `${baseUrl}/${businessSlug}/r/${token}`
            : `${baseUrl}/r/${token}`;
    };

    const copyLink = (token) => {
        const url = getReceiptUrl(token);
        navigator.clipboard.writeText(url);
        setCopiedId(token);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const shareWhatsApp = (receipt) => {
        const clientName = receipt?.parameters?.clientName ?? 'Cliente';
        const url = getReceiptUrl(receipt?.id);
        const message = `*¡Hola ${clientName.split(' ')[0]}!* 👋\n\nGracias por tu compra en *${businessName}*\n\n📄 Ver ticket: ${url}\n\n¡Esperamos verte pronto! ✨`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const openReceipt = (token) => {
        const url = getReceiptUrl(token);
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Historial de Tickets</h1>
                    <p className="text-sm sm:text-base text-gray-600">Gestiona y comparte los tickets generados</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Total Tickets</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalReceipts}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaReceipt className="text-blue-600 text-lg sm:text-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Total Vistas</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalViews}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FaEye className="text-green-600 text-lg sm:text-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Promedio</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.averageViews}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FaChartLine className="text-purple-600 text-lg sm:text-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Más Visto</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.mostViewed}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FaEye className="text-orange-600 text-lg sm:text-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Toggle Button (Mobile) */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden w-full bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100 flex items-center justify-between font-bold text-gray-700"
                >
                    <span className="flex items-center gap-2">
                        <FaFilter />
                        Filtros
                    </span>
                    <span className="text-sm text-gray-500">{showFilters ? 'Ocultar' : 'Mostrar'}</span>
                </button>

                {/* Filters */}
                <div className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-100 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Filtros</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Cliente</label>
                            <input
                                type="text"
                                name="clientName"
                                value={filters.clientName}
                                onChange={handleFilterChange}
                                placeholder="Nombre del cliente"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Monto Mín.</label>
                            <input
                                type="number"
                                name="minAmount"
                                value={filters.minAmount}
                                onChange={handleFilterChange}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Monto Máx.</label>
                            <input
                                type="number"
                                name="maxAmount"
                                value={filters.maxAmount}
                                onChange={handleFilterChange}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            onClick={handleSearch}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <FaSearch />
                            <span>Buscar</span>
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg transition-all"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>

                {/* Receipts - Mobile Cards / Desktop Table */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
                        <p className="text-gray-500">Cargando...</p>
                    </div>
                ) : receipts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
                        <FaReceipt className="mx-auto text-4xl text-gray-200 mb-3" />
                        <p className="text-gray-500 font-medium">No se encontraron tickets</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile View - Cards */}
                        <div className="lg:hidden space-y-3">
                            {receipts.map((receipt) => (
                                <div key={receipt.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-sm mb-1">{receipt.parameters.clientName}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(receipt.createdAt).toLocaleDateString('es-MX', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">${receipt.parameters.total.toFixed(2)}</p>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                {receipt.viewCount} {receipt.viewCount === 1 ? 'vista' : 'vistas'}
                                            </span>
                                        </div>
                                    </div>

                                    {receipt.lastViewedAt && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            Última vista: {new Date(receipt.lastViewedAt).toLocaleDateString('es-MX', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => openReceipt(receipt.id)}
                                            className="bg-blue-50 text-blue-600 p-3 rounded-lg hover:bg-blue-100 transition-all flex flex-col items-center gap-1"
                                        >
                                            <FaExternalLinkAlt />
                                            <span className="text-xs font-medium">Ver</span>
                                        </button>
                                        <button
                                            onClick={() => shareWhatsApp(receipt)}
                                            className="bg-green-50 text-green-600 p-3 rounded-lg hover:bg-green-100 transition-all flex flex-col items-center gap-1"
                                        >
                                            <FaWhatsapp />
                                            <span className="text-xs font-medium">Enviar</span>
                                        </button>
                                        <button
                                            onClick={() => copyLink(receipt.id)}
                                            className="bg-gray-50 text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-all flex flex-col items-center gap-1"
                                        >
                                            {copiedId === receipt.id ? <FaCheck className="text-green-600" /> : <FaCopy />}
                                            <span className="text-xs font-medium">{copiedId === receipt.id ? '¡Listo!' : 'Copiar'}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Monto</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Vistas</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Última Vista</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {receipts.map((receipt) => (
                                            <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(receipt.createdAt).toLocaleDateString('es-MX', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">{receipt.parameters.clientName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">${receipt.parameters.total.toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                        {receipt.viewCount} {receipt.viewCount === 1 ? 'vista' : 'vistas'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                    {receipt.lastViewedAt
                                                        ? new Date(receipt.lastViewedAt).toLocaleDateString('es-MX', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'Nunca'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openReceipt(receipt.id)}
                                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Ver ticket"
                                                        >
                                                            <FaExternalLinkAlt />
                                                        </button>
                                                        <button
                                                            onClick={() => shareWhatsApp(receipt)}
                                                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all"
                                                            title="Compartir por WhatsApp"
                                                        >
                                                            <FaWhatsapp />
                                                        </button>
                                                        <button
                                                            onClick={() => copyLink(receipt.id)}
                                                            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-all"
                                                            title="Copiar link"
                                                        >
                                                            {copiedId === receipt.id ? <FaCheck className="text-green-600" /> : <FaCopy />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReceiptHistoryPage;
