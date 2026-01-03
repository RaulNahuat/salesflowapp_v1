import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000, // Aumentado a 15 segundos para iPads/conexiones lentas
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para debugging (opcional, pero útil para encontrar el problema del iPad)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default api;
