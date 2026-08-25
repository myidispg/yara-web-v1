import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Attach JWT token to every request (only on the client side)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh and 401 redirects (only on the client side)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (
      typeof window !== "undefined" &&
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/login/") &&
      !original.url.includes("/auth/refresh/")
    ) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh/`,
            { refresh }
          );
          localStorage.setItem("access", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

// API methods wrapper
const apiClient = {
  // User profile
  getProfile: () => api.get("/auth/me/"),
  updateProfile: (data) => api.patch("/auth/me/", data),

  // Addresses
  getAddresses: () => api.get("/addresses/"),
  createAddress: (data) => api.post("/addresses/", data),
  updateAddress: (id, data) => api.patch(`/addresses/${id}/`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}/`),
  setDefaultAddress: (id) => api.post(`/addresses/${id}/set_default/`),

  // Orders
  getOrders: () => api.get("/orders/"),
  getOrder: (id) => api.get(`/orders/${id}/`),

  // Add your other API methods here
};

export default apiClient;