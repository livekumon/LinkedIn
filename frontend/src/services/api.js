import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', {
    ...data,
    tenantId: process.env.REACT_APP_TENANT_ID || 'default-tenant'
  }),
  login: (data) => api.post('/auth/login', {
    ...data,
    tenantId: process.env.REACT_APP_TENANT_ID || 'default-tenant'
  }),
  googleLogin: (idToken) => api.post('/auth/google-login', {
    idToken,
    tenantId: process.env.REACT_APP_TENANT_ID || 'default-tenant'
  }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export default api;


