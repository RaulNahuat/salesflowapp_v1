import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import AuthLayout from '../../layout/AuthLayout';
import { forgotPassword } from '../../services/authApi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await forgotPassword(email);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <AuthLayout
                title="¡Correo Enviado!"
                subtitle="Revisa tu bandeja de entrada"
            >
                <div className="text-center space-y-6 animate-fade-in-content">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                        <FaPaperPlane size={32} />
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Si el correo <span className="text-slate-800 font-bold">{email}</span> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                    </p>
                    <div className="pt-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all"
                        >
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Recuperar Clave"
            subtitle="Ingresa tu correo para continuar"
        >
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-content">
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center animate-shake leading-tight shadow-sm">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !email}
                    className="relative w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl overflow-hidden shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-70 group"
                >
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin text-lg" />
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <span>Enviar Instrucciones</span>
                        )}
                    </div>
                </button>

                <div className="text-center pt-2">
                    <Link
                        to="/login"
                        className="text-slate-400 text-sm font-medium hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                    >
                        <FaArrowLeft size={10} /> Volver al Inicio
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
