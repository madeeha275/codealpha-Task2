import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/landing'} replace />;
};

export default HomeRedirect;