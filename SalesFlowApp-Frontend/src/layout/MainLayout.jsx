import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
    FaChartPie,
    FaBox,
    FaCashRegister,
    FaTicketAlt,
    FaStore,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaUserCircle,
    FaUsers,
    FaUserTie,
    FaFileInvoiceDollar,
    FaHistory,
    FaChartBar,
    FaSearch,
    FaBell
} from 'react-icons/fa';
import ConfirmationModal from '../componentes/ui/ConfirmationModal';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });
    const { user, logout } = useAuth();
    const location = useLocation();

    const confirmLogout = () => {
        setModalConfig({
            isOpen: true,
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que deseas cerrar sesión?',
            isDatgerous: false,
            confirmText: 'Sí, salir',
            cancelText: 'Cancelar',
            action: logout
        });
    };

    const menuItems = [
        { path: '/dashboard', label: 'Inicio', icon: FaChartPie, permission: null },
        { path: '/pos', label: 'Vender', icon: FaCashRegister, permission: 'pos' },
        { path: '/sales', label: 'Ventas', icon: FaFileInvoiceDollar, permission: 'pos' },
        { path: '/receipts/history', label: 'Tickets', icon: FaHistory, permission: 'pos' },
        { path: '/reports', label: 'Reportes', icon: FaChartBar, permission: 'reports' },
        { path: '/products', label: 'Inventario', icon: FaBox, permission: 'products' },
        { path: '/clients', label: 'Clientes', icon: FaUsers, permission: 'clients' },
        { path: '/workers', label: 'Equipo', icon: FaUserTie, permission: 'settings' },
        { path: '/raffles', label: 'Sorteos', icon: FaTicketAlt, permission: 'raffles' },
        { path: '/business-profile', label: 'Negocio', icon: FaStore, permission: 'settings' },
        { path: '/profile', label: 'Mi Perfil', icon: FaUserCircle, permission: null },
    ];

    // Core Mobile Quick Access (Bottom Nav)
    const mobileBottomItems = [
        { path: '/dashboard', label: 'Inicio', icon: FaChartPie },
        { path: '/pos', label: 'Vender', icon: FaCashRegister },
        { path: '/sales', label: 'Ventas', icon: FaFileInvoiceDollar },
        { path: '/profile', label: 'Perfil', icon: FaUserCircle },
    ];

    const visibleMenuItems = menuItems.filter(item => {
        if (user?.role === 'owner') return true;
        if (!item.permission) return true;
        if (user?.role === 'employee' && user?.permissions) {
            return user.permissions[item.permission] === true;
        }
        return false;
    });

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-hidden">
            {/* Desktop Sidebar - Premium Design */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
                <div className="h-20 flex items-center px-8 border-b border-slate-50">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 mr-3 transform transition-transform hover:scale-110">
                        <span className="text-white font-black text-xl tracking-tighter">S</span>
                    </div>
                    <div>
                        <span className="text-xl font-black text-slate-800 tracking-tight">SalesFlow</span>
                        <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] -mt-1">Pro Edition</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto no-scrollbar">
                    {visibleMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                                ${isActive(item.path)
                                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm shadow-blue-50/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            {isActive(item.path) && (
                                <span className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"></span>
                            )}
                            <item.icon className={`mr-3.5 text-xl transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            <span className="tracking-tight">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                    <button
                        onClick={confirmLogout}
                        className="w-full flex items-center justify-center px-4 py-3 bg-white border border-rose-100 text-rose-600 rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all duration-300 text-sm font-bold shadow-sm group"
                    >
                        <FaSignOutAlt className="mr-2.5 transition-transform group-hover:-translate-x-1" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Global Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 active:scale-90 transition-all"
                        >
                            <FaBars size={20} />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase text-[10px] text-slate-400 mb-1">Empresa</h2>
                            <p className="font-bold text-slate-900">{user?.businessName || 'Cargando...'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden md:flex items-center bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                            <FaSearch className="text-slate-400 mr-2" />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm font-medium w-48 lg:w-64" />
                        </div>

                        <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all relative">
                            <FaBell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
                        </button>

                        <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group active:scale-95">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-100 group-hover:rotate-6 transition-transform">
                                {user?.firstName?.charAt(0) || <FaUserCircle />}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-black text-slate-900 leading-tight tracking-tight">{user?.firstName}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] pb-24 lg:pb-8 p-4 sm:p-6 lg:p-10 no-scrollbar">
                    <div className="max-w-[1600px] mx-auto animate-fade-up">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Navigation - Premium Component */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 h-20 flex items-center justify-between pb-4 z-40">
                    {mobileBottomItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`
                                p-2 rounded-2xl transition-all duration-300
                                ${isActive(item.path) ? 'bg-blue-50 scale-110 shadow-sm shadow-blue-50' : ''}
                            `}>
                                <item.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive(item.path) ? 'opacity-100' : 'opacity-60'}`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex flex-col items-center justify-center gap-1 text-slate-400"
                    >
                        <div className="p-2 rounded-2xl">
                            <FaBars size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Menú</span>
                    </button>
                </nav>
            </div>

            {/* Improved Mobile Drawer Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)}></div>
                    <aside className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col animate-[slideInLeft_0.3s_ease-out]">
                        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl mr-3 shadow-lg shadow-blue-100">S</div>
                                <span className="text-xl font-black text-slate-800 tracking-tight">SalesFlow</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 no-scrollbar">
                            {visibleMenuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center px-4 py-3.5 rounded-2xl transition-all
                                        ${isActive(item.path)
                                            ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100'
                                            : 'text-slate-500 hover:bg-slate-50'}
                                    `}
                                >
                                    <item.icon className="mr-4 text-xl" />
                                    <span className="tracking-tight">{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-50">
                            <button
                                onClick={confirmLogout}
                                className="w-full flex items-center justify-center px-4 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                            >
                                <FaSignOutAlt className="mr-2.5" /> Cerrar Sesión
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}} />

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDatgerous={modalConfig.isDatgerous}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />
        </div>
    );
};

export default MainLayout;
