import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('📡 API URL Configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cobrador_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Petición:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const esLogin =
      url.includes('/auth/cobrador/login') ||
      url.includes('/auth/cobrador/login-cedula');

    if (error.response) {
      console.error('❌ Error respuesta:', error.response.status, error.response.data);

      if (error.response.status === 401 && !esLogin) {
        localStorage.removeItem('cobrador_token');
        localStorage.removeItem('cobrador_user');
        window.location.href = '/';
      }
    } else if (error.request) {
      console.error('❌ Sin respuesta del servidor');
    } else {
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============ SERVICIOS DE AUTENTICACIÓN ============
export const authAPI = {
  login: (usuario, password) =>
    api.post('/auth/cobrador/login', { email: usuario.trim(), password: password.trim() }),

  loginWithCedula: (cedula, password) =>
    api.post('/auth/cobrador/login-cedula', { cedula: cedula.trim(), password: password.trim() }),

  logout: () => api.post('/auth/logout'),

  verifyToken: () => api.get('/auth/verify')
};

// ============ SERVICIOS PARA COBRADOR ============
export const cobradorAPI = {
  getPerfil: () => api.get('/cobrador/perfil'),
  getEstadisticas: () => api.get('/cobrador/estadisticas'),
  getDashboard: () => api.get('/cobrador/dashboard')
};

// ============ SERVICIOS PARA CLIENTES ============
export const clientesAPI = {
  getAll: () => api.get('/cobrador/clientes'),
  getById: (id) => api.get(`/cobrador/clientes/${id}`),
  create: (data) => api.post('/cobrador/clientes', data),
  update: (id, data) => api.put(`/cobrador/clientes/${id}`, data),
  delete: (id) => api.delete(`/cobrador/clientes/${id}`),
  buscar: (termino) => api.get(`/cobrador/clientes/buscar?q=${termino}`),
  getHistorial: (id) => api.get(`/cobrador/clientes/${id}/historial`)
};

// ============ SERVICIOS PARA PRÉSTAMOS ============
export const prestamosAPI = {
  getAll: () => api.get('/cobrador/prestamos'),
  getById: (id) => api.get(`/cobrador/prestamos/${id}`),
  create: (data) => api.post('/cobrador/prestamos', data),
  update: (id, data) => api.put(`/cobrador/prestamos/${id}`, data),
  delete: (id) => api.delete(`/cobrador/prestamos/${id}`),
  getByCliente: (clienteId) => api.get(`/cobrador/clientes/${clienteId}/prestamos`),
  getActivos: () => api.get('/cobrador/prestamos/activos'),
  getVencidos: () => api.get('/cobrador/prestamos/vencidos'),
  getCuotas: (prestamoId) => api.get(`/cobrador/prestamos/${prestamoId}/cuotas`)
};

// ============ SERVICIOS PARA PAGOS ============
export const pagosAPI = {
  registrar: (data) => api.post('/cobrador/pagos', data),
  getByPrestamo: (prestamoId) => api.get(`/cobrador/prestamos/${prestamoId}/pagos`),
  getAll: (params) => api.get('/cobrador/pagos', { params }),
  getDelDia: () => api.get('/cobrador/pagos/hoy'),
  anular: (id) => api.put(`/cobrador/pagos/${id}/anular`)
};

// ============ SERVICIOS PARA REPORTES ============
export const reportesAPI = {
  getDiario: (fecha) => api.get(`/cobrador/reportes/diario?fecha=${fecha}`),
  getMensual: (mes, año) => api.get(`/cobrador/reportes/mensual?mes=${mes}&año=${año}`),
  getCartera: () => api.get('/cobrador/reportes/cartera')
};

export default api;