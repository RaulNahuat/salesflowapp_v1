import api from './api';

const CLIENT_URL = '/clients';

export const getClients = async () => {
    try {
        const response = await api.get(`${CLIENT_URL}/`);
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
        const response = await api.get(`${CLIENT_URL}/${id}`);
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
        const response = await api.post(`${CLIENT_URL}/`, clientData);
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
        const response = await api.put(`${CLIENT_URL}/${id}`, clientData);
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
        const response = await api.delete(`${CLIENT_URL}/${id}`);
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
