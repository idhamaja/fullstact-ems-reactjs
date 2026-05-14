import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_BASE_URL || "http://localhost:5000") + "/api",
  timeout: 10000, // ⬅️ tambah timeout 10 detik
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Auth token to all network requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error) // ⬅️ tambah error handler
);

// ⬅️ Tambah response interceptor untuk handle token expired / unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;