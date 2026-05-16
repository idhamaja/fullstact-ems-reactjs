import axios from "axios";

const BASE =
  (import.meta.env.VITE_BASE_URL || "http://localhost:5000") + "/api";

// Instance utama — dengan redirect interceptor
const api = axios.create({
  baseURL: BASE,
  timeout: 10000000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ✅ Instance khusus print — TANPA redirect interceptor
export const printApi = axios.create({
  baseURL: BASE,
  timeout: 10000000,
  headers: { "Content-Type": "application/json" },
});

printApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
