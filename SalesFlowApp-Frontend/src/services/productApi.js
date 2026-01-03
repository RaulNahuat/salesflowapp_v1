import api from './api';

const PRODUCT_URL = '/products';

export const getProducts = async () => {
    try {
        const response = await api.get(`${PRODUCT_URL}/`);
        // New standard returns { success, products: [] }, legacy returns []
        return response.data.products || response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al obtener productos';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        errorObj.data = error.response?.data;
        throw errorObj;
    }
};

export const getProduct = async (id) => {
    try {
        const response = await api.get(`${PRODUCT_URL}/${id}`);
        // New standard returns { success, product: {} }, legacy returns {}
        return response.data.product || response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al obtener el producto';
        const errorObj = new Error(errorMessage);
        errorObj.status = error.response?.status;
        errorObj.data = error.response?.data;
        throw errorObj;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await api.post(`${PRODUCT_URL}/`, productData);
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
        const response = await api.put(`${PRODUCT_URL}/${id}`, productData);
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
        const response = await api.delete(`${PRODUCT_URL}/${id}`);
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
