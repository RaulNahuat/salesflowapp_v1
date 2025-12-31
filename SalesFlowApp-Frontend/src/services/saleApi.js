import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const saleApi = {
    createSale: async (saleData) => {
        try {
            const response = await axios.post(`${API_URL}/sales`, saleData, {
                withCredentials: true
            });
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
            const response = await axios.get(`${API_URL}/sales`, {
                params,
                withCredentials: true
            });
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
            const response = await axios.post(`${API_URL}/sales/receipt-token`, data, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error generando link' };
        }
    },

    getReceiptData: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/sales/receipt-data/${token}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error recuperando recibo' };
        }
    },

    getReceiptHistory: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_URL}/sales/receipt-history`, {
                params: filters,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error obteniendo historial de recibos' };
        }
    },

    getReports: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/sales/reports`, {
                params,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error obteniendo reportes' };
        }
    }
};

export default saleApi;
