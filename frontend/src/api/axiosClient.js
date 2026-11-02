import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach Authorization header if token exists in localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const publicAuthEndpoint = ['/auth/login', '/auth/invitations/accept'].includes(config.url);
    if (token && !publicAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response body and normalize error messages
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network or server error occurred';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('frameflow-auth');
      localStorage.removeItem('frameflow-user');
      localStorage.removeItem('frameflow-permissions');
      localStorage.removeItem('frameflow-roles');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('frameflow-auth');
      sessionStorage.removeItem('frameflow-user');
      sessionStorage.removeItem('frameflow-permissions');
      sessionStorage.removeItem('frameflow-roles');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    error.message = message;
    return Promise.reject(error);
  }
);

export default axiosClient;
