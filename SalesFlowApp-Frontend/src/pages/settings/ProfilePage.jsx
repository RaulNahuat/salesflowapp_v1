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
    FaKey,
    FaAsterisk,
    FaIdCard
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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Cargando tu perfil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10 px-0 sm:px-4 space-y-6 sm:space-y-8 animate-[fadeUp_0.5s_ease-out]">
            {/* Header section - Premium Mobile-First Design */}
            <div className="relative overflow-hidden bg-white sm:rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                {/* Decorative background for mobile */}
                <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>

                <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 p-6 sm:p-8 pt-10 sm:pt-16">
                    {/* Avatar Container */}
                    <div className="relative group">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1 shadow-xl transform transition-transform group-hover:scale-105">
                            <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center text-4xl sm:text-5xl font-bold border border-blue-100">
                                {profileData.firstName?.charAt(0) || <FaUser />}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white p-1 shadow-lg ring-2 ring-gray-50 flex items-center justify-center text-blue-500">
                            <FaShieldAlt size={14} />
                        </div>
                    </div>

                    {/* User Summary Info */}
                    <div className="text-center sm:text-left flex-1 py-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                                {profileData.firstName} {profileData.lastName}
                            </h1>
                            <span className="inline-flex self-center sm:self-start items-center px-3 py-1 bg-blue-600 text-[10px] font-bold text-white uppercase tracking-[0.1em] rounded-full shadow-lg shadow-blue-200">
                                {user?.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5">
                                <FaEnvelope className="text-blue-400" size={14} /> {profileData.email}
                            </span>
                            {profileData.phone && (
                                <span className="flex items-center gap-1.5">
                                    <FaPhone className="text-green-400" size={14} /> {profileData.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Personal Information Card */}
                <div className="bg-white sm:rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FaIdCard size={18} />
                            </div>
                            <h2 className="font-bold text-gray-900 tracking-tight">Información Personal</h2>
                        </div>
                    </div>

                    <form onSubmit={updateProfile} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre</label>
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleProfileChange}
                                        placeholder="Tu nombre"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-300 font-medium text-gray-800"
                                    />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within/input:w-[80%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Apellido</label>
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleProfileChange}
                                        placeholder="Tu apellido"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-300 font-medium text-gray-800"
                                    />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within/input:w-[80%] rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                    <FaEnvelope size={14} />
                                </div>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3 bg-gray-100/50 border-0 rounded-2xl text-gray-400 cursor-not-allowed italic font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Teléfono Móvil</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
                                    <FaPhone size={14} />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    placeholder="Ej: +52 123 456 7890"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-300 font-medium text-gray-800"
                                />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-focus-within/input:w-[80%] rounded-full"></div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="group relative w-full h-14 bg-blue-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl overflow-hidden active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-blue-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:opacity-90 transition-opacity"></div>
                            <div className="relative flex items-center justify-center gap-3">
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FaSave className="text-blue-200 group-hover:scale-110 transition-transform" />
                                        <span>Guardar Cambios</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>

                {/* Security and Password Card */}
                <div className="bg-white sm:rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group/security">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover/security:bg-purple-600 group-hover/security:text-white transition-colors">
                                <FaShieldAlt size={18} />
                            </div>
                            <h2 className="font-bold text-gray-900 tracking-tight">Seguridad y Acceso</h2>
                        </div>
                    </div>

                    <form onSubmit={updatePassword} className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contraseña Actual</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-purple-500 transition-colors">
                                    <FaLock size={14} />
                                </div>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Contraseña vigente"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-gray-300 font-medium text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-gray-100"></div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Nueva Seguridad</span>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-purple-500 transition-colors">
                                    <FaKey size={14} />
                                </div>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="8+ caracteres"
                                    minLength={8}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-gray-300 font-medium text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirmar Nueva Contraseña</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-purple-500 transition-colors">
                                    <FaKey size={14} />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Repetir nueva contraseña"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-gray-300 font-medium text-gray-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="group relative w-full h-14 bg-gray-900 text-white font-bold text-sm uppercase tracking-widest rounded-2xl overflow-hidden active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-gray-100 mt-4"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black group-hover:opacity-90 transition-opacity"></div>
                            <div className="relative flex items-center justify-center gap-3">
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FaKey className="text-gray-400 group-hover:scale-110 transition-transform" />
                                        <span>Actualizar Seguridad</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>
            </div>

            {/* Custom Animations for Tailwind */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default ProfilePage;
