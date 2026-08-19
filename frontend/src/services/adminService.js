import api from "./api";

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const { data } = await api.get("/admin/dashboard");
    return data;
  },

  // Products
  getProducts: async (params) => {
    const { data } = await api.get("/products", { params });
    return data.data || data.products || data;
  },

  createProduct: async (payload) => {
    const { data } = await api.post("/products", payload);
    return data;
  },

  updateProduct: async (id, payload) => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  bulkUpdateProducts: async (list) => {
    const { data } = await api.put("/products/bulk", list);
    return data;
  },

  // Categories
  getCategories: async () => {
    const { data } = await api.get("/categories");
    return data.categories || data;
  },

  createCategory: async (payload) => {
    const { data } = await api.post("/categories", payload);
    return data;
  },

  updateCategory: async (id, payload) => {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  bulkUpdateCategories: async (list) => {
    const { data } = await api.put("/categories/bulk", list);
    return data;
  },

  // Banners
  getBanners: async () => {
    const { data } = await api.get("/banners");
    return data.banners || data;
  },

  createBanner: async (payload) => {
    const { data } = await api.post("/banners", payload);
    return data;
  },

  updateBanner: async (id, payload) => {
    const { data } = await api.put(`/banners/${id}`, payload);
    return data;
  },

  deleteBanner: async (id) => {
    const { data } = await api.delete(`/banners/${id}`);
    return data;
  },

  bulkUpdateBanners: async (list) => {
    const { data } = await api.put("/banners/bulk", list);
    return data;
  },

  // Testimonials
  getTestimonials: async () => {
    const { data } = await api.get("/testimonials");
    return data.testimonials || data;
  },

  createTestimonial: async (payload) => {
    const { data } = await api.post("/testimonials", payload);
    return data;
  },

  updateTestimonial: async (id, payload) => {
    const { data } = await api.put(`/testimonials/${id}`, payload);
    return data;
  },

  deleteTestimonial: async (id) => {
    const { data } = await api.delete(`/testimonials/${id}`);
    return data;
  },

  bulkUpdateTestimonials: async (list) => {
    const { data } = await api.put("/testimonials/bulk", list);
    return data;
  },

  // Orders (admin)
  getAllOrders: async (params) => {
    const { data } = await api.get("/orders", { params });
    return data.data || data;
  },

  updateOrderStatus: async (id, status) => {
    const { data } = await api.put(`/orders/${id}/status`, { status });
    return data;
  },

  // Reviews (admin)
  getAllReviews: async (params) => {
    const { data } = await api.get("/reviews", { params });
    return data.data || data.reviews || data;
  },

  deleteReview: async (id) => {
    const { data } = await api.delete(`/reviews/${id}`);
    return data;
  },

  // Settings — backend returns { success, message, settings: {...} }
  getContactInfo: async () => {
    try {
      const { data } = await api.get("/settings/contact");
      return data.settings || {};
    } catch { return {}; }
  },

  saveContactInfo: async (payload) => {
    const { data } = await api.post("/settings/contact", payload);
    return data;
  },

  getWebsiteSettings: async () => {
    try {
      const { data } = await api.get("/settings/website");
      return data.settings || {};
    } catch { return {}; }
  },

  saveWebsiteSettings: async (payload) => {
    const { data } = await api.post("/settings/website", payload);
    return data;
  },

  getAppearanceSettings: async () => {
    try {
      const { data } = await api.get("/settings/appearance");
      return data.settings || {};
    } catch { return {}; }
  },

  saveAppearanceSettings: async (payload) => {
    const { data } = await api.post("/settings/appearance", payload);
    return data;
  },

  getStaticPages: async () => {
    try {
      const { data } = await api.get("/settings/pages");
      return data.settings || {};
    } catch { return {}; }
  },

  saveStaticPages: async (payload) => {
    const { data } = await api.post("/settings/pages", payload);
    return data;
  },

  getAdminProfile: async () => {
    try {
      const { data } = await api.get("/auth/me");
      const user = data.user || data;
      return {
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        profileImage: user.profileImage || user.avatar || "",
      };
    } catch { return { fullName: "", email: "", profileImage: "" }; }
  },

  saveAdminProfile: async (payload) => {
    const { profileImage, ...rest } = payload;
    const body = { ...rest };
    if (profileImage !== undefined) body.avatar = profileImage;
    const { data } = await api.put("/auth/me", body);
    return data;
  },

  getMediaLibrary: async () => {
    try {
      const { data } = await api.get("/settings/media");
      const arr = data.settings?.media || data.media || [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  },

  saveMediaLibrary: async (list) => {
    const { data } = await api.post("/settings/media", { media: list });
    return data;
  },

  getSubscribers: async () => {
    const { data } = await api.get("/newsletter");
    const subs = data.data || data.subscribers || [];
    return (Array.isArray(subs) ? subs : []).map((s) => ({
      ...s,
      id: s.id || s._id,
      date: s.date || new Date(s.subscribedAt || s.createdAt).toLocaleDateString(),
    }));
  },

  unsubscribeEmail: async (email) => {
    const { data } = await api.post("/newsletter/unsubscribe", { email });
    return data;
  },

  // Coupons
  getCoupons: async () => {
    const { data } = await api.get("/coupons");
    return data.coupons || data;
  },

  createCoupon: async (payload) => {
    const { data } = await api.post("/coupons", payload);
    return data;
  },

  deleteCoupon: async (id) => {
    const { data } = await api.delete(`/coupons/${id}`);
    return data;
  },

  // User Management
  getUsers: async (params) => {
    const { data } = await api.get("/admin/users", { params });
    return data.users || data.data || data;
  },

  getUserById: async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data.user || data;
  },

  updateUser: async (id, payload) => {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },

  updateUserStatus: async (id, isActive) => {
    const { data } = await api.put(`/admin/users/${id}/status`, { isActive });
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  resetUserPassword: async (id, newPassword) => {
    const { data } = await api.put(`/admin/users/${id}/reset-password`, { newPassword });
    return data;
  },

  // Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
