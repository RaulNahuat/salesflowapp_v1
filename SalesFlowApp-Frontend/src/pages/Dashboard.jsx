import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
// import { useNavigate } from 'react-router-dom'; (Unused for now)
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
    FaTicketAlt
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

    // Helper component for KPI Cards
    const StatCard = ({ title, value, icon: Icon, color, trend, isLoading }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : value}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
                    <Icon className="text-xl text-white" />
                </div>
            </div>
            {trend && !isLoading && (
                <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500 flex items-center font-medium">
                        <FaArrowUp className="mr-1" /> {trend}
                    </span>
                    <span className="text-gray-400 ml-2">vs mes anterior</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* 1. Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        ¡Hola, {user?.firstName}! 👋
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base">Aquí tienes el resumen de tu negocio hoy.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/pos"
                        className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
                    >
                        <FaPlus className="mr-2" /> Nueva Venta
                    </Link>
                </div>
            </div>

            {/* 2. KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ventas Totales"
                    value={`$${parseFloat(stats.revenue).toFixed(2)}`}
                    icon={FaChartLine}
                    color="bg-blue-500"
                    isLoading={loading}
                // trend="12%" 
                />
                <StatCard
                    title="Productos Totales"
                    value={stats.products}
                    icon={FaBoxOpen}
                    color="bg-emerald-500"
                    isLoading={loading}
                />
                <StatCard
                    title="Clientes Activos"
                    value={stats.clients}
                    icon={FaUsers}
                    color="bg-indigo-500"
                    isLoading={loading}
                />
                <StatCard
                    title="Sorteos Activos"
                    value={stats.raffles}
                    icon={FaTicketAlt}
                    color="bg-orange-500"
                    isLoading={loading}
                />
            </div>

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Activity (Taking up 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Actividad Reciente</h2>
                            <Link to="/pos" className="text-sm text-blue-600 font-medium hover:underline">Ir a Ventas</Link>
                        </div>

                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>)}
                            </div>
                        ) : recentSales.length === 0 ? (
                            /* Empty State Illustration */
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <FaShoppingBag className="text-3xl text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-500">No hay ventas recientes</p>
                                <p className="text-sm">Tus últimas transacciones aparecerán aquí.</p>
                            </div>
                        ) : (
                            /* Sales List */
                            <div className="space-y-4">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {sale.Client ? sale.Client.firstName.charAt(0) : <FaUsers size={14} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">
                                                    {sale.Client ? `${sale.Client.firstName} ${sale.Client.lastName}` : 'Cliente Casual'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(sale.createdAt).toLocaleDateString()} • {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">${parseFloat(sale.total).toFixed(2)}</p>
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                Completado
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Actions & Tips (Taking up 1/3) */}
                <div className="space-y-6">
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Configura tu Negocio</h3>
                            <p className="text-indigo-200 text-sm mb-4">
                                Completa tu perfil para que tus tickets salgan personalizados.
                            </p>
                            <Link
                                to="/business-profile"
                                className="inline-block px-4 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
                            >
                                Ir a Configuración
                            </Link>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-700 rounded-full opacity-50 blur-2xl"></div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Accesos Rápidos</h3>
                        <div className="space-y-3">
                            <Link
                                to="/products/new"
                                className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition-colors">
                                    <FaPlus />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Agregar Producto</p>
                                    <p className="text-xs text-gray-500">Suma inventario rápidamente</p>
                                </div>
                            </Link>

                            <Link
                                to="/raffles"
                                className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                                    <FaTicketAlt />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Crear Sorteo</p>
                                    <p className="text-xs text-gray-500">Organiza una rifa</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
