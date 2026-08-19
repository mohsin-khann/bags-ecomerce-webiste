import { Router } from "express";
import { uploadImage, uploadImages, deleteImage } from "../controllers/uploadController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { upload, uploadProduct, uploadAvatar } from "../middleware/upload.js";

const router = Router();

router.use(protect, requireAdmin);

router.post("/image", uploadProduct, upload.single("image"), uploadImage);
router.post("/images", uploadProduct, upload.array("images", 10), uploadImages);
router.post("/avatar", uploadAvatar, upload.single("image"), uploadImage);
router.delete("/", deleteImage);

export default router;
