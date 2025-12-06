import { createContext, useState, useContext, useEffect } from "react";
import { login, logout, register, verifyToken } from "../services/authApi";

const AuthContext = createContext(null);

//Estado inicial: no logueado, sin usuario
const initialState = {
    isLoggedIn: false,
    user: null,
    isLoading: false,
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
                });
            } catch (error) {
                console.error("Error verificando sesión:", error); // Debugging
                // Si falla, nos aseguramos de que no esté logueado
                setAuthState({ isLoggedIn: false, user: null, isLoading: false });
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
            });
            return data;
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false, error: 'Credenciales inválidas.' }));
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
            });
            return data;
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || 'Error al registrar.' }));
            throw error;
        }
    };

    const signOut = async () => {
        await logout();
        setAuthState({ isLoggedIn: false, user: null, isLoading: false });
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