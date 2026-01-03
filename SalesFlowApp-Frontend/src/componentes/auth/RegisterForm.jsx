import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../layout/AuthLayout';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaSpinner, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterForm = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { registerUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (userData.password !== userData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...dataToSend } = userData;
            await registerUser(dataToSend);
            toast.success('¡Cuenta creada exitosamente!');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.message || 'Error al registrar usuario';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Crea tu negocio"
            subtitle="Regístrate en menos de un minuto"
        >
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-content">
                {error && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold flex items-center animate-shake leading-tight shadow-sm mb-2">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                {/* Business Name */}
                <div className="group space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1" htmlFor="businessName">
                        Nombre del Negocio
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaUser className="text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={userData.businessName}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-sm"
                            placeholder="Ej: Mi Tiendita"
                            required
                        />
                    </div>
                </div>

                {/* Grid for Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="group space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1" htmlFor="firstName">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-sm"
                            placeholder="Juan"
                            required
                        />
                    </div>
                    <div className="group space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1" htmlFor="lastName">
                            Apellido
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-sm"
                            placeholder="Pérez"
                            required
                        />
                    </div>
                </div>

                {/* Email & Phone Row */}
                <div className="space-y-4">
                    <div className="group space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1" htmlFor="email">
                            Correo
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaEnvelope className="text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-sm"
                                placeholder="juan@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="group space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1" htmlFor="phone">
                            Teléfono
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaPhone className="text-slate-300 group-focus-within/input:text-blue-500 transition-colors text-xs" />
                            </div>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={userData.phone}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-sm"
                                placeholder="55 1234 5678"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1" htmlFor="password">
                            Clave
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-sm"
                                placeholder="8+ caracteres"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-blue-500 transition-colors focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="group space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1" htmlFor="confirmPassword">
                            Confirmar
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={userData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-sm"
                                placeholder="Repite tu clave"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-blue-500 transition-colors focus:outline-none"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-[1.25rem] overflow-hidden shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-70 group mt-4"
                >
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="relative flex items-center justify-center gap-2">
                        {loading ? (
                            <FaSpinner className="animate-spin text-lg" />
                        ) : (
                            <>
                                <span>Registrarme</span>
                                <FaArrowRight className="text-xs opacity-70 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                </button>

                <div className="text-center pt-3">
                    <p className="text-slate-400 text-[13px] font-medium">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-black text-blue-600 hover:text-blue-700 transition-colors">
                            Ingresa aquí
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

export default RegisterForm;
