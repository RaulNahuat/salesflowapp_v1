import React, { useState, useEffect } from 'react';
import {
    FaChartLine,
    FaCalendar,
    FaDollarSign,
    FaShoppingCart,
    FaBoxOpen,
    FaUsers,
    FaTrophy,
    FaFilter,
    FaDownload,
    FaChevronRight,
    FaArrowRight,
    FaRegChartBar,
    FaCalendarAlt,
    FaTimes,
    FaFilePdf,
    FaEye
} from 'react-icons/fa';
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
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Analizando Datos...</p>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => (
        <div className="premium-card p-6 flex items-center gap-5 hover:translate-y-[-4px] active:scale-[0.98] transition-all">
            <div className={`w-14 h-14 rounded-2xl ${gradientClass} flex items-center justify-center text-white shadow-lg`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tighter leading-none">
                    {value}
                </h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-up">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <FaRegChartBar size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Analítica Empresarial</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Reportes de Ventas</h1>
                    <p className="text-slate-500 font-medium max-w-lg">
                        Visualiza el rendimiento de tu negocio y toma decisiones basadas en datos reales.
                    </p>
                </div>
                {reports && (
                    <div className="flex gap-3">
                        <button
                            onClick={previewPDF}
                            className="bg-white border border-slate-100 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <FaEye /> Vista Previa
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="btn-primary flex items-center justify-center gap-2"
                        >
                            <FaFilePdf size={16} className="text-blue-200" />
                            <span>Exportar PDF</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 2. Filters & Intelligence */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                <div className="flex flex-col sm:flex-row gap-6 flex-1 w-full">
                    <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" /> Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" /> Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full lg:w-auto">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setQuickFilter(7)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">7D</button>
                        <button onClick={() => setQuickFilter(30)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">30D</button>
                        <button onClick={() => setYearFilter(new Date().getFullYear())} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 rounded-xl transition-all">Este Año</button>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={filters.liveDaysOnly}
                                onChange={(e) => setFilters(prev => ({ ...prev, liveDaysOnly: e.target.checked }))}
                                className="sr-only"
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${filters.liveDaysOnly ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.liveDaysOnly ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Solo días de envío</span>
                    </label>
                </div>
            </div>

            {reports && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="Capital Recaudado"
                            value={`$${reports.summary.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                            icon={FaDollarSign}
                            gradientClass="bg-gradient-to-br from-blue-500 to-blue-700"
                        />
                        <StatCard
                            title="Transacciones"
                            value={reports.summary.totalTransactions}
                            icon={FaShoppingCart}
                            gradientClass="bg-gradient-to-br from-emerald-500 to-teal-700"
                        />
                        <StatCard
                            title="Ticket Promedio"
                            value={`$${reports.summary.averageSale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                            icon={FaChartLine}
                            gradientClass="bg-gradient-to-br from-indigo-500 to-purple-700"
                        />
                        <StatCard
                            title="Volumen Envío"
                            value={reports.summary.totalItemsSold}
                            icon={FaBoxOpen}
                            gradientClass="bg-gradient-to-br from-orange-400 to-red-600"
                        />
                    </div>

                    {/* Sales Performance Visualization */}
                    <div className="premium-card p-6 sm:p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Rendimiento Temporal</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Ventas acumuladas por día</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {reports.salesByDay.map((day) => {
                                const maxSales = Math.max(...reports.salesByDay.map(d => d.sales));
                                const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;

                                return (
                                    <div key={day.dayNumber} className="group">
                                        <div className="flex items-end justify-between text-[11px] font-bold uppercase tracking-widest mb-3">
                                            <span className="text-slate-800 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {day.day}
                                            </span>
                                            <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                                                ${day.sales.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-slate-300 font-bold ml-1">/ {day.transactions} vtas</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100/50">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Products Ranking */}
                        <div className="premium-card flex flex-col overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                                <div className="flex items-center gap-3">
                                    <FaTrophy className="text-amber-400" />
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Ranking de Productos</h2>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Por volumen de ingresos</p>
                                    </div>
                                </div>
                                <select
                                    value={sortProducts}
                                    onChange={(e) => setSortProducts(e.target.value)}
                                    className="text-[10px] font-bold uppercase tracking-widest border-none bg-blue-50 text-blue-600 rounded-xl focus:ring-0 cursor-pointer px-3 py-1.5"
                                >
                                    <option value="desc">Más Vendidos</option>
                                    <option value="asc">Menos Vendidos</option>
                                </select>
                            </div>
                            <div className="p-4 space-y-2 flex-1">
                                {[...reports.products]
                                    .sort((a, b) => sortProducts === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue)
                                    .slice(0, showAllProducts ? undefined : 10)
                                    .map((product, index) => (
                                        <div key={product.id || `prod-${index}`} className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100 active:scale-[0.98]">
                                            <div className="flex items-center gap-4">
                                                <span className={`flex items-center justify-center w-8 h-8 ${index < 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'} text-[10px] font-bold rounded-xl shadow-sm`}>
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 tracking-tight text-sm truncate max-w-[150px] md:max-w-[200px]">{product.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.quantity} Unidades</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800 tracking-tighter">${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 1 })}</p>
                                                <FaArrowRight size={8} className="text-blue-500 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all inline-block mt-1" />
                                            </div>
                                        </div>
                                    ))}
                                <button
                                    onClick={() => setShowAllProducts(!showAllProducts)}
                                    className="w-full py-4 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] hover:bg-blue-50 rounded-2xl transition-all"
                                >
                                    {showAllProducts ? 'Colapsar Lista' : 'Ver Todos los Productos'}
                                </button>
                            </div>
                        </div>

                        {/* Clients Ranking */}
                        <div className="premium-card flex flex-col overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                                <div className="flex items-center gap-3">
                                    <FaUsers className="text-blue-500" />
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Clientes Potenciales</h2>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inversión acumulada</p>
                                    </div>
                                </div>
                                <select
                                    value={sortClients}
                                    onChange={(e) => setSortClients(e.target.value)}
                                    className="text-[10px] font-bold uppercase tracking-widest border-none bg-blue-50 text-blue-600 rounded-xl focus:ring-0 cursor-pointer px-3 py-1.5"
                                >
                                    <option value="desc">Mayor Gasto</option>
                                    <option value="asc">Menor Gasto</option>
                                </select>
                            </div>
                            <div className="p-4 space-y-2 flex-1">
                                {[...reports.clients]
                                    .sort((a, b) => sortClients === 'desc' ? b.total - a.total : a.total - b.total)
                                    .slice(0, showAllClients ? undefined : 10)
                                    .map((client, index) => (
                                        <div key={client.id || `client-${index}`} className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100 active:scale-[0.98]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 tracking-tight text-sm truncate max-w-[150px] md:max-w-[200px]">{client.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.purchases} Compras</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800 tracking-tighter">${client.total.toLocaleString('es-MX', { minimumFractionDigits: 1 })}</p>
                                                <FaChevronRight size={10} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all inline-block mt-1" />
                                            </div>
                                        </div>
                                    ))}
                                <button
                                    onClick={() => setShowAllClients(!showAllClients)}
                                    className="w-full py-4 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] hover:bg-blue-50 rounded-2xl transition-all"
                                >
                                    {showAllClients ? 'Colapsar Lista' : 'Ver Todos los Clientes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Premium PDF Preview Modal */}
            {pdfPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 sm:p-10 animate-fade-up">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-white/50">
                        <div className="p-6 sm:p-8 border-b flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Previsualización de Reporte</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Listo para exportar</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={downloadPDF}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
                                >
                                    <FaDownload /> Descargar
                                </button>
                                <button
                                    onClick={() => {
                                        URL.revokeObjectURL(pdfPreview);
                                        setPdfPreview(null);
                                    }}
                                    className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 rounded-2xl hover:bg-rose-50 transition-all active:scale-90 shadow-sm"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-200/50 p-4 sm:p-8">
                            <iframe
                                src={`${pdfPreview}#toolbar=0`}
                                className="w-full h-full rounded-[2rem] shadow-2xl border border-white"
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
