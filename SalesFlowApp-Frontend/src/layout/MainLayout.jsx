import React, { useState } from 'react';
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
    FaUserTie
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
        { path: '/dashboard', label: 'Dashboard', icon: FaChartPie, permission: null }, // Always available
        { path: '/pos', label: 'Punto de Venta', icon: FaCashRegister, permission: 'pos' },
        { path: '/products', label: 'Inventario', icon: FaBox, permission: 'products' },
        { path: '/clients', label: 'Clientes', icon: FaUsers, permission: 'clients' }, // Separate permission
        { path: '/workers', label: 'Equipo', icon: FaUserTie, permission: 'settings' }, // Managers/Owners
        { path: '/raffles', label: 'Sorteos', icon: FaTicketAlt, permission: 'raffles' }, // Separate permission
        { path: '/business-profile', label: 'Mi Negocio', icon: FaStore, permission: 'settings' },
    ];

    // Filter items based on user permissions
    const visibleMenuItems = menuItems.filter(item => {
        // 1. Owners see everything
        if (user?.role === 'owner') return true;

        // 2. Always visible items
        if (!item.permission) return true;

        // 3. Employee checks
        if (user?.role === 'employee' && user?.permissions) {
            return user.permissions[item.permission] === true;
        }

        return false;
    });

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">SalesFlow</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {visibleMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                                `}
                            >
                                <item.icon className={`mr-3 text-lg ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center p-3 bg-gray-50 rounded-xl mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-3">
                                {user?.firstName?.charAt(0) || <FaUserCircle />}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.firstName}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={confirmLogout}
                            className="w-full flex items-center justify-center px-4 py-2 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <FaSignOutAlt className="mr-2" /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 lg:hidden h-16 flex items-center justify-between px-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700 p-2"
                    >
                        <FaBars size={24} />
                    </button>
                    <span className="font-bold text-gray-800">SalesFlow</span>
                    <div className="w-8"></div> {/* Spacer for center alignment */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-8">
                    {children}
                </main>
            </div>
            {/* Modal de Confirmación */}
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
