import axios from "axios";

const BASE =
  (import.meta.env.VITE_BASE_URL || "http://localhost:5000") + "/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 15000000, 
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // ✅ pastikan tidak kirim cookie yang bisa trigger redirect
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
    // ✅ FIX: hanya redirect jika bukan halaman print dan bukan network error
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
  timeout: 15000000,
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
