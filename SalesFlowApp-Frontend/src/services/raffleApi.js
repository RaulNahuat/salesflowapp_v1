import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const raffleApi = {
    // Get all raffles
    getRaffles: async () => {
        const response = await axios.get(`${API_URL}/raffles`, {
            withCredentials: true
        });
        return response.data;
    },

    // Get single raffle with tickets
    getRaffle: async (id) => {
        const response = await axios.get(`${API_URL}/raffles/${id}`, {
            withCredentials: true
        });
        return response.data;
    },

    // Create raffle
    createRaffle: async (raffleData) => {
        const response = await axios.post(`${API_URL}/raffles`, raffleData, {
            withCredentials: true
        });
        return response.data;
    },

    // Update raffle
    updateRaffle: async (id, raffleData) => {
        const response = await axios.put(`${API_URL}/raffles/${id}`, raffleData, {
            withCredentials: true
        });
        return response.data;
    },

    // Delete raffle
    deleteRaffle: async (id) => {
        const response = await axios.delete(`${API_URL}/raffles/${id}`, {
            withCredentials: true
        });
        return response.data;
    },

    // Draw winner
    drawWinner: async (id, options = {}) => {
        const response = await axios.post(`${API_URL}/raffles/${id}/draw`, options, {
            withCredentials: true
        });
        return response.data;
    },

    // Get tickets for a client
    getClientTickets: async (clientId) => {
        const response = await axios.get(`${API_URL}/raffles/client/${clientId}`, {
            withCredentials: true
        });
        return response.data;
    },

    getEligibleSales: async (raffleId, filters) => {
        const response = await axios.get(`${API_URL}/raffles/${raffleId}/eligible-sales`, {
            params: filters,
            withCredentials: true
        });
        return response.data;
    },

    generateBatchTickets: async (raffleId, filters) => {
        const response = await axios.post(`${API_URL}/raffles/${raffleId}/generate-batch`, filters, {
            withCredentials: true
        });
        return response.data;
    }
};

export default raffleApi;
