import React from 'react';
import { FaChartLine, FaCheckCircle } from 'react-icons/fa';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Branding Section - Left Side */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex-col justify-center px-16 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-400 opacity-5 rounded-full blur-2xl"></div>

                <div className="relative z-10 max-w-lg">
                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="bg-white/15 p-4 rounded-2xl backdrop-blur-sm shadow-2xl border border-white/20">
                            <FaChartLine className="text-5xl text-white drop-shadow-lg" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold tracking-tight">SalesFlowApp</h1>
                            <p className="text-blue-200 text-sm mt-1">Tu aliado en ventas</p>
                        </div>
                    </div>

                    {/* Main Message */}
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Gestiona tu negocio <br />
                        <span className="text-blue-200">como un profesional</span>
                    </h2>

                    <p className="text-blue-50 text-lg mb-10 leading-relaxed opacity-90">
                        Controla inventarios, ventas y clientes desde una sola plataforma.
                        Diseñado para emprendedores que buscan crecer.
                    </p>

                    {/* Features */}
                    <div className="space-y-4 mb-12">
                        {[
                            'Control total de inventario',
                            'Gestión de ventas en tiempo real',
                            'Base de datos de clientes',
                            'Reportes y estadísticas'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-blue-50">
                                <FaCheckCircle className="text-blue-300 text-xl flex-shrink-0" />
                                <span className="text-base">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-12 pt-8 border-t border-white/20">
                        <div>
                            <p className="text-4xl font-bold">100%</p>
                            <p className="text-sm text-blue-200 uppercase tracking-wider mt-2">Gratis</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">24/7</p>
                            <p className="text-sm text-blue-200 uppercase tracking-wider mt-2">Acceso</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">∞</p>
                            <p className="text-sm text-blue-200 uppercase tracking-wider mt-2">Ventas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section - Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 sm:p-10 border border-gray-100">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden flex-col items-center mb-10">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg mb-4">
                            <FaChartLine className="text-3xl text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">SalesFlowApp</h1>
                    </div>

                    {/* Title Section */}
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
                        {subtitle && <p className="text-gray-500 text-sm sm:text-base">{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
