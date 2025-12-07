import axios from 'axios';

// Create Axios instance with backend URL
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL, // Local development fallback
  withCredentials: true, // optional, mainly for cookies if used in future
});

// ===========================
// Request Interceptor
// ===========================
api.interceptors.request.use(
  (config) => {
    console.log('API Request Interceptor - Full URL:', config.baseURL + config.url);
    // Check for token in localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request Interceptor - Added Authorization header');
    } else {
      console.warn('API Request Interceptor - No token found in storage');
    }
    return config;
  },
  (error) => {
    console.error('API Request Interceptor - Error', error);
    return Promise.reject(error);
  }
);

// ===========================
// Response Interceptor
// ===========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.error(
        'API Response Interceptor - Status:',
        error.response.status,
        'Data:',
        error.response.data
      );
    } else if (error.request) {
      console.error('API Response Interceptor - No response received', error.request);
    } else {
      console.error('API Response Interceptor - Error', error.message);
    }

    return Promise.reject(error);
  }
);

// ===========================
// Get current user from storage
// ===========================
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (err) {
    console.error('Error parsing user data:', err);
    return null;
  }
};

// ===========================
// Check authentication
// ===========================
export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};

// ===========================
// Clear auth (logout)
// ===========================
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

// ===========================
// Export Axios instance
// ===========================
export default api;
