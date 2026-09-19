import axios from "axios";

const cpanelAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

cpanelAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (
      typeof window !== "undefined" &&
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/cpanel-refresh/") &&
      !original.url.includes("/auth/login/")
    ) {
      original._retry = true;
      try {
        await cpanelAxios.post("/auth/cpanel-refresh/");
        return cpanelAxios(original);
      } catch (refreshErr) {
        if (window.location.pathname !== "/cpanel/login") {
          window.location.href = "/cpanel/login";
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

const controlApi = {
  _login: (payload) => cpanelAxios.post("/auth/login/", payload),
  _logout: () => cpanelAxios.post("/auth/cpanel-logout/"),
  getStaffProfile: () => cpanelAxios.get("/cpanel/me/"),
  getDashboard: () => cpanelAxios.get("/cpanel/dashboard/"),
  getOrders: () => cpanelAxios.get("/cpanel/orders/"),
  getOrder: (id) => cpanelAxios.get(`/cpanel/orders/${id}/`),
  updateOrderStatus: (id, status) => cpanelAxios.post(`/cpanel/orders/${id}/update_status/`, { status }),
  mapProductToOrder: (orderId, itemId, productId) => cpanelAxios.post(`/cpanel/orders/${orderId}/map_product/${itemId}/`, { product_id: productId }),
  cancelOrder: (id) => cpanelAxios.post(`/cpanel/orders/${id}/cancel/`),
  getProducts: (offset = 0, limit = 24) => cpanelAxios.get(`/cpanel/products/?offset=${offset}&limit=${limit}`),
  getProductsSummary: () => cpanelAxios.get("/cpanel/products/summary/"),
  getProduct: (id) => cpanelAxios.get(`/cpanel/products/${id}/`),
  createDesign: (data) => cpanelAxios.post("/cpanel/products/", data),
  addInstance: (designId, data) => cpanelAxios.post(`/cpanel/products/${designId}/add_instance/`, data),
  uploadMedia: (designId, file) => { const fd = new FormData(); fd.append("file", file); return cpanelAxios.post(`/cpanel/products/${designId}/upload_media/`, fd, { headers: { "Content-Type": "multipart/form-data" } }); },
  deleteDesign: (designId) => cpanelAxios.delete(`/cpanel/products/${designId}/delete_design/`),
  deleteProduct: (productId) => cpanelAxios.delete(`/cpanel/instances/${productId}/delete_product/`),
  bulkDesignAction: (ids, action, cascade = false) => cpanelAxios.post("/cpanel/products/bulk-action/", { ids, action, cascade }),
  updateDesign: (id, data) => cpanelAxios.patch(`/cpanel/products/${id}/`, data),
  deleteMedia: (designId, mediaId) => cpanelAxios.delete(`/cpanel/products/${designId}/media/${mediaId}/`),
  reorderDesignMedia: (designId, mediaIds) => cpanelAxios.post(`/cpanel/products/${designId}/reorder-media/`, { media_ids: mediaIds }),
  getInstances: (params = {}) => cpanelAxios.get("/cpanel/instances/", { params }),
  markSoldOffline: (instanceId) => cpanelAxios.post(`/cpanel/instances/${instanceId}/mark_sold_offline/`),
  returnToStock: (instanceId) => cpanelAxios.post(`/cpanel/instances/${instanceId}/return_to_stock/`),
  getProductDetail: (id) => cpanelAxios.get(`/cpanel/instances/${id}/`),
  updateProduct: (id, data) => cpanelAxios.patch(`/cpanel/instances/${id}/`, data),
  globalSearch: (q) => cpanelAxios.get("/cpanel/global-search/", { params: { q } }),
  previewPrice: (data) => cpanelAxios.post("/cpanel/price-preview/", data),
  calculatePrice: (data) => cpanelAxios.post("/cpanel/calculate-price/", data),
  getProductsFlat: () => cpanelAxios.get("/cpanel/instances/flat/"),
  bulkProductAction: (ids, action) => cpanelAxios.post("/cpanel/instances/bulk-action/", { ids, action }),
  exportSelectedProducts: (ids) => cpanelAxios.get(`/cpanel/products/export-products/?ids=${ids.join(",")}`, { responseType: "blob" }),
  getRateCard: () => cpanelAxios.get("/cpanel/rate-card/"),
  updateRateCard: (data) => cpanelAxios.put("/cpanel/rate-card/", data),
  getRateHistory: () => cpanelAxios.get("/cpanel/rate-history/"),
  getNotifications: () => cpanelAxios.get("/cpanel/notifications/"),
  markNotificationRead: (id) => cpanelAxios.post(`/cpanel/notifications/${id}/read/`),
  markAllNotificationsRead: () => cpanelAxios.post("/cpanel/notifications/mark-all-read/"),
  fetchRatesNow: () => cpanelAxios.post("/cpanel/rate-card/fetch-now/"),
  getCategories: () => cpanelAxios.get("/cpanel/categories/"),
  createCategory: (data) => cpanelAxios.post("/cpanel/categories/", data),
  updateCategory: (id, data) => cpanelAxios.patch(`/cpanel/categories/${id}/`, data),
  deleteCategory: (id) => cpanelAxios.delete(`/cpanel/categories/${id}/`),
  getTags: () => cpanelAxios.get("/cpanel/tags/"),
  createTag: (data) => cpanelAxios.post("/cpanel/tags/", data),
  updateTag: (id, data) => cpanelAxios.patch(`/cpanel/tags/${id}/`, data),
  deleteTag: (id) => cpanelAxios.delete(`/cpanel/tags/${id}/`),
  deactivateUser: (id) => cpanelAxios.post(`/cpanel/customers/${id}/deactivate_user/`),
  activateUser: (id) => cpanelAxios.post(`/cpanel/customers/${id}/activate_user/`),
  getCustomers: (includeStaff = false) => cpanelAxios.get("/cpanel/customers/", { params: includeStaff ? { include_staff: 'true' } : {} }),
  getCustomerFull: (id) => cpanelAxios.get(`/cpanel/customers/${id}/full/`),
  importProducts: (file) => { const fd = new FormData(); fd.append("file", file); return cpanelAxios.post("/cpanel/products/import-products/", fd, { headers: { "Content-Type": "multipart/form-data" } }); },
  downloadTemplate: () => cpanelAxios.get("/cpanel/products/import-template/", { responseType: "blob" }),
  exportProducts: () => cpanelAxios.get("/cpanel/products/export-products/", { responseType: "blob" }),
  exportOrders: () => cpanelAxios.get("/cpanel/orders/export-orders/", { responseType: "blob" }),
  exportCustomers: () => cpanelAxios.get("/cpanel/customers/export-customers/", { responseType: "blob" }),
  getAnalyticsSummary: () => cpanelAxios.get("/cpanel/analytics/summary/"),
  getAnalyticsTimeseries: (days = 30) => cpanelAxios.get(`/cpanel/analytics/timeseries/?days=${days}`),
  getAuditLogs: (params = {}) => cpanelAxios.get("/cpanel/audit-logs/", { params }),
  getSearchAnalytics: (days = 30) => cpanelAxios.get("/cpanel/search-analytics/", { params: { days } }),
  getInvoices: (params = {}) => cpanelAxios.get("/cpanel/invoices/", { params }),
  getInvoice: (id) => cpanelAxios.get(`/cpanel/invoices/${id}/`),
  downloadInvoice: (id) => cpanelAxios.get(`/cpanel/invoices/${id}/pdf/`, { responseType: 'blob' }),
  exportInvoices: (params = {}) => cpanelAxios.get("/cpanel/invoices/export/", { params, responseType: 'blob' }),
  exportInvoicePdfs: (params = {}) => cpanelAxios.get("/cpanel/invoices/export_pdfs/", { params, responseType: 'blob' }),
};

export default controlApi;