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
  const [token, setToken] = useState(() => localStorage.getItem("token")); // ⬅️ lazy init
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
      // ⬅️ validasi response sebelum set user
      if (data?.user) {
        setUser(data.user);
        setToken(storedToken);
      } else {
        clearSession();
      }
    } catch (error) {
      // ⬅️ hanya clear jika 401, bukan network error biasa
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
        role_type,
      });

      // ⬅️ validasi response dari server
      if (!data?.token || !data?.user) {
        throw new Error("Response login tidak valid dari server");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      // ⬅️ lempar pesan yang jelas ke LoginForm
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
      // ⬅️ opsional: beritahu server untuk invalidate token
      await api.post("/auth/logout").catch(() => {}); // silent fail
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
