import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const businessApi = {
    getBusiness: async () => {
        try {
            const response = await axios.get(`${API_URL}/business`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    },

    updateBusiness: async (data) => {
        try {
            const response = await axios.put(`${API_URL}/business`, data, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    }
};

export default businessApi;
