import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ 
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token y tenantId
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cobrador_token');
  const tenantId = localStorage.getItem('tenantId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  cobradorLogin: async (email, password) => {
    const response = await api.post('/auth/cobrador/login', { email, password });
    if (response.data && response.data.user && response.data.user.tenantId) {
      localStorage.setItem('tenantId', response.data.user.tenantId);
    }
    return response;
  }
};

// CLIENTES
export const clientesAPI = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`)
};

// PRÉSTAMOS
export const prestamosAPI = {
  getAll: () => api.get('/prestamos'),
  getById: (id) => api.get(`/prestamos/${id}`),
  getByCliente: (clienteId) => api.get(`/prestamos/cliente/${clienteId}`),
  create: (data) => api.post('/prestamos', data),
  update: (id, data) => api.put(`/prestamos/${id}`, data),
  delete: (id) => api.delete(`/prestamos/${id}`)
};

// PAGOS
export const pagosAPI = {
  registrar: (data) => api.post('/pagos', data),
  getAll: () => api.get('/pagos'),
  getByPrestamo: (prestamoId) => api.get(`/pagos/prestamo/${prestamoId}`)
};

export default api;