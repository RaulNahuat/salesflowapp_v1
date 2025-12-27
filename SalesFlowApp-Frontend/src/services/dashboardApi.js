import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/dashboard`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getStats = async () => {
    try {
        const response = await api.get("/stats");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const dashboardApi = {
    getStats
};

export default dashboardApi;
