import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const isAuthCall = original.url?.includes("/auth/login") || original.url?.includes("/auth/register");
    if (error.response?.status === 401 && !original._retry && !isAuthCall && localStorage.getItem("refresh")) {
      original._retry = true;
      try {
        refreshing = refreshing || api.post("/auth/refresh/", { refresh: localStorage.getItem("refresh") });
        const { data } = await refreshing;
        refreshing = null;
        localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        refreshing = null;
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;