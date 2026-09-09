import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // Send httpOnly cookies with every request
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (
      typeof window !== "undefined" &&
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/login/") &&
      !original.url.includes("/auth/refresh/") &&
      !original.url.includes("/auth/logout/")
    ) {
      original._retry = true;

      try {
        // Try to refresh the token
        await axios.post(
          `${api.defaults.baseURL}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        // Retry the original request
        return api(original);
      } catch {
        // Refresh failed, redirect to auth page
        if (window.location.pathname !== "/auth") {
          const next = window.location.pathname !== "/" ? window.location.pathname : "";
          window.location.href = next ? `/auth?next=${encodeURIComponent(next)}` : "/auth";
        }
      }
    }

    return Promise.reject(err);
  }
);

// ── Named convenience methods ──
// User profile
api.getProfile = () => api.get("/auth/me/");
api.updateProfile = (data) => api.patch("/auth/me/", data);

// Auth
api.logout = () => api.post("/auth/logout/");

// Addresses
api.getAddresses = () => api.get("/addresses/");
api.createAddress = (data) => api.post("/addresses/", data);
api.updateAddress = (id, data) => api.patch(`/addresses/${id}/`, data);
api.deleteAddress = (id) => api.delete(`/addresses/${id}/`);
api.setDefaultAddress = (id) => api.post(`/addresses/${id}/set_default/`);

// Orders
api.getOrders = () => api.get("/orders/");
api.getOrder = (id) => api.get(`/orders/${id}/`);

// Invoices
api.getInvoice = (orderId) => api.get(`/orders/${orderId}/invoice/`);
api.downloadInvoice = (orderId) => api.get(`/orders/${orderId}/invoice/pdf/`, { responseType: 'blob' });

export default api;