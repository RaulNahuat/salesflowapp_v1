import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../layout/AuthLayout';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaSpinner, FaArrowRight } from 'react-icons/fa';

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

        // Validar que las contraseñas coincidan
        if (userData.password !== userData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            // No enviar confirmPassword al backend
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
            title="Crea tu cuenta"
            subtitle="Empieza a gestionar tu negocio hoy mismo."
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center animate-shake">
                        {error}
                    </div>
                )}

                <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1" htmlFor="businessName">
                        Nombre del Negocio
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={userData.businessName}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="Ej: Ventas Juanito"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1" htmlFor="firstName">
                            Nombre
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors text-sm" />
                            </div>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={userData.firstName}
                                onChange={handleChange}
                                className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 text-sm"
                                placeholder="Juan"
                                required
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1" htmlFor="lastName">
                            Apellido
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 text-sm"
                            placeholder="Pérez"
                            required
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1" htmlFor="email">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="juan@negocio.com"
                            required
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1" htmlFor="phone">
                        Teléfono
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaPhone className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={userData.phone}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="55 1234 5678"
                            required
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1" htmlFor="password">
                        Contraseña
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            required
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1" htmlFor="confirmPassword">
                        Confirmar Contraseña
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={userData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="Repite tu contraseña"
                            minLength={8}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin text-lg" /> Creando cuenta...
                        </>
                    ) : (
                        <>
                            Registrarme <FaArrowRight className="text-sm opacity-80" />
                        </>
                    )}
                </button>

                <div className="text-center pt-2">
                    <p className="text-gray-500 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterForm;
