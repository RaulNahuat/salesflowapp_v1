import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/clients`;

// 🔒 SECURITY: Configuración de API con timeout
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000 // 10 segundos
});

export const getClients = async () => {
    try {
        const response = await api.get("/");
        // Return .clients if present (new standard), otherwise the whole response (legacy)
        return response.data.clients || response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al obtener clientes';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        errorObj.data = error.response?.data;
        throw errorObj;
    }
};

export const getClient = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        // Return .client if present (new standard), otherwise the whole response (legacy)
        return response.data.client || response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al obtener el cliente';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        errorObj.data = error.response?.data;
        throw errorObj;
    }
};

export const createClient = async (clientData) => {
    try {
        const response = await api.post("/", clientData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al crear el cliente';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        errorObj.data = error.response?.data;
        throw errorObj;
    }
};

export const updateClient = async (id, clientData) => {
    try {
        const response = await api.put(`/${id}`, clientData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el cliente';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        errorObj.data = error.response?.data;
        throw errorObj;
    }
};

export const deleteClient = async (id) => {
    try {
        const response = await api.delete(`/${id}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar el cliente';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        errorObj.data = error.response?.data;
        throw errorObj;
    }
};

const clientApi = {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient
};

export default clientApi;
