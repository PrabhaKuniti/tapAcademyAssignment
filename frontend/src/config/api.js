// API Configuration
// In production, this will use the Render backend URL
// In development, it will use the proxy or localhost
import axios from 'axios';

const getApiBaseUrl = () => {
  // Check if we're in production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    // Use the environment variable if set, otherwise fallback
    return process.env.REACT_APP_API_URL || 'https://your-backend.onrender.com';
  }
  
  // Development: use proxy or localhost
  return process.env.REACT_APP_API_URL || '';
};

export const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

