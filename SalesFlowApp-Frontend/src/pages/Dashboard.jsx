import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { Link } from 'react-router-dom';
import dashboardApi from '../services/dashboardApi';
import saleApi from '../services/saleApi';
import {
    FaChartLine,
    FaBoxOpen,
    FaUsers,
    FaShoppingBag,
    FaArrowUp,
    FaPlus,
    FaTicketAlt,
    FaChevronRight,
    FaStoreAlt,
    FaRocket,
    FaWallet
} from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        sales: 0,
        revenue: 0,
        products: 0,
        raffles: 0,
        clients: 0
    });
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsData, salesData] = await Promise.all([
                    dashboardApi.getStats(),
                    saleApi.getSales({ limit: 5 })
                ]);

                setStats({
                    sales: statsData.saleCount || 0,
                    revenue: statsData.totalRevenue || 0,
                    products: statsData.productCount || 0,
                    raffles: statsData.raffleCount || 0,
                    clients: statsData.clientCount || 0
                });
                setRecentSales(salesData);
            } catch (error) {
                console.error("Error loading dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Helper component for Premium Stat Cards
    const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, isLoading }) => (
        <div className="premium-card p-6 flex flex-col justify-between h-full hover:translate-y-[-4px] active:scale-[0.98] cursor-default">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${gradientClass} flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={20} />
                </div>
                {!isLoading && (
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                        <FaArrowUp size={10} /> 12%
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {isLoading ? (
                        <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                    ) : value}
                </h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* 1. Welcome Section - High Impact */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="animate-fade-up">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <FaStoreAlt size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Dashboard Principal</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-2">
                        ¡Hola, {user?.firstName}! <span className="text-blue-600">👋</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg">
                        {user?.role === 'employee'
                            ? `Gestionando ${user?.businessName || 'tu negocio'} con éxito.`
                            : 'Aquí tienes el pulso de tu negocio en tiempo real.'}
                    </p>
                </div>

                {user?.permissions?.pos !== false && (
                    <Link
                        to="/pos"
                        className="btn-primary flex items-center justify-center gap-2 group sm:min-w-[180px]"
                    >
                        <FaPlus className="text-blue-200 group-hover:rotate-90 transition-transform" />
                        <span>Nueva Venta</span>
                    </Link>
                )}
            </div>

            {/* 2. KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Ventas de Hoy"
                    value={`$${parseFloat(stats.revenue).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    icon={FaWallet}
                    gradientClass="bg-gradient-to-br from-blue-500 to-blue-700"
                    isLoading={loading}
                />
                <StatCard
                    title="Productos"
                    value={stats.products}
                    icon={FaBoxOpen}
                    gradientClass="bg-gradient-to-br from-emerald-500 to-teal-700"
                    isLoading={loading}
                />
                <StatCard
                    title="Clientes"
                    value={stats.clients}
                    icon={FaUsers}
                    gradientClass="bg-gradient-to-br from-indigo-500 to-purple-700"
                    isLoading={loading}
                />
                <StatCard
                    title="Sorteos"
                    value={stats.raffles}
                    icon={FaTicketAlt}
                    gradientClass="bg-gradient-to-br from-orange-400 to-red-600"
                    isLoading={loading}
                />
            </div>

            {/* 3. Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Recent Activity Feed */}
                <div className="lg:col-span-8 flex flex-col">
                    <div className="premium-card flex-1 flex flex-col overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Ventas Recientes</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimas 5 transacciones</p>
                            </div>
                            <Link to="/sales" className="text-xs font-bold text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1 uppercase tracking-widest">
                                Ver Todo <FaChevronRight size={10} />
                            </Link>
                        </div>

                        <div className="p-4 sm:p-6 flex-1">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : recentSales.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-fade-up">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                        <FaShoppingBag className="text-slate-300 text-3xl" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 tracking-tight">Aún no hay ventas</h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-medium">Empieza a vender para ver tus transacciones aquí.</p>
                                    <Link to="/pos" className="mt-6 text-sm font-bold text-blue-600 underline decoration-blue-200 underline-offset-4">Ir al Mostrador →</Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentSales.map((sale, index) => (
                                        <div
                                            key={sale.id}
                                            className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all animate-fade-up"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    {sale.Client ? sale.Client.firstName.charAt(0) : <FaUsers size={16} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-800 tracking-tight">
                                                            {sale.Client ? `${sale.Client.firstName} ${sale.Client.lastName || ''}` : 'Venta General'}
                                                        </p>
                                                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-bold uppercase tracking-widest">Éxito</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                        {new Date(sale.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} • {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-800 tracking-tighter">
                                                    ${parseFloat(sale.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </p>
                                                <div className="flex items-center justify-end gap-1 mt-0.5">
                                                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #{sale.id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Growth & Quick Tools */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Setup Card */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <FaRocket size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Escala tu Negocio</h3>
                            <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                                Personaliza tus tickets y configura tu logo para una imagen profesional.
                            </p>
                            <Link
                                to="/business-profile"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                            >
                                Configurar Ahora <FaChevronRight size={10} />
                            </Link>
                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-600/20 transition-all"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                    </div>

                    {/* Fast Tools */}
                    <div className="premium-card p-8">
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-800 tracking-tight">Acciones Automáticas</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Herramientas de gestión</p>
                        </div>
                        <div className="space-y-4">
                            <Link
                                to="/products/new"
                                className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <FaPlus size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 tracking-tight">Nuevo Producto</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Suma inventario</p>
                                </div>
                                <FaChevronRight className="text-slate-200" size={12} />
                            </Link>

                            <Link
                                to="/raffles"
                                className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <FaTicketAlt size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 tracking-tight">Crear Sorteo</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Impulsa ventas</p>
                                </div>
                                <FaChevronRight className="text-slate-200" size={12} />
                            </Link>

                            <Link
                                to="/reports"
                                className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <FaChartLine size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 tracking-tight">Analítica</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ver estadísticas</p>
                                </div>
                                <FaChevronRight className="text-slate-200" size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
