import Product from "../models/Product.js";
import * as R from "../utils/apiResponse.js";

export const getProducts = async (req, res) => {
  const {
    page = 1, limit = 12, sort = "-createdAt",
    category, brand, minPrice, maxPrice, search,
    isFeatured, isTopPick, isTopSelling, color, material,
  } = req.query;

  const filter = {};
  if (category) filter.category = { $in: category.split(",") };
  if (brand) filter.brand = { $in: brand.split(",") };
  if (color) filter.color = { $in: color.split(",") };
  if (material) filter.material = { $in: material.split(",") };
  if (isFeatured === "true") filter.isFeatured = true;
  if (isTopPick === "true") filter.isTopPick = true;
  if (isTopSelling === "true") filter.isTopSelling = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(filter),
  ]);

  R.paginated(res, products, total, page, limit);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return R.error(res, "Product not found", 404);
  R.success(res, { product });
};

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  R.created(res, { product }, "Product created");
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return R.error(res, "Product not found", 404);
  R.success(res, { product }, "Product updated");
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return R.error(res, "Product not found", 404);
  R.success(res, {}, "Product deleted");
};

export const getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id).select("category brand");
  if (!product) return R.error(res, "Product not found", 404);

  const related = await Product.find({
    _id: { $ne: product._id },
    $or: [{ category: product.category }, { brand: product.brand }],
  }).limit(8).lean();

  R.success(res, { products: related });
};

export const bulkUpdateProducts = async (req, res) => {
  const { ids, updates } = req.body;
  await Product.updateMany({ _id: { $in: ids } }, updates);
  R.success(res, {}, `${ids.length} products updated`);
};

export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8).lean();
  R.success(res, { products });
};
