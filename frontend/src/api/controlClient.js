import axios from "axios";

// 1. Create a dedicated Axios instance for the cPanel
const cpanelAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

// 2. cPanel specific 401 interceptor (Calls cpanel-refresh instead of refresh)
cpanelAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (
      typeof window !== "undefined" &&
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/login/") &&
      !original.url.includes("/auth/cpanel-refresh/") &&
      !original.url.includes("/auth/cpanel-logout/")
    ) {
      original._retry = true;
      try {
        await cpanelAxios.post("/auth/cpanel-refresh/");
        return cpanelAxios(original);
      } catch {
        if (window.location.pathname !== "/cpanel-login") {
          window.location.href = "/cpanel-login";
        }
      }
    }
    return Promise.reject(err);
  }
);

// 3. Map all cPanel methods to use cpanelAxios instead of the global api
const controlApi = {
  getDashboard: () => cpanelAxios.get("/control/dashboard/"),
  getOrders: () => cpanelAxios.get("/control/orders/"),
  getOrder: (id) => cpanelAxios.get(`/control/orders/${id}/`),
  updateOrderStatus: (id, status) => cpanelAxios.post(`/control/orders/${id}/update_status/`, { status }),
  mapProductToOrder: (orderId, itemId, productId) => cpanelAxios.post(`/control/orders/${orderId}/map_product/${itemId}/`, { product_id: productId }),
  cancelOrder: (id) => cpanelAxios.post(`/control/orders/${id}/cancel/`),
  getProducts: (offset = 0, limit = 24) => cpanelAxios.get(`/control/products/?offset=${offset}&limit=${limit}`),
  getProductsSummary: () => cpanelAxios.get("/control/products/summary/"),
  getProduct: (id) => cpanelAxios.get(`/control/products/${id}/`),
  createDesign: (data) => cpanelAxios.post("/control/products/", data),
  addInstance: (designId, data) => cpanelAxios.post(`/control/products/${designId}/add_instance/`, data),
  uploadMedia: (designId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return cpanelAxios.post(`/control/products/${designId}/upload_media/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteDesign: (designId) => cpanelAxios.delete(`/control/products/${designId}/delete_design/`),
  deleteProduct: (productId) => cpanelAxios.delete(`/control/instances/${productId}/delete_product/`),
  bulkDesignAction: (ids, action, cascade = false) =>
    cpanelAxios.post("/control/products/bulk-action/", { ids, action, cascade }),
  updateDesign: (id, data) => cpanelAxios.patch(`/control/products/${id}/`, data),
  deleteMedia: (designId, mediaId) => cpanelAxios.delete(`/control/products/${designId}/media/${mediaId}/`),
  reorderDesignMedia: (designId, mediaIds) =>
    cpanelAxios.post(`/control/products/${designId}/reorder-media/`, { media_ids: mediaIds }),
  getInstances: (params = {}) => cpanelAxios.get("/control/instances/", { params }),
  markSoldOffline: (instanceId) => cpanelAxios.post(`/control/instances/${instanceId}/mark_sold_offline/`),
  returnToStock: (instanceId) => cpanelAxios.post(`/control/instances/${instanceId}/return_to_stock/`),
  getProductDetail: (id) => cpanelAxios.get(`/control/instances/${id}/`),
  updateProduct: (id, data) => cpanelAxios.patch(`/control/instances/${id}/`, data),
  globalSearch: (q) => cpanelAxios.get("/control/global-search/", { params: { q } }),
  previewPrice: (data) => cpanelAxios.post("/control/price-preview/", data),
  calculatePrice: (data) => cpanelAxios.post("/control/calculate-price/", data),
  getProductsFlat: () => cpanelAxios.get("/control/instances/flat/"),
  bulkProductAction: (ids, action) => cpanelAxios.post("/control/instances/bulk-action/", { ids, action }),
  exportSelectedProducts: (ids) =>
    cpanelAxios.get(`/control/products/export-products/?ids=${ids.join(",")}`, { responseType: "blob" }),
  getRateCard: () => cpanelAxios.get("/control/rate-card/"),
  updateRateCard: (data) => cpanelAxios.put("/control/rate-card/", data),
  getRateHistory: () => cpanelAxios.get("/control/rate-history/"),
  getNotifications: () => cpanelAxios.get("/control/notifications/"),
  markNotificationRead: (id) => cpanelAxios.post(`/control/notifications/${id}/read/`),
  markAllNotificationsRead: () => cpanelAxios.post("/control/notifications/mark-all-read/"),
  fetchRatesNow: () => cpanelAxios.post("/control/rate-card/fetch-now/"),
  getCategories: () => cpanelAxios.get("/control/categories/"),
  createCategory: (data) => cpanelAxios.post("/control/categories/", data),
  updateCategory: (id, data) => cpanelAxios.patch(`/control/categories/${id}/`, data),
  deleteCategory: (id) => cpanelAxios.delete(`/control/categories/${id}/`),
  getTags: () => cpanelAxios.get("/control/tags/"),
  createTag: (data) => cpanelAxios.post("/control/tags/", data),
  updateTag: (id, data) => cpanelAxios.patch(`/control/tags/${id}/`, data),
  deleteTag: (id) => cpanelAxios.delete(`/control/tags/${id}/`),
    deactivateUser: (id) => cpanelAxios.post(`/control/customers/${id}/deactivate_user/`),
  activateUser: (id) => cpanelAxios.post(`/control/customers/${id}/activate_user/`),
  getCustomers: (includeStaff = false) => {
    const params = includeStaff ? { include_staff: 'true' } : {};
    return cpanelAxios.get("/control/customers/", { params });
  },
  getCustomerFull: (id) => cpanelAxios.get(`/control/customers/${id}/full/`),
  importProducts: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return cpanelAxios.post("/control/products/import-products/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  downloadTemplate: () => cpanelAxios.get("/control/products/import-template/", { responseType: "blob" }),
  exportProducts: () => cpanelAxios.get("/control/products/export-products/", { responseType: "blob" }),
  exportOrders: () => cpanelAxios.get("/control/orders/export-orders/", { responseType: "blob" }),
  exportCustomers: () => cpanelAxios.get("/control/customers/export-customers/", { responseType: "blob" }),
  getAnalyticsSummary: () => cpanelAxios.get("/control/analytics/summary/"),
  getAnalyticsTimeseries: (days = 30) => cpanelAxios.get(`/control/analytics/timeseries/?days=${days}`),
  getAuditLogs: (params = {}) => cpanelAxios.get("/control/audit-logs/", { params }),
  getSearchAnalytics: (days = 30) => cpanelAxios.get("/control/search-analytics/", { params: { days } }),
  getInvoices: (params = {}) => cpanelAxios.get("/control/invoices/", { params }),
  getInvoice: (id) => cpanelAxios.get(`/control/invoices/${id}/`),
  downloadInvoice: (id) => cpanelAxios.get(`/control/invoices/${id}/pdf/`, { responseType: 'blob' }),
  exportInvoices: (params = {}) => cpanelAxios.get("/control/invoices/export/", { params, responseType: 'blob' }),
  exportInvoicePdfs: (params = {}) => cpanelAxios.get("/control/invoices/export_pdfs/", { params, responseType: 'blob' }),
};

export default controlApi;