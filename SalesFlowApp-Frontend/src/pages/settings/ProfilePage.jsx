import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import userApi from '../../services/userApi';
import { toast } from 'react-hot-toast';
import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaLock,
    FaShieldAlt,
    FaUserCircle,
    FaSave,
    FaKey
} from 'react-icons/fa';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userApi.getProfile();
                setProfileData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || '',
                    email: data.email || ''
                });
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos del perfil');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await userApi.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone
            });

            // Update context so changes reflect everywhere (e.g. sidebar)
            setUser(prev => ({
                ...prev,
                firstName: res.user.firstName,
                lastName: res.user.lastName,
                phone: res.user.phone
            }));

            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al actualizar perfil');
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Las contraseñas nuevas no coinciden');
        }

        setSaving(true);
        try {
            await userApi.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Contraseña actualizada correctamente');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-inner">
                        {profileData.firstName?.charAt(0) || <FaUser />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h1>
                        <p className="text-gray-500 flex items-center gap-2">
                            <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-md text-xs font-semibold text-gray-600 border border-gray-200 uppercase tracking-wider">
                                {user?.role}
                            </span>
                            • {profileData.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information Form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FaUser />
                        </div>
                        <h2 className="font-bold text-gray-800">Información Personal</h2>
                    </div>
                    <form onSubmit={updateProfile} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">Nombre</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleProfileChange}
                                    placeholder="Nombre"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Apellido</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleProfileChange}
                                    placeholder="Apellido"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 italic">El correo no puede ser modificado por seguridad.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Teléfono</label>
                            <div className="relative">
                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    placeholder="Teléfono"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Change Form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <FaShieldAlt />
                        </div>
                        <h2 className="font-bold text-gray-800">Seguridad y Acceso</h2>
                    </div>
                    <form onSubmit={updatePassword} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Contraseña Actual</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-50 my-6"></div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Nueva Contraseña</label>
                            <div className="relative">
                                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Crear nueva contraseña"
                                    minLength={8}
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Confirmar Nueva Contraseña</label>
                            <div className="relative">
                                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Repetir nueva contraseña"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <FaKey /> {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
