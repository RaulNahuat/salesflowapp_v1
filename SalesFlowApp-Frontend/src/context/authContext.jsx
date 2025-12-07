import { createContext, useState, useContext, useEffect } from "react";
import { login, logout, register, verifyToken } from "../services/authApi";

const AuthContext = createContext(null);

const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data) return error.response.data; // Fallback for other data structures
    if (error.message) return error.message;
    return "Error desconocido";
};

//Estado inicial: no logueado, sin usuario
const initialState = {
    isLoggedIn: false,
    user: null,
    isLoading: false,
    error: null,
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(initialState);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const data = await verifyToken();
                setAuthState({
                    isLoggedIn: true,
                    user: data,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                // Solo mostramos error en consola si NO es un 401/403 Y estamos en modo desarrollo
                if (import.meta.env.DEV && error.response?.status !== 401 && error.response?.status !== 403) {
                    console.error("Error verificando sesión:", error);
                }

                // Si falla, nos aseguramos de que no esté logueado
                setAuthState({
                    isLoggedIn: false,
                    user: null,
                    isLoading: false,
                    error: getErrorMessage(error)
                });
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    const signIn = async (correo, password) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const data = await login(correo, password);

            setAuthState({
                isLoggedIn: true,
                user: data,
                isLoading: false,
                error: null
            });
            return data;
        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: getErrorMessage(error)
            }));
            throw error;
        }
    };

    const registerUser = async (nombre, correo, password) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const data = await register(nombre, correo, password);

            setAuthState({
                isLoggedIn: true,
                user: data,
                isLoading: false,
                error: null
            });
            return data;
        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: getErrorMessage(error)
            }));
            throw error;
        }
    };

    const signOut = async () => {
        await logout();
        setAuthState({ isLoggedIn: false, user: null, isLoading: false, error: null });
    };

    const value = {
        ...authState,
        checkingSession, // Exponer estado de carga inicial
        signIn,
        signOut,
        register: registerUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}