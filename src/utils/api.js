import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const isAdmin = config.url?.includes('/admin') || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
    const token = isAdmin 
      ? (localStorage.getItem('admin_token') || localStorage.getItem('token'))
      : localStorage.getItem('token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        if (window.location.pathname.startsWith('/admin')) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        } else if (window.location.pathname.startsWith('/user')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getPaymentTransactions = async () => {
  const response = await api.get('/v1/admin/payments');
  return response.data;
};

export default api;
