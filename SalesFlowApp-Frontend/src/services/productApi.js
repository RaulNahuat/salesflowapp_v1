import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getProducts = async () => {
    try {
        const response = await api.get("/");
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al obtener productos';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        throw errorObj;
    }
};

export const getProduct = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al obtener el producto';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        throw errorObj;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await api.post("/", productData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al crear el producto';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        throw errorObj;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`/${id}`, productData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el producto';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        throw errorObj;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/${id}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar el producto';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        throw errorObj;
    }
};

const productApi = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};

export default productApi;
