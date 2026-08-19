import { Router } from "express";
import { submitContact, getContactMessages, markContactRead } from "../controllers/contactController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", submitContact);                                          // public
router.get("/", protect, requireAdmin, getContactMessages);               // admin only
router.patch("/:id/read", protect, requireAdmin, markContactRead);        // admin only

export default router;
