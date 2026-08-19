import { Router } from "express";
import {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, getRelatedProducts, bulkUpdateProducts, getFeaturedProducts,
} from "../controllers/productController.js";
import { protect, requireAdmin, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuth, getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

router.post("/", protect, requireAdmin, createProduct);
router.put("/bulk", protect, requireAdmin, bulkUpdateProducts);
router.put("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);

export default router;
