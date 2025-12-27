import React from 'react';
import { FaChartLine } from 'react-icons/fa';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex bg-gray-50">
            {/* Branding Section - Left Side */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 to-indigo-800 text-white flex-col justify-center px-12 relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm shadow-xl">
                            <FaChartLine className="text-4xl text-blue-300" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">SalesFlow</h1>
                    </div>

                    <h2 className="text-3xl font-semibold mb-6 leading-tight">
                        Gestiona tu negocio como <br /> <span className="text-blue-300">un profesional.</span>
                    </h2>

                    <p className="text-blue-100 text-lg opacity-80 max-w-md leading-relaxed">
                        Controla inventarios, ventas y clientes desde una sola plataforma.
                        Diseñado para emprendedores que buscan crecer.
                    </p>

                    {/* Stats or Trust Indicators could go here */}
                    <div className="mt-12 flex gap-8 pt-8 border-t border-white/10">
                        <div>
                            <p className="text-3xl font-bold">100%</p>
                            <p className="text-sm text-blue-200 uppercase tracking-wider mt-1">Control</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">24/7</p>
                            <p className="text-sm text-blue-200 uppercase tracking-wider mt-1">Acceso</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section - Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-gray-50">
                <div className="w-full max-w-md bg-white lg:shadow-xl lg:rounded-3xl lg:p-10">
                    <div className="mb-10 text-center lg:text-left">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden justify-center mb-6">
                            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                                <FaChartLine className="text-2xl text-white" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
                        {subtitle && <p className="text-gray-500">{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
