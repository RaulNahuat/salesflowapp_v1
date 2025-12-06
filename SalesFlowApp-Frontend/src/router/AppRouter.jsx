import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import LoginForm from '../componentes/auth/LoginForm';
import RegisterForm from '../componentes/auth/RegisterForm';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/Dashboard';

const AppRouter = () => {
    const { checkingSession } = useAuth(); // Usamos checkingSession, NO isLoading

    if (checkingSession) {
        return <div className="flex justify-center items-center h-screen">Verificando sesión...</div>;
    }


    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />

            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;
