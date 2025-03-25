import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      setIsAuthenticated(true);
      // Set axios default header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/signin', { username, password });
      const { token, tokenType, id, username: userName, email, roles } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username: userName, email, roles }));
      
      // Set user in state
      setUser({ id, username: userName, email, roles });
      setIsAuthenticated(true);
      
      // Set axios default header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return response.data;
    } catch (err) {
      setError(err.response?.data || 'An error occurred during login');
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/signup', { 
        username, 
        email, 
        password
        // Don't send roles, let the backend set the default ROLE_USER
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data || 'An error occurred during registration');
      throw err;
    }
  };

  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};