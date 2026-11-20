// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '@/api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      // Use the correct API prefix
      const { data } = await axios.get('/api/auth/me');
      setUser(data);
    } catch (e) {
      // On failure, clear any stored token and ensure user is null
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    // Assume the backend returns a token field; store it if present
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data);
    toast.success('Logged in');
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, password });
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data);
    toast.success('Registered');
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
