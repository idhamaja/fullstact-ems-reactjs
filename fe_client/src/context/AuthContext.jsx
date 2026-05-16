import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    if (window.location.pathname.startsWith("/print")) return;
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (window.location.pathname.startsWith("/print")) {
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    // ✅ Decode token dulu untuk cek expiry sebelum hit API
    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        clearSession();
        setLoading(false);
        return;
      }

      // ✅ Token masih valid, restore user dari payload tanpa hit API
      setUser({
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
      });
      setToken(storedToken);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email, password, role_type) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        role_type,
      });

      if (!data?.token || !data?.user) {
        throw new Error("Response login tidak valid dari server");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login gagal, coba lagi";
      throw new Error(message);
    }
  };

  // ✅ Hapus api.post("/auth/logout") karena endpoint tidak ada di backend
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = { user, token, loading, login, logout, refreshSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
