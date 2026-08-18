import api from "./client";

const controlApi = {
  // Dashboard
  getDashboard: () => api.get("/control/dashboard/"),

  // Orders
  getOrders: () => api.get("/control/orders/"),
  getOrder: (id) => api.get(`/control/orders/${id}/`),
  updateOrderStatus: (id, status) => api.post(`/control/orders/${id}/update_status/`, { status }),
  cancelOrder: (id) => api.post(`/control/orders/${id}/cancel/`),

  // Designs (blueprints)
  getProducts: () => api.get("/control/products/"),
  getProduct: (id) => api.get(`/control/products/${id}/`),
  createDesign: (data) => api.post("/control/products/", data),
  addInstance: (designId, data) => api.post(`/control/products/${designId}/add_instance/`, data),
  uploadMedia: (designId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post(`/control/products/${designId}/upload_media/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteDesign: (designId) => api.delete(`/control/products/${designId}/delete_design/`),
  deleteProduct: (productId) => api.delete(`/control/instances/${productId}/delete_product/`),

  // Products (physical pieces)
  getInstances: () => api.get("/control/instances/"),
  markSoldOffline: (instanceId) => api.post(`/control/instances/${instanceId}/mark_sold_offline/`),
  returnToStock: (instanceId) => api.post(`/control/instances/${instanceId}/return_to_stock/`),

  // RateCard
  getRateCard: () => api.get("/control/rate-card/"),
  updateRateCard: (data) => api.put("/control/rate-card/", data),

  // Categories
  getCategories: () => api.get("/control/categories/"),

  // Customers
  getCustomers: () => api.get("/control/customers/"),

  // Import/Export
  importProducts: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/control/products/import-products/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadTemplate: () => api.get('/control/products/import-template/', { responseType: 'blob' }),
  exportProducts: () => api.get('/control/products/export-products/', { responseType: 'blob' }),
  exportOrders: () => api.get('/control/orders/export-orders/', { responseType: 'blob' }),
  exportCustomers: () => api.get('/control/customers/export-customers/', { responseType: 'blob' }),
};

export default controlApi;