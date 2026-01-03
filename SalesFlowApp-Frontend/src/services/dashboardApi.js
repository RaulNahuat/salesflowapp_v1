import api from './api';

const DASHBOARD_URL = '/dashboard';

export const getStats = async () => {
    try {
        const response = await api.get(`${DASHBOARD_URL}/stats`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const dashboardApi = {
    getStats
};

export default dashboardApi;
