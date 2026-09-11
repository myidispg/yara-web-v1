"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me/");
        setUser(data);
      } catch {
        // Not authenticated or token expired
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (identifier, password) => {
    await api.post("/auth/login/", { login: identifier, password });

    // Check if we need to redirect to control panel
    const urlParams = new URLSearchParams(window.location.search);
    const next = urlParams.get('next');
    if (next === '/control' || next?.startsWith('/control/')) {
      // Force full page reload to avoid hook conflicts
      window.location.href = next;
    } else {
      // For non-control panel redirects, just reload the page
      // This will trigger the useEffect to fetch /auth/me/ with the new cookie
      window.location.reload();
    }
  };

  const register = async (payload) => {
    await api.post("/auth/register/", payload);
    await login(payload.email, payload.password);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors
    }
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);