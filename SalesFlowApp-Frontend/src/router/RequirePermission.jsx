import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const RequirePermission = ({ permission, children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-4">Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Owner has access to everything
    if (user.role === 'owner') {
        return children;
    }

    // Check specific permission
    // Note: permission can be null if route is open to all auth users (like dashboard)
    if (permission && (!user.permissions || !user.permissions[permission])) {
        // Redirect to dashboard if unauthorized
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RequirePermission;
