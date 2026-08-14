import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem("access")) {
        try {
          const { data } = await api.get("/auth/me/");
          setUser(data);
        } catch { /* token invalid — interceptor handles redirect */ }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post("/auth/login/", { login: identifier, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await api.get("/auth/me/");
    setUser(me.data);
  };

  const register = async (payload) => {
    await api.post("/auth/register/", payload);
    await login(payload.email, payload.password);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);