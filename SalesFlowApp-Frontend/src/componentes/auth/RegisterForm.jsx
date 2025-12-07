import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { Link } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser } from "react-icons/hi";


const RegisterForm = () => {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [uiError, setUiError] = useState('');
    const { register, isLoading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUiError('');

        try {
            await register(nombre, correo, password);
            console.log('Usuario registrado');
        } catch (error) {
            console.error('Error al registrar:', error);
            // Fallback local si el error no viene del contexto (raro)
            if (!error) setUiError(error.message || 'Error al registrar. Verifica tus credenciales');
        }
    };

    // Combinar error global con error local, priorizando el global si existe
    const displayError = error || uiError;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-gray-50 rounded-3xl shadow-2xl">
                <h2 className="text-4xl font-bold text-center text-indigo-700 mb-2">
                    SalesFlowApp
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    Regístrate para administrar tus ventas
                </p>

                {displayError && (
                    <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {displayError}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <HiUser className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => {
                                setNombre(e.target.value);
                                if (uiError) setUiError('');
                            }}
                            placeholder="Nombre"
                            className="w-full pl-10 p-3 border border-transparent bg-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="relative">
                        <HiMail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => {
                                setCorreo(e.target.value);
                                if (uiError) setUiError('');
                            }}
                            placeholder="Correo electrónico"
                            className="w-full pl-10 p-3 border border-transparent bg-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="relative">
                        <HiLockClosed className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (uiError) setUiError('');
                            }}
                            placeholder="Contraseña"
                            className="w-full pl-10 p-3 border border-transparent bg-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white p-3 rounded-xl text-lg font-semibold hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-indigo-300"
                    >
                        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="flex flex-col gap-2">
                    <p className='text-center text-gray-400 text-sm mt-3'>
                        ¿Ya tienes una cuenta? <Link to="/login" className="text-indigo-600 hover:underline">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterForm;