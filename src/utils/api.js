import axios from 'axios';

// Use Render backend
const api = axios.create({
  baseURL: 'http://dpg-d4od3ni4d50c738pv8jg-a.oregon-postgres.render.com/api',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('API Request Interceptor - Token found:', token ? 'Yes' : 'No');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request Interceptor - Added Authorization header');
    } else {
      console.warn('API Request Interceptor - No token found in storage');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(
      'API Response Interceptor - Error:',
      error.response?.status,
      error.response?.data
    );

    return Promise.reject(error);
  }
);

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};

export default api;
