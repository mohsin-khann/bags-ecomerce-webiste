import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  addTrackingUpdate,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);
router.post("/:id/tracking", requireAdmin, addTrackingUpdate);

// Admin only
router.get("/", requireAdmin, getAllOrders);
router.put("/:id/status", requireAdmin, updateOrderStatus);

export default router;
