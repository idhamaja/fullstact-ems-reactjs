import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

// ✅ Pastikan tidak ada trailing slash di base URL
const cleanBase = baseURL.replace(/\/+$/, "");
const BASE = `${cleanBase}/api`;

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    // ✅ Debug - hapus setelah fix
    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.baseURL + config.url,
    );

    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.startsWith("/print")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const printApi = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
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
