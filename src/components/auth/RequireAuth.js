import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../../services/api';

export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!getAccessToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
