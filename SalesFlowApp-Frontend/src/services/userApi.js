import api from './api';

const USERS_URL = '/users';

const userApi = {
    getProfile: async () => {
        try {
            const res = await api.get(`${USERS_URL}/me`);
            // New standard: { success: true, user: {...} }
            return res.data.user || res.data;
        } catch (error) {
            console.error("Error in getProfile:", error);
            throw error;
        }
    },
    updateProfile: async (data) => {
        try {
            const res = await api.put(`${USERS_URL}/update`, data);
            // New standard: { success: true, user: {...}, message: "..." }
            return res.data.user || res.data;
        } catch (error) {
            console.error("Error in updateProfile:", error);
            throw error;
        }
    },
    updatePassword: async (data) => {
        try {
            const res = await api.put(`${USERS_URL}/update-password`, data);
            return res.data;
        } catch (error) {
            console.error("Error in updatePassword:", error);
            throw error;
        }
    },
    deleteAccount: async (password) => {
        try {
            const res = await api.delete(`${USERS_URL}/delete-account`, { data: { password } });
            return res.data;
        } catch (error) {
            console.error("Error in deleteAccount:", error);
            throw error;
        }
    }
};

export default userApi;
