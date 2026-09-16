import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCrmStore } from '../../store/useCrmStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useCrmStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
