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
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      clearSession();
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/session");
      if (data?.user) {
        setUser(data.user);
        setToken(storedToken);
      } else {
        clearSession();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearSession();
      }
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
        role_type, // ⬅️ kirim apa adanya (lowercase), sesuai ekspektasi backend
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

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = { user, token, loading, login, logout, refreshSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
