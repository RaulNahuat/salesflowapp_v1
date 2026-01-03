import api from './api';

const saleApi = {
    createSale: async (saleData) => {
        try {
            const response = await api.post('/sales', saleData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error procesando la venta';
            const errorObj = new Error(errorMessage);
            errorObj.status = error.response?.status;
            errorObj.data = error.response?.data;
            throw errorObj;
        }
    },

    getSales: async (params = {}) => {
        try {
            const response = await api.get('/sales', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error obteniendo historial de ventas';
            const errorObj = new Error(errorMessage);
            errorObj.status = error.response?.status;
            throw errorObj;
        }
    },

    generateReceiptToken: async (data) => {
        try {
            const response = await api.post('/sales/receipt-token', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error generando link' };
        }
    },

    getReceiptData: async (token) => {
        try {
            // Recibo es público, pero usamos la instancia central por el baseURL
            const response = await api.get(`/sales/receipt-data/${token}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error recuperando recibo' };
        }
    },

    getReceiptHistory: async (filters = {}) => {
        try {
            const response = await api.get('/sales/receipt-history', { params: filters });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error obteniendo historial de recibos' };
        }
    },

    getReports: async (params = {}) => {
        try {
            const response = await api.get('/sales/reports', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error obteniendo reportes' };
        }
    }
};

export default saleApi;
