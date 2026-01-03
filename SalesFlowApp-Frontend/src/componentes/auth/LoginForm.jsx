import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../layout/AuthLayout';
import { FaEnvelope, FaLock, FaSpinner, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(credentials.email, credentials.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="¡Bienvenido de nuevo!"
            subtitle="Accede a tu panel de control"
        >
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-content">
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center animate-shake leading-tight shadow-sm">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Email Input */}
                    <div className="group space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1 ml-1" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaEnvelope className="text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="group space-y-2">
                        <div className="flex justify-between items-center mb-1 ml-1">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400" htmlFor="password">
                                Contraseña
                            </label>
                            <Link to="/forgot-password" className="text-[10px] font-bold text-blue-500 hover:text-blue-600 hover:underline tracking-tight">
                                Olvidé mi clave
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaLock className="text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-blue-500 transition-colors focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl overflow-hidden shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-70 group"
                >
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin text-lg" />
                                <span>Accediendo...</span>
                            </>
                        ) : (
                            <>
                                <span>Entrar</span>
                                <FaArrowRight className="text-sm opacity-80 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                </button>

                <div className="text-center pt-2">
                    <p className="text-slate-400 text-sm font-medium">
                        ¿Nuevo aquí?{' '}
                        <Link to="/register" className="font-extrabold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 group">
                            Únete ahora
                            <span className="h-0.5 w-0 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </p>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-fade-in-content {
                    animation: fadeContent 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeContent {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </AuthLayout>
    );
};

export default LoginForm;
