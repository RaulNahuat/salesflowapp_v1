import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaSpinner, FaCheckCircle, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthLayout from '../../layout/AuthLayout';
import { resetPassword } from '../../services/authApi';
import { toast } from 'react-hot-toast';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (password.length < 8) {
            return setError('La contraseña debe tener al menos 8 caracteres');
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword(token, password);
            setSuccess(true);
            toast.success('¡Contraseña actualizada!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout
                title="¡Actualizado!"
                subtitle="Tu seguridad es lo primero"
            >
                <div className="text-center space-y-6 animate-fade-in-content">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                        <FaCheckCircle size={32} />
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Tu contraseña ha sido actualizada con éxito. Serás redirigido a la pantalla de inicio de sesión en unos segundos.
                    </p>
                    <div className="pt-4">
                        <Link
                            to="/login"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Ir al Inicio Ahora <FaArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Nueva Clave"
            subtitle="Crea una contraseña segura"
        >
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-content">
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center animate-shake leading-tight shadow-sm">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Password Input */}
                    <div className="group space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1 ml-1" htmlFor="password">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaLock className="text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                                placeholder="Min. 8 caracteres"
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

                    {/* Confirm Password Input */}
                    <div className="group space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1 ml-1" htmlFor="confirmPassword">
                            Confirmar Contraseña
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaLock className="text-slate-300 group-focus-within/input:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                                placeholder="Repite tu contraseña"
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="relative w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl overflow-hidden shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-70 group"
                >
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin text-lg" />
                                <span>Actualizando...</span>
                            </>
                        ) : (
                            <span>Guardar Contraseña</span>
                        )}
                    </div>
                </button>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
