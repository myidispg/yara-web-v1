import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (
      typeof window !== "undefined" &&
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/refresh/") &&
      !original.url.includes("/auth/login/")
    ) {
      original._retry = true;
      try {
        await api.post("/auth/refresh/");
        return api(original);
      } catch (refreshErr) {
        const publicPaths = ["/auth", "/cpanel", "/control"];
        const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p));
        if (!isPublic) {
          const next = window.location.pathname !== "/" ? window.location.pathname : "";
          window.location.href = next ? `/auth?next=${encodeURIComponent(next)}` : "/auth";
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

api.getProfile = () => api.get("/auth/me/");
api.logout = () => api.post("/auth/logout/");
api.sendOtp = (email) => api.post("/auth/send-otp/", { email });
api.verifyOtp = (payload) => api.post("/auth/verify-otp/", payload);
api.googleAuth = (credential) => api.post("/auth/google/", { credential });

// ... Keep your existing Addresses, Orders, Invoices methods below ...
api.getAddresses = () => api.get("/addresses/");
api.createAddress = (data) => api.post("/addresses/", data);
api.updateAddress = (id, data) => api.patch(`/addresses/${id}/`, data);
api.deleteAddress = (id) => api.delete(`/addresses/${id}/`);
api.setDefaultAddress = (id) => api.post(`/addresses/${id}/set_default/`);
api.getOrders = () => api.get("/orders/");
api.getOrder = (id) => api.get(`/orders/${id}/`);
api.getInvoice = (orderId) => api.get(`/orders/${orderId}/invoice/`);
api.downloadInvoice = (orderId) => api.get(`/orders/${orderId}/invoice/pdf/`, { responseType: 'blob' });

export default api;