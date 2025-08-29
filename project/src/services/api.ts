import axios from 'axios';

// Use relative URL for API calls (will be proxied by Vite)
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for better Atlas connectivity
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced response interceptor for better JWT handling
api.interceptors.response.use(
  (response) => {
    // Check for new token in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      console.log('Token refreshed automatically');
    }
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      const errorData = response.data;
      
      // Clear stored auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      
      // Handle different types of auth errors
      if (errorData?.expired) {
        alert('Your session has expired. Please login again.');
      } else if (errorData?.requiresLogin) {
        console.log('Authentication required');
      }
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    } else if (response?.status === 403) {
      const errorData = response.data;
      if (errorData?.requiresAdmin) {
        alert('Admin access required for this action.');
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;