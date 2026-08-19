import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema(
  { key: String, value: String },
  { _id: false }
);

const productReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    slug: { type: String, unique: true, sparse: true },
    category: { type: String, required: [true, "Category is required"], trim: true },
    brand: { type: String, required: [true, "Brand is required"], trim: true },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    material: { type: String, trim: true },
    color: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
    isTopPick: { type: Boolean, default: false },
    isTopSelling: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
    images: [{ type: String }],
    description: { type: String, trim: true },
    specifications: [specificationSchema],
    reviews: [productReviewSchema],
    tags: [String],
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-") + "-" + Date.now();
  }
  next();
});

// Computed discounted price virtual
productSchema.virtual("discountedPrice").get(function () {
  return this.price * (1 - this.discount / 100);
});

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isTopPick: 1 });
productSchema.index({ isTopSelling: 1 });
productSchema.index({ name: "text", description: "text", brand: "text", category: "text" });

export default mongoose.model("Product", productSchema);
