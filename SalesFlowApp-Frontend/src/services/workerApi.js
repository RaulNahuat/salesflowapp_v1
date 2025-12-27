import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const workerApi = {
    // Get all workers
    getWorkers: async () => {
        try {
            const response = await axios.get(`${API_URL}/workers`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    },

    // Create a new worker
    createWorker: async (workerData) => {
        try {
            const response = await axios.post(`${API_URL}/workers`, workerData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    },

    // Update worker (permissions/status)
    updateWorker: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/workers/${id}`, data, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    },

    // Delete worker
    deleteWorker: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/workers/${id}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    }
};

export default workerApi;
