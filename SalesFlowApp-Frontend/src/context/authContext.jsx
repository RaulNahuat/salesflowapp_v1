import { createContext, useState, useContext, useEffect } from "react";
import { login as authServiceLogin, logout as authServiceLogout, register as authServiceRegister, verifyToken } from "../services/authApi";

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

                if (data.user) {
                    setAuthState({
                        isLoggedIn: true,
                        user: data.user,
                        isLoading: false,
                        error: null
                    });
                } else {
                    // No hay sesión activa (respuesta silenciosa)
                    setAuthState({
                        isLoggedIn: false,
                        user: null,
                        isLoading: false,
                        error: null
                    });
                }
            } catch (error) {
                // Solo loguear errores reales de red o servidor, no de autenticación
                if (error.response?.status === 429) {
                    console.warn("Rate limit exceeded (429). Session verification blocked.");
                    // Optionally show a toast here if you have toast imported
                } else if (error.response?.status !== 401 && error.response?.status !== 403) {
                    console.error("Error verificando sesión:", error);
                }
                setAuthState({
                    isLoggedIn: false,
                    user: null,
                    isLoading: false,
                    error: null
                });
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    const login = async (email, password) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const data = await authServiceLogin(email, password);

            setAuthState({
                isLoggedIn: true,
                user: data.user,
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

    const registerUser = async (userData) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        const { firstName, lastName, email, phone, password, businessName } = userData;

        try {
            const data = await authServiceRegister(firstName, lastName, email, phone, password, businessName);

            setAuthState({
                isLoggedIn: true,
                user: data.user,
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

    const logout = async () => {
        await authServiceLogout();
        setAuthState({ isLoggedIn: false, user: null, isLoading: false, error: null });
    };

    const value = {
        ...authState,
        checkingSession, // Exponer estado de carga inicial
        login,
        logout,
        registerUser,
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