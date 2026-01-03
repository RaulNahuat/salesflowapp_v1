import api from './api';

const AUTH_URL = '/auth';


export const register = async (firstName, lastName, email, phone, password, businessName) => {
    try {
        const response = await api.post(`${AUTH_URL}/register`, { firstName, lastName, email, phone, password, businessName });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Función para iniciar sesión
 * @param {String} correo 
 * @param {String} password 
 * @returns {object}
 */
export const login = async (email, password) => {
    try {
        const response = await api.post(`${AUTH_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Función para cerrar sesión
 * @returns {void}
 */
export const logout = async () => {
    try {
        await api.post(`${AUTH_URL}/logout`);
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};

/**
 * Función para verificar el token al iniciar la app
 * @returns {object}
 */
export const verifyToken = async () => {
    try {
        const response = await api.get(`${AUTH_URL}/verify`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Request password reset instructions
 * @param {string} email 
 */
export const forgotPassword = async (email) => {
    try {
        const response = await api.post(`${AUTH_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Set new password using token
 * @param {string} token 
 * @param {string} password 
 */
export const resetPassword = async (token, password) => {
    try {
        const response = await api.post(`${AUTH_URL}/reset-password/${token}`, { password });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
