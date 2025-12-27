import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import workerApi from '../../services/workerApi';
import { FaUserPlus, FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const WorkerList = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const data = await workerApi.getWorkers();
            setWorkers(data);
        } catch (err) {
            setError('Error al cargar trabajadores');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Trabajador',
            message: '¿Estás seguro de que deseas eliminar este trabajador? Esta acción no se puede deshacer y perderá su acceso al sistema.',
            isDatgerous: true,
            confirmText: 'Eliminar',
            action: async () => {
                try {
                    await workerApi.deleteWorker(id);
                    setWorkers(prev => prev.filter(w => w.id !== id));
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    toast.success('Trabajador eliminado correctamente');
                } catch (err) {
                    toast.error(err.message || 'Error al eliminar trabajador');
                }
            }
        });
    };

    if (loading) return <div className="text-center py-10">Cargando equipo...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaUserTie className="text-blue-600" />
                        Mi Equipo
                    </h1>
                    <p className="text-gray-500 mt-1">Gestiona el acceso de tus empleados</p>
                </div>
                <Link
                    to="/workers/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    <FaUserPlus /> Nuevo Trabajador
                </Link>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map(worker => (
                    <div key={worker.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {worker.User.firstName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{worker.User.firstName} {worker.User.lastName}</h3>
                                    <p className="text-sm text-gray-500">{worker.User.email}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${worker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {worker.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(worker.permissions).map(([key, val]) => (
                                val && (
                                    <span key={key} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                        {key.toUpperCase()}
                                    </span>
                                )
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Link
                                to={`/workers/edit/${worker.id}`}
                                className="text-gray-400 hover:text-blue-600 p-2 transition-colors"
                            >
                                <FaEdit size={18} />
                            </Link>
                            <button
                                onClick={() => confirmDelete(worker.id)}
                                className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                                title="Eliminar trabajador"
                            >
                                <FaTrash size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {workers.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <FaUserTie className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No hay trabajadores aún</h3>
                        <p className="text-gray-400 mb-6">Comienza agregando a tu primer empleado.</p>
                        <Link
                            to="/workers/new"
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Agregar Trabajador
                        </Link>
                    </div>
                )}
            </div>
            {/* Modal de Confirmación */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDatgerous={modalConfig.isDatgerous}
                confirmText={modalConfig.confirmText}
            />
        </div>
    );
};

export default WorkerList;
