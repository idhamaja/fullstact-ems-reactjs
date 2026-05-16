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
    // ✅ Jangan clear session jika sedang di halaman print
    if (window.location.pathname.startsWith("/print")) return;
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    // ✅ Skip refresh di halaman print
    if (window.location.pathname.startsWith("/print")) {
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem("token");

    // ✅ Tidak ada token → belum login, tidak perlu fetch
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/session");
      if (data?.user) {
        setUser(data.user);
        setToken(storedToken);
      } else {
        // ✅ Response tidak valid tapi bukan error jaringan
        // → token mungkin expired, baru clear session
        clearSession();
      }
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        // ✅ Token benar-benar invalid/expired → logout
        clearSession();
      } else {
        // ✅ Error jaringan / server down / timeout
        // → JANGAN logout, restore user dari token yang tersimpan
        // decode token manual untuk restore state
        try {
          const payload = JSON.parse(atob(storedToken.split(".")[1]));
          const isExpired = payload.exp * 1000 < Date.now();

          if (isExpired) {
            // Token sudah expired → logout
            clearSession();
          } else {
            // Token masih valid, restore user dari payload
            setUser({
              userId: payload.userId,
              role: payload.role,
              email: payload.email,
            });
            setToken(storedToken);
          }
        } catch {
          // Token corrupt → logout
          clearSession();
        }
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
