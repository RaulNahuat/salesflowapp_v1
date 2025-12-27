import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import workerApi from '../../services/workerApi';
import { FaSave, FaArrowLeft, FaUser, FaPhone, FaEnvelope, FaLock, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const WorkerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [worker, setWorker] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        permissions: {
            pos: true,
            products: false,
            clients: true,
            raffles: false,
            reports: false,
            settings: false
        },
        status: 'active'
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [error, setError] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });

    // Permission definitions for UI mapping
    const permissionOptions = [
        { key: 'pos', label: 'Punto de Venta', desc: 'Puede realizar ventas y cobrar.' },
        { key: 'products', label: 'Gestión de Productos', desc: 'Puede agregar, editar y eliminar productos.' },
        { key: 'clients', label: 'Gestión de Clientes', desc: 'Puede agregar, editar y eliminar clientes.' },
        { key: 'raffles', label: 'Gestión de Sorteos', desc: 'Puede administrar rifas y boletos.' },
        { key: 'reports', label: 'Reportes y Finanzas', desc: 'Puede ver el historial de ventas y ganancias.' },
        { key: 'settings', label: 'Configuración del Negocio', desc: 'Puede editar el perfil y ajustes globales.' },
    ];

    // Load worker data for edit mode (Note: API needs to return user details properly nested)
    // NOTE: For simplicity, update API logic assumes we fetch details here. 
    // Since getWorkers returns List, we might need a getWorker endpoint or find from cache.
    // For now, I'll rely on the List view passing data state or implement getWorker in backend. 
    // Wait, I didn't implement getWorker(id) in backend controller! 
    // I will implement a quick fetch logic or modify backend later. 
    // For MVP, if backend lacks GET /:id, I can filter from list or add it.
    // Let's assume getWorkers logic returns the list and we filter client-side for now to avoid backend detour, 
    // OR BETTER: Use the existing update endpoint logic.
    // Actually, I should update backend to support GET /:id. But strictly following plan, I'll use the list filter here if needed, 
    // BUT list is not persistent. 
    // I will add a GET /workers/:id to backend in the next step if strictly needed, or just iterate.
    // Let's rely on list logic for now or simply fetch all and find. 

    useEffect(() => {
        if (isEditMode) {
            const fetchWorker = async () => {
                try {
                    // Quick hack: Fetch all and find (Not optimal for scale but ok for MVP)
                    const workers = await workerApi.getWorkers();
                    const found = workers.find(w => w.id === id);
                    if (found) {
                        setWorker({
                            firstName: found.User.firstName,
                            lastName: found.User.lastName,
                            email: found.User.email,
                            phone: found.User.phone || '',
                            // Password not shown
                            permissions: found.permissions,
                            status: found.status
                        });
                    } else {
                        setError('Trabajador no encontrado');
                    }
                } catch (err) {
                    setError('Error al cargar datos');
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchWorker();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setWorker(prev => ({ ...prev, [name]: value }));
    };

    const togglePermission = (key) => {
        setWorker(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions[key]
            }
        }));
    };

    const confirmToggleStatus = () => {
        const action = worker.status === 'active' ? 'desactivar' : 'activar';
        const isDatgerous = worker.status === 'active'; // Deactivating is dangerous/warn-worthy

        setModalConfig({
            isOpen: true,
            title: worker.status === 'active' ? 'Desactivar Trabajador' : 'Activar Trabajador',
            message: `¿Estás seguro de que deseas ${action} a este trabajador? ${worker.status === 'active' ? 'Perderá el acceso al sistema inmediatamente.' : 'Podrá volver a iniciar sesión.'}`,
            isDatgerous: isDatgerous,
            confirmText: worker.status === 'active' ? 'Desactivar' : 'Activar',
            action: () => {
                setWorker(prev => ({
                    ...prev,
                    status: prev.status === 'active' ? 'inactive' : 'active'
                }));
                toast.success(`Trabajador ${worker.status === 'active' ? 'desactivado' : 'activado'} correctamente`);
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Client-side validations
        if (!isEditMode && worker.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                // Update: send permissions and status only 
                await workerApi.updateWorker(id, {
                    permissions: worker.permissions,
                    status: worker.status
                });
                toast.success('Trabajador actualizado correctamente');
            } else {
                await workerApi.createWorker(worker);
                toast.success('Trabajador creado correctamente');
            }
            navigate('/workers');
        } catch (err) {
            const msg = err.message || 'Error al guardar';
            setError(msg);
            toast.error(msg);
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="text-center py-10">Cargando...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link to="/workers" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4">
                    <FaArrowLeft className="mr-2" /> Volver al Equipo
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? 'Editar Trabajador' : 'Nuevo Trabajador'}
                        </h1>
                        <p className="text-gray-500 mt-1">Configura el acceso y permisos.</p>
                    </div>
                    {isEditMode && (
                        <button
                            onClick={confirmToggleStatus}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border ${worker.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                        >
                            {worker.status === 'active' ? 'Activo' : 'Inactivo'}
                            {worker.status === 'active' ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. User Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Información del Usuario</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={worker.firstName}
                                    onChange={handleChange}
                                    disabled={isEditMode} // Disable name edit in MVP as backend logic only updates permissions
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-60"
                                    placeholder="Nombre"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                            <input
                                type="text"
                                name="lastName"
                                value={worker.lastName}
                                onChange={handleChange}
                                disabled={isEditMode}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-60"
                                placeholder="Apellido"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Usuario)</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={worker.email}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-60"
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                            </div>
                        </div>
                        {!isEditMode && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña Temporal</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={worker.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:outline-none"
                                        placeholder="Contraseña segura"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">El trabajador podrá cambiarla después.</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                            <div className="relative">
                                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={worker.phone}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-60"
                                    placeholder="55 1234 5678"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Permissions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Permisos de Acceso</h2>
                    <div className="space-y-4">
                        {permissionOptions.map((perm) => (
                            <div key={perm.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => togglePermission(perm.key)}>
                                <div>
                                    <h4 className="font-bold text-gray-800">{perm.label}</h4>
                                    <p className="text-sm text-gray-500">{perm.desc}</p>
                                </div>
                                <div className={`text-2xl transition-colors ${worker.permissions[perm.key] ? 'text-blue-600' : 'text-gray-300'}`}>
                                    {worker.permissions[perm.key] ? <FaToggleOn size={32} /> : <FaToggleOff size={32} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Link
                        to="/workers"
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <FaSave className="mr-2" /> Guardar Trabajador
                            </>
                        )}
                    </button>
                </div>
            </form>
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

export default WorkerForm;
