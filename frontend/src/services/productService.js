import api from "./api";

// Local JSON fallbacks — used when backend is unavailable
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";
import bannersData from "../data/banners.json";
import testimonialsData from "../data/testimonials.json";

const tryApi = async (apiFn, fallback) => {
  try {
    const result = await apiFn();
    // If API returns empty array, use local JSON fallback so page always has content
    if (Array.isArray(result) && result.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      return fallback;
    }
    return result;
  } catch {
    return fallback;
  }
};

// Normalize backend documents: ensure `id` is always set (from _id for MongoDB docs)
const norm = (arr) =>
  Array.isArray(arr) ? arr.map((p) => (p._id ? { ...p, id: p.id || p._id } : p)) : arr;

export const productService = {
  getProducts: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      return norm(data.data || data.products || data);
    }, productsData);
  },

  getProductById: async (id) => {
    return tryApi(async () => {
      const { data } = await api.get(`/products/${id}`);
      const p = data.product || data;
      return p._id ? { ...p, id: p.id || p._id } : p;
    }, productsData.find((p) => p.id === Number(id)));
  },

  queryProducts: async (params) => {
    return tryApi(async () => {
      const { data } = await api.get("/products", { params });
      return norm(data.data || data.products || data);
    }, _localQuery(productsData, params));
  },

  getCategories: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/categories");
      const cats = norm(data.categories || data);
      // Merge local image URLs because the seeded DB categories have no image field
      return cats.map((cat) => {
        if (cat.image) return cat;
        const local = categoriesData.find(
          (c) => c.name.toLowerCase() === cat.name.toLowerCase()
        );
        return local ? { ...cat, image: local.image } : cat;
      });
    }, categoriesData);
  },

  getBanners: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/banners");
      return norm(data.banners || data);
    }, bannersData);
  },

  getTestimonials: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/testimonials");
      return norm(data.testimonials || data);
    }, testimonialsData);
  },

  getRelatedProducts: async (product, limit = 4) => {
    return tryApi(async () => {
      const { data } = await api.get(`/products/${product.id || product._id}/related`, {
        params: { limit },
      });
      return norm(data.products || data);
    }, productsData.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit));
  },

  getTopSelling: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/products", { params: { isTopSelling: true } });
      return norm(data.data || data.products || data);
    }, productsData.filter((p) => p.isTopSelling));
  },

  getNewArrivals: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/products", { params: { sort: "-createdAt", limit: 8 } });
      return norm(data.data || data.products || data);
    }, [...productsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },

  getFeaturedProducts: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/products", { params: { isFeatured: true } });
      return norm(data.data || data.products || data);
    }, productsData.filter((p) => p.isFeatured));
  },

  getTopPicks: async () => {
    return tryApi(async () => {
      const { data } = await api.get("/products", { params: { isTopPick: true } });
      return norm(data.data || data.products || data);
    }, productsData.filter((p) => p.isTopPick));
  },

  // Admin operations
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

  bulkUpdateProducts: async (payload) => {
    const { data } = await api.put("/products/bulk", payload);
    return data;
  },
};

// Local query fallback — mirrors backend filter logic
function _localQuery(products, params = {}) {
  let result = [...products];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q))
    );
  }

  if (params.category && params.category !== "All") {
    result = result.filter((p) => p.category === params.category);
  }

  if (params.brand) result = result.filter((p) => p.brand === params.brand);

  if (params.colors?.length > 0) {
    result = result.filter((p) => params.colors.includes(p.color));
  }

  if (params.materials?.length > 0) {
    result = result.filter((p) => params.materials.includes(p.material));
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    result = result.filter((p) => {
      const fp = p.price * (1 - (p.discount || 0) / 100);
      return (params.minPrice === undefined || fp >= params.minPrice) &&
             (params.maxPrice === undefined || fp <= params.maxPrice);
    });
  }

  if (params.ratings?.length > 0) {
    result = result.filter((p) => params.ratings.some((r) => p.rating >= r));
  }

  if (params.discountsOnly) result = result.filter((p) => p.discount > 0);
  if (params.inStockOnly) result = result.filter((p) => p.stock > 0);
  if (params.isFeatured) result = result.filter((p) => p.isFeatured);
  if (params.isTopPick) result = result.filter((p) => p.isTopPick);
  if (params.isTopSelling) result = result.filter((p) => p.isTopSelling);

  switch (params.sort) {
    case "Latest":
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "Price Low to High":
      result.sort((a, b) => a.price * (1 - a.discount / 100) - b.price * (1 - b.discount / 100));
      break;
    case "Price High to Low":
      result.sort((a, b) => b.price * (1 - b.discount / 100) - a.price * (1 - a.discount / 100));
      break;
    case "Best Selling":
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      break;
    case "Highest Rated":
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default:
      break;
  }

  return result;
}
