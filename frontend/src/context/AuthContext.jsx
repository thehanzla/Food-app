import React, { createContext, useContext, useEffect, useState } from 'react'
import { authServices } from '../services/authServices'
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple check: Only check for stored user data. 
    // The interceptor in api.js handles cookie validation/refresh on first protected request.
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Removed redundant checkAuthStatus function

  const login = async (email, password) => {
    try {
      const response = await authServices.login(email, password);
      console.log('Login response:', response);

      if (response.user) {
        // Cookies are set by the server, we only save UI data here
        localStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || error.message || 'Login failed' };
    }
  };

  const signup = async (email, password, fullName, role) => {
    try {
      const userData = {
        email,
        password,
        fullName,
        role
      };

      console.log('Signup data being sent:', userData);

      // authServices.signup calls the backend, which sets the cookie on successful verification
      const response = await authServices.signup(userData);
      console.log('Signup response:', response);

      // Since signup now involves verification and redirection, this will rarely return user data 
      // directly on the first call, but we keep the logic clean.
      if (response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
      }
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Signup failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authServices.logout(); // Call backend to clear cookies
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('userData'); // Clear UI data
      setUser(null);
      // Force reload to ensure cookie clearance is fully processed by the browser
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};