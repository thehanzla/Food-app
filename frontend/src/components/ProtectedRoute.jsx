
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Debugging logs to help identify why access is allowed/denied
  if (!user) {
    console.log(`[ProtectedRoute] Access denied to ${location.pathname}: No user logged in.`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const userRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      console.log(`[ProtectedRoute] Access denied to ${location.pathname}: Role '${userRole}' is not allowed. Required: ${normalizedAllowedRoles.join(', ')}`);
      return <Navigate to="/" replace />;
    }
  }

  // If we get here, the user is authorized
  return <Outlet />;
};

export default ProtectedRoute;
