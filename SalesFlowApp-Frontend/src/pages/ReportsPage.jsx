import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCalendar, FaDollarSign, FaShoppingCart, FaBoxOpen, FaUsers, FaTrophy, FaFilter, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import saleApi from '../services/saleApi';
import jsPDF from 'jspdf';

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        liveDaysOnly: false
    });
    const [showAllProducts, setShowAllProducts] = useState(false);
    const [showAllClients, setShowAllClients] = useState(false);
    const [sortProducts, setSortProducts] = useState('desc'); // 'desc' o 'asc'
    const [sortClients, setSortClients] = useState('desc'); // 'desc' o 'asc'
    const [pdfPreview, setPdfPreview] = useState(null);

    useEffect(() => {
        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        setFilters({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            liveDaysOnly: false
        });
    }, []);

    useEffect(() => {
        if (filters.startDate && filters.endDate) {
            fetchReports();
        }
    }, [filters]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await saleApi.getReports(filters);
            setReports(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    const setQuickFilter = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setFilters(prev => ({
            ...prev,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        }));
    };

    const setYearFilter = (year) => {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        setFilters(prev => ({
            ...prev,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        }));
    };

    const generatePDF = () => {
        if (!reports) {
            toast.error('No hay datos para exportar');
            return;
        }

        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('REPORTE DE VENTAS', 105, yPos, { align: 'center' });
        yPos += 8;

        // Period
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Período: ${filters.startDate} al ${filters.endDate}`, 105, yPos, { align: 'center' });
        yPos += 3;
        doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 105, yPos, { align: 'center' });
        yPos += 12;

        // Summary Section
        doc.setFillColor(59, 130, 246); // Blue
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RESUMEN EJECUTIVO', 20, yPos + 5.5);
        yPos += 12;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        // Summary in 2 columns
        const col1X = 20;
        const col2X = 110;

        doc.setFont(undefined, 'bold');
        doc.text('Ventas Totales:', col1X, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`$${reports.summary.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, col1X + 35, yPos);

        doc.setFont(undefined, 'bold');
        doc.text('Venta Promedio:', col2X, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`$${reports.summary.averageSale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, col2X + 35, yPos);
        yPos += 6;

        doc.setFont(undefined, 'bold');
        doc.text('Total Transacciones:', col1X, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`${reports.summary.totalTransactions}`, col1X + 35, yPos);

        doc.setFont(undefined, 'bold');
        doc.text('Productos Vendidos:', col2X, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`${reports.summary.totalItemsSold}`, col2X + 35, yPos);
        yPos += 15;

        // Top Products Section
        doc.setFillColor(16, 185, 129); // Green
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(sortProducts === 'desc' ? 'TOP 20 PRODUCTOS MÁS VENDIDOS' : '20 PRODUCTOS CON MENOS VENTAS', 20, yPos + 5.5);
        yPos += 12;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);

        // Table header
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 2, 180, 6, 'F');
        doc.setFont(undefined, 'bold');
        doc.text('#', 20, yPos + 2);
        doc.text('Producto', 30, yPos + 2);
        doc.text('Unidades', 130, yPos + 2);
        doc.text('Ingresos', 165, yPos + 2);
        yPos += 8;

        doc.setFont(undefined, 'normal');
        const productsToPrint = [...reports.products]
            .sort((a, b) => sortProducts === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue)
            .slice(0, 20);

        productsToPrint.forEach((product, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(15, yPos - 3, 180, 6, 'F');
            }

            doc.text(`${index + 1}`, 20, yPos);
            doc.text(product.name.substring(0, 50), 30, yPos);
            doc.text(`${product.quantity}`, 130, yPos);
            doc.text(`$${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 165, yPos);
            yPos += 6;
        });

        yPos += 10;

        // Top Clients Section
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFillColor(139, 92, 246); // Purple
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(sortClients === 'desc' ? 'TOP 20 CLIENTES' : '20 CLIENTES CON MENOS COMPRAS', 20, yPos + 5.5);
        yPos += 12;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);

        // Table header
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 2, 180, 6, 'F');
        doc.setFont(undefined, 'bold');
        doc.text('#', 20, yPos + 2);
        doc.text('Cliente', 30, yPos + 2);
        doc.text('Compras', 130, yPos + 2);
        doc.text('Total Gastado', 165, yPos + 2);
        yPos += 8;

        doc.setFont(undefined, 'normal');
        const clientsToPrint = [...reports.clients]
            .sort((a, b) => sortClients === 'desc' ? b.total - a.total : a.total - b.total)
            .slice(0, 20);

        clientsToPrint.forEach((client, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(15, yPos - 3, 180, 6, 'F');
            }

            doc.text(`${index + 1}`, 20, yPos);
            doc.text(client.name.substring(0, 50), 30, yPos);
            doc.text(`${client.purchases}`, 130, yPos);
            doc.text(`$${client.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 165, yPos);
            yPos += 6;
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        }

        return doc;
    };

    const downloadPDF = () => {
        const doc = generatePDF();
        if (doc) {
            const fileName = `Reporte_${filters.startDate}_${filters.endDate}.pdf`;
            doc.save(fileName);
            toast.success('Reporte descargado exitosamente');
        }
    };

    const previewPDF = () => {
        const doc = generatePDF();
        if (doc) {
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfPreview(pdfUrl);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando reportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaChartLine className="text-blue-600" />
                        Reportes de Ventas
                    </h1>
                    <p className="text-gray-500 mt-1">Análisis y estadísticas de tu negocio</p>
                </div>
                {reports && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={previewPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FaFilter />
                            Visualizar
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                        >
                            <FaDownload />
                            Descargar PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FaFilter className="text-gray-400" />
                    <h2 className="font-semibold text-gray-700">Filtros</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.liveDaysOnly}
                                onChange={(e) => setFilters(prev => ({ ...prev, liveDaysOnly: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Solo días de live</span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={() => setQuickFilter(7)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Últimos 7 días</button>
                    <button onClick={() => setQuickFilter(30)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Últimos 30 días</button>
                    <button onClick={() => setQuickFilter(90)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Últimos 90 días</button>
                    <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>
                    <button onClick={() => setYearFilter(new Date().getFullYear())} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg">Este Año</button>
                    <button onClick={() => setYearFilter(new Date().getFullYear() - 1)} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg">Año Pasado</button>
                </div>
            </div>

            {reports && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        ${reports.summary.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <FaDollarSign className="text-2xl text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Transacciones</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{reports.summary.totalTransactions}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FaShoppingCart className="text-2xl text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Venta Promedio</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        ${reports.summary.averageSale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <FaChartLine className="text-2xl text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Productos Vendidos</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{reports.summary.totalItemsSold}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <FaBoxOpen className="text-2xl text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales by Day */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Ventas por Día de la Semana</h2>
                        <div className="space-y-3">
                            {reports.salesByDay.map((day) => {
                                const maxSales = Math.max(...reports.salesByDay.map(d => d.sales));
                                const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;

                                return (
                                    <div key={day.dayNumber}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{day.day}</span>
                                            <span className="text-gray-600">
                                                ${day.sales.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({day.transactions} ventas)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Products and Clients */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        {/* Top Products */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <FaTrophy className="text-yellow-500" />
                                    {showAllProducts ? 'Todos los Productos' : (sortProducts === 'desc' ? 'Top 10 Productos' : 'Productos con menos ventas')}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={sortProducts}
                                        onChange={(e) => setSortProducts(e.target.value)}
                                        className="text-sm border-none bg-transparent text-gray-500 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="desc">Más vendidos</option>
                                        <option value="asc">Menos vendidos</option>
                                    </select>
                                    <button
                                        onClick={() => setShowAllProducts(!showAllProducts)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {showAllProducts ? 'Ver top 10' : 'Ver todos'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[...reports.products]
                                    .sort((a, b) => sortProducts === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue)
                                    .slice(0, showAllProducts ? undefined : 10)
                                    .map((product, index) => (
                                        <div key={product.id || `prod-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center justify-center w-6 h-6 ${sortProducts === 'desc' ? 'bg-blue-600' : 'bg-red-500'} text-white text-xs font-bold rounded-full`}>
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500">{product.quantity} unidades</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-green-600">
                                                ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))}
                                {reports.products.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No hay datos de productos</p>
                                )}
                            </div>
                        </div>

                        {/* Top Clients */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <FaUsers className="text-blue-500" />
                                    {showAllClients ? 'Todos los Clientes' : (sortClients === 'desc' ? 'Top 10 Clientes' : 'Clientes con menos compras')}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={sortClients}
                                        onChange={(e) => setSortClients(e.target.value)}
                                        className="text-sm border-none bg-transparent text-gray-500 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="desc">Más compras</option>
                                        <option value="asc">Menos compras</option>
                                    </select>
                                    <button
                                        onClick={() => setShowAllClients(!showAllClients)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {showAllClients ? 'Ver top 10' : 'Ver todos'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[...reports.clients]
                                    .sort((a, b) => sortClients === 'desc' ? b.total - a.total : a.total - b.total)
                                    .slice(0, showAllClients ? undefined : 10)
                                    .map((client, index) => (
                                        <div key={client.id || `client-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center justify-center w-6 h-6 ${sortClients === 'desc' ? 'bg-purple-600' : 'bg-red-500'} text-white text-xs font-bold rounded-full`}>
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.name}</p>
                                                    <p className="text-sm text-gray-500">{client.purchases} compras</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-green-600">
                                                ${client.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))}
                                {reports.clients.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No hay datos de clientes</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* PDF Preview Modal */}
            {pdfPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Vista Previa del Reporte</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={downloadPDF}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <FaDownload />
                                    Descargar
                                </button>
                                <button
                                    onClick={() => {
                                        URL.revokeObjectURL(pdfPreview);
                                        setPdfPreview(null);
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cerrar"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={pdfPreview}
                                className="w-full h-full border-none"
                                title="Report Preview"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
