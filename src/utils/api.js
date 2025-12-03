import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Try localStorage first, then sessionStorage
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('API Request Interceptor - Token found:', token ? 'Yes' : 'No');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request Interceptor - Added Authorization header');
    } else {
      console.warn('API Request Interceptor - No token found in storage');
    }
    console.log('API Request Interceptor - Final headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('API Response Interceptor - Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('API Response Interceptor - 401 detected, attempting token refresh');
      originalRequest._retry = true;
      
      try {
        const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('API Response Interceptor - Current token for refresh:', currentToken ? 'Present' : 'Missing');
        
        const refreshResponse = await axios.post('http://localhost:5001/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        
        const newToken = refreshResponse.data.token;
        console.log('API Response Interceptor - New token received:', newToken ? 'Yes' : 'No');
        
        // Update both storage types to maintain consistency
        localStorage.setItem('token', newToken);
        sessionStorage.setItem('token', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('API Response Interceptor - Token refresh failed:', refreshError);
        // Token refresh failed, clear both storages and reject
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Utility function to get current user from storage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};

export default api;