import React from 'react';
import { FaChartLine, FaCheckCircle } from 'react-icons/fa';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex bg-[#f8fafc] relative overflow-hidden font-inter">
            {/* Mesh Gradient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]"></div>
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-400/10 rounded-full blur-[100px] animate-bounce-slow"></div>

            {/* Branding Section - Left Side (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white flex-col justify-center px-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                <div className="relative z-10 max-w-lg">
                    {/* Logo */}
                    <div className="flex items-center gap-5 mb-12 animate-fade-in-down">
                        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl shadow-2xl border border-white/20">
                            <FaChartLine className="text-5xl text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-extrabold tracking-tighter">SalesFlow<span className="text-blue-400">App</span></h1>
                            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mt-1">Sincronización Total</p>
                        </div>
                    </div>

                    {/* Main Message */}
                    <div className="space-y-6">
                        <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                            Domina tus ventas <br />
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">como nunca antes</span>
                        </h2>

                        <p className="text-slate-300 text-xl leading-relaxed opacity-90 max-w-md">
                            La plataforma definitiva para gestionar inventarios, ventas y clientes con una velocidad asombrosa.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-6 mt-12">
                        {[
                            { text: 'Inventario Inteligente', color: 'text-blue-400' },
                            { text: 'Ventas en Vivo', color: 'text-emerald-400' },
                            { text: 'Analytics Premium', color: 'text-indigo-400' },
                            { text: 'Soporte 24/7', color: 'text-purple-400' }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                                <FaCheckCircle className={`${feature.color} text-xl group-hover:scale-110 transition-transform`} />
                                <span className="text-sm font-semibold opacity-90">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Section - Right Side / Mobile Center */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
                <div className="w-full max-w-md bg-white/70 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 sm:p-12 border border-white/40 relative overflow-hidden">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                    {/* Mobile Logo (Visible on mobile only) */}
                    <div className="flex lg:hidden flex-col items-center mb-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-3xl shadow-xl shadow-blue-500/20 mb-4 animate-bounce-slow">
                            <FaChartLine className="text-3xl text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter">SalesFlow<span className="text-blue-600">App</span></h1>
                    </div>

                    {/* Title Section */}
                    <div className="mb-8 text-center sm:text-left animate-fade-up">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">{title}</h2>
                        {subtitle && <p className="text-slate-500 text-sm sm:text-base font-medium">{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
                .font-inter { font-family: 'Inter', sans-serif; }
                .animate-fade-up {
                    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default AuthLayout;
