import axios from "axios";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

console.log("🌐 API URL COBRADOR:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cobrador_token");
  const tenantId = localStorage.getItem("tenantId");

  console.log("🚀 Request:", config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
  console.log("📦 Payload:", config.data);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      localStorage.removeItem("cobrador_token");
      localStorage.removeItem("cobrador_user");
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  cobradorLogin: (email, password) =>
    api.post("/auth/cobrador/login", { email, password }),
};

export const clientesAPI = {
  getAll: () => api.get("/clientes"),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post("/clientes", data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

export const prestamosAPI = {
  getAll: () => api.get("/prestamos"),
  getById: (id) => api.get(`/prestamos/${id}`),
  getByCliente: (clienteId) => api.get(`/prestamos/cliente/${clienteId}`),
  create: (data) => api.post("/prestamos", data),
  update: (id, data) => api.put(`/prestamos/${id}`, data),
  delete: (id) => api.delete(`/prestamos/${id}`),
};

export const pagosAPI = {
  registrar: (data) => api.post("/pagos", data),
  getAll: () => api.get("/pagos"),
  getByPrestamo: (prestamoId) => api.get(`/pagos/prestamo/${prestamoId}`),
};

export default api;