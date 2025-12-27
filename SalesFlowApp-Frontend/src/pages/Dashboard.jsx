import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Dashboard = () => {
    const { signOut, user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <button
                        onClick={signOut}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
                    >
                        Cerrar Sesión
                    </button>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <p className="text-blue-700">
                        Bienvenido, <span className="font-bold">{user?.nombre} ({user?.rol || 'Usuario'})</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tarjetas de ejemplo para el dashboard */}
                    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                        <h3 className="font-semibold text-lg mb-2">Ventas Recientes</h3>
                        <p className="text-gray-600">No hay ventas registradas hoy.</p>
                    </div>
                    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                        <h3 className="font-semibold text-lg mb-2">Estadísticas</h3>
                        <p className="text-gray-600">Tus gráficos aparecerán aquí.</p>
                    </div>

                    {/* Link a Clientes */}
                    <Link to="/clientes" className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-center items-center text-center group">
                        <h3 className="font-bold text-xl text-indigo-700 mb-2 group-hover:underline">Gestión de Clientes</h3>
                        <p className="text-indigo-600 text-sm">Administrar base de datos de clientes</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
