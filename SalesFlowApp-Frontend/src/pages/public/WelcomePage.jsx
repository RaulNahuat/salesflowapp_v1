import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaCheckCircle } from 'react-icons/fa';

const WelcomePage = () => {
    return (
        <div className="h-screen bg-[#0f172a] relative overflow-hidden font-sans selection:bg-blue-500/30 flex flex-col">
            {/* Background Gradients/Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-slate-900 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

            {/* Navbar - Fixed at top by flex structure */}
            <nav className="relative z-10 w-full px-6 py-6 flex-none flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex-1" /> {/* Spacer */}
                <div className="flex gap-4 items-center">
                    <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors px-4 py-2 hover:bg-white/5 rounded-lg text-sm md:text-base">
                        Iniciar Sesión
                    </Link>
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm md:text-base">
                        Registrarse
                    </Link>
                </div>
            </nav>

            {/* Main Content - Scrollable area */}
            <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
                <div className="min-h-full flex flex-col justify-center items-start container mx-auto px-6 py-12 max-w-6xl">

                    {/* Logo Section */}
                    <div className="flex items-center gap-4 mb-4 md:mb-8 animate-fade-up shrink-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 backdrop-blur-sm shadow-inner shadow-blue-500/20">
                            <FaChartLine className="text-2xl md:text-3xl text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                                SalesFlow<span className="text-blue-500">App</span>
                            </h2>
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">
                                Sincronización Total
                            </p>
                        </div>
                    </div>

                    {/* Hero Headline */}
                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-4 md:mb-8 max-w-4xl animate-fade-up shrink-0" style={{ animationDelay: '0.1s' }}>
                        Domina tus ventas <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            como nunca antes
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-8 md:mb-12 leading-relaxed animate-fade-up shrink-0" style={{ animationDelay: '0.2s' }}>
                        La plataforma definitiva para gestionar inventarios, ventas y clientes con una velocidad asombrosa.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl animate-fade-up shrink-0" style={{ animationDelay: '0.3s' }}>
                        <FeatureCard icon={<FaCheckCircle />} text="Inventario Inteligente" />
                        <FeatureCard icon={<FaCheckCircle />} text="Ventas en Vivo" />
                        <FeatureCard icon={<FaCheckCircle />} text="Analytics Premium" />
                        <FeatureCard icon={<FaCheckCircle />} text="Soporte 24/7" />
                    </div>
                </div>
            </main>

            {/* Footer - Fixed at bottom by flex structure */}
            <footer className="relative z-10 w-full flex-none border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
                <div className="container mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl">
                    <p className="text-slate-500 text-sm font-medium text-center md:text-left">
                        © 2026 SalesFlowApp. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-400 font-medium">
                        <a href="#" className="hover:text-blue-400 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Términos</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0; 
                }
            `}</style>
        </div>
    );
};

const FeatureCard = ({ icon, text }) => (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group cursor-default">
        <div className="text-blue-500 text-2xl group-hover:scale-110 transition-transform bg-blue-500/10 p-2 rounded-full">
            {icon}
        </div>
        <span className="text-white font-bold text-lg tracking-tight">{text}</span>
    </div>
);

export default WelcomePage;
