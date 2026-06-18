import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https:
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
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Server is unreachable', error);
      return Promise.reject({ message: 'Server is unreachable. Please try again later.' });
    }

    const isAuthRequest = error.config?.url?.includes('/identity/login') || error.config?.url?.includes('/identity/register');
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthRequest) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

