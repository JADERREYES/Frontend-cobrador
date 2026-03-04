
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cobrador_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('cobrador_token');
    localStorage.removeItem('cobrador_user');
    window.location.href = '/';
  }
  return Promise.reject(err);
});
export const authAPI = {
  login: (usuario, password) => api.post('/auth/cobrador/login', { usuario, password }),
};
export const clientesAPI = {
  getAll: (search) => api.get('/clientes', { params: { search } }),
  getById: (id) => api.get('/clientes/' + id),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put('/clientes/' + id, data),
};
export const prestamosAPI = {
  getAll: () => api.get('/prestamos'),
  getByCliente: (clienteId) => api.get('/prestamos/cliente/' + clienteId),
  create: (data) => api.post('/prestamos', data),
};
export const pagosAPI = {
  getByPrestamo: (prestamoId) => api.get('/pagos/prestamo/' + prestamoId),
  create: (data) => api.post('/pagos', data),
};
export default api;
