// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // could show a spinner or skeleton
  // Unauthenticated users are sent to the public landing page
  return user ? children : <Navigate to="/landing" replace />;
};

export default ProtectedRoute;
