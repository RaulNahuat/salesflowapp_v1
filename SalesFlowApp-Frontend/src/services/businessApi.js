import api from './api';

const businessApi = {
    getBusiness: async () => {
        try {
            const response = await api.get('/business');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    },

    updateBusiness: async (data) => {
        try {
            const response = await api.put('/business', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al conectar con el servidor' };
        }
    }
};

export default businessApi;
