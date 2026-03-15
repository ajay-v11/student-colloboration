import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Keep the main message
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    // Extract the field-specific errors array
    const fieldErrors = error.response?.data?.errors || [];
    
    // Reject with an object containing both so the UI can parse it
    return Promise.reject({ message, fieldErrors });
  }
);
