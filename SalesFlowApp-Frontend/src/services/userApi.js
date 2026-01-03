import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/users`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

const userApi = {
    getProfile: async () => {
        try {
            const res = await api.get("/me");
            // New standard: { success: true, user: {...} }
            return res.data.user || res.data;
        } catch (error) {
            console.error("Error in getProfile:", error);
            throw error;
        }
    },
    updateProfile: async (data) => {
        try {
            const res = await api.put("/update", data);
            // New standard: { success: true, user: {...}, message: "..." }
            return res.data.user || res.data;
        } catch (error) {
            console.error("Error in updateProfile:", error);
            throw error;
        }
    },
    updatePassword: async (data) => {
        try {
            const res = await api.put("/update-password", data);
            return res.data;
        } catch (error) {
            console.error("Error in updatePassword:", error);
            throw error;
        }
    },
    deleteAccount: async (password) => {
        try {
            const res = await api.delete("/delete-account", { data: { password } });
            return res.data;
        } catch (error) {
            console.error("Error in deleteAccount:", error);
            throw error;
        }
    }
};

export default userApi;
