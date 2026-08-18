import api from "./client";

const controlApi = {
  // Dashboard
  getDashboard: () => api.get("/control/dashboard/"),

  // Orders
  getOrders: () => api.get("/control/orders/"),
  getOrder: (id) => api.get(`/control/orders/${id}/`),
  updateOrderStatus: (id, status) => api.post(`/control/orders/${id}/update_status/`, { status }),
  cancelOrder: (id) => api.post(`/control/orders/${id}/cancel/`),

  // Products
  getProducts: () => api.get("/control/products/"),
  getCategories: () => api.get("/control/categories/"),
  createDesign: (data) => api.post("/control/products/", data),
  getProduct: (id) => api.get(`/control/products/${id}/`),
  createProduct: (data) => api.post("/control/products/", data),
  addInstance: (productId, data) => api.post(`/control/products/${productId}/add_instance/`, data),
  uploadMedia: (productId, data) => api.post(`/control/products/${productId}/upload_media/`, data),

  // Instances
  getInstances: () => api.get("/control/instances/"),
  markSoldOffline: (instanceId) => api.post(`/control/instances/${instanceId}/mark_sold_offline/`),
  returnToStock: (instanceId) => api.post(`/control/instances/${instanceId}/return_to_stock/`),

  // RateCard
  getRateCard: () => api.get("/control/rate-card/"),
  updateRateCard: (data) => api.put("/control/rate-card/", data),

  // Customers
  getCustomers: () => api.get("/control/customers/"),
};

export default controlApi;