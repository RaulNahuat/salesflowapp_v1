import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/clientes`;

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for cookies/auth
});

export const getClientes = async () => {
    const response = await api.get("/");
    return response.data;
};

export const createCliente = async (clienteData) => {
    const response = await api.post("/", clienteData);
    return response.data;
};

export const updateCliente = async (id, clienteData) => {
    const response = await api.put(`/${id}`, clienteData);
    return response.data;
};

export const changeClienteStatus = async (id, accion) => {
    // accion: 'activar' or 'inactivar'
    const response = await api.put(`/${id}/${accion}`);
    return response.data;
};
