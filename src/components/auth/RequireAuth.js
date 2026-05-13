import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken, getRole } from '../../services/api';

/**
 * Protects routes by requiring a valid access token.
 * Optional: pass role="enabler" or role="pathfinder" to restrict by role;
 * if the user's role doesn't match, they are redirected to their dashboard or login.
 */
export default function RequireAuth({ children, role }) {
  const location = useLocation();
  const access = getAccessToken();

  if (!access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    const currentRole = getRole();
    if (currentRole !== role) {
      // Redirect to the correct dashboard for their role, or login if no role
      if (currentRole === 'enabler') {
        return <Navigate to="/enabler/dashboard" replace />;
      }
      if (currentRole === 'pathfinder') {
        return <Navigate to="/pathf" replace />;
      }
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
}
