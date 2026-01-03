import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = 'https://food-2tsasxcaf-thehanzlas-projects.vercel.app/api';


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

export const authServices = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  }
};