import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import LoginForm from '../componentes/auth/LoginForm';
import RegisterForm from '../componentes/auth/RegisterForm';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import RequirePermission from './RequirePermission'; // Import new component
import MainLayout from '../layout/MainLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import ProductsPage from '../pages/products/ProductsPage';
import ProductFormPage from '../pages/products/ProductFormPage';
import BusinessProfilePage from '../pages/settings/BusinessProfilePage';
import ClientList from '../componentes/clients/ClientList';
import ClientForm from '../componentes/clients/ClientForm';
import WorkerList from '../componentes/workers/WorkerList';
import WorkerForm from '../componentes/workers/WorkerForm';
import POSPage from '../pages/sales/POSPage';

const ProtectedLayout = ({ children }) => {
    return (
        <ProtectedRoute>
            <MainLayout>
                {children}
            </MainLayout>
        </ProtectedRoute>
    );
};

import { Toaster } from 'react-hot-toast';

const AppRouter = () => {
    const { checkingSession } = useAuth();

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff' } }} />
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />

                {/* Rutas Protegidas (con MainLayout) */}
                <Route path="/dashboard" element={
                    <ProtectedLayout>
                        <Dashboard />
                    </ProtectedLayout>
                } />

                {/* POS */}
                <Route path="/pos" element={
                    <ProtectedLayout>
                        <RequirePermission permission="pos">
                            <POSPage />
                        </RequirePermission>
                    </ProtectedLayout>
                } />

                {/* Rutas de Productos */}
                <Route path="/products" element={
                    <ProtectedLayout>
                        <RequirePermission permission="products">
                            <ProductsPage />
                        </RequirePermission>
                    </ProtectedLayout>
                } />
                <Route path="/products/new" element={
                    <ProtectedLayout>
                        <RequirePermission permission="products">
                            <ProductFormPage />
                        </RequirePermission>
                    </ProtectedLayout>
                } />
                <Route path="/products/edit/:id" element={
                    <ProtectedLayout>
                        <RequirePermission permission="products">
                            <ProductFormPage />
                        </RequirePermission>
                    </ProtectedLayout>
                } />

                {/* Configuración del Negocio */}
                <Route path="/business-profile" element={
                    <ProtectedLayout>
                        <RequirePermission permission="settings">
                            <BusinessProfilePage />
                        </RequirePermission>
                    </ProtectedLayout>
                } />

                {/* Rutas de Clientes */}
                <Route path="/clients" element={
                    <ProtectedLayout>
                        <RequirePermission permission="clients">
                            <ClientList />
                        </RequirePermission>
                    </ProtectedLayout>
                } />
                <Route path="/clients/new" element={
                    <ProtectedLayout>
                        <RequirePermission permission="clients">
                            <ClientForm />
                        </RequirePermission>
                    </ProtectedLayout>
                } />
                <Route path="/clients/edit/:id" element={
                    <ProtectedLayout>
                        <RequirePermission permission="clients">
                            <ClientForm />
                        </RequirePermission>
                    </ProtectedLayout>
                } />

                {/* Rutas de Equipo (Workers) */}
                <Route path="/workers" element={
                    <ProtectedLayout>
                        <RequirePermission permission="settings">
                            <WorkerList />
                        </RequirePermission>
                    </ProtectedLayout>
                } />
                <Route path="/workers/new" element={
                    <ProtectedLayout>
                        <RequirePermission permission="settings">
                            <WorkerForm />
                        </RequirePermission>
                    </ProtectedLayout>
                } />
                <Route path="/workers/edit/:id" element={
                    <ProtectedLayout>
                        <RequirePermission permission="settings">
                            <WorkerForm />
                        </RequirePermission>
                    </ProtectedLayout>
                } />

                {/* Redirecciones por defecto */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </>
    );
};

export default AppRouter;
