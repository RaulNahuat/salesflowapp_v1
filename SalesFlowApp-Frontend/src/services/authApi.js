import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

// 🔒 SECURITY: Configuración de API con timeout
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000 // 10 segundos
});


export const register = async (firstName, lastName, email, phone, password, businessName) => {
    try {
        const response = await api.post("/register", { firstName, lastName, email, phone, password, businessName });
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
        const response = await api.post("/login", { email, password });
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
        await api.post('logout');
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
        const response = await api.get('/verify');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
