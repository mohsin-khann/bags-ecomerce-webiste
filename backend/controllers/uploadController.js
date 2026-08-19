import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import * as R from "../utils/apiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = (req, res) => {
  if (!req.file) return R.error(res, "No file uploaded", 400);

  const subDir = req.uploadSubDir || "products";
  const url = `/uploads/${subDir}/${req.file.filename}`;
  R.created(res, { url, filename: req.file.filename }, "Image uploaded");
};

export const uploadImages = (req, res) => {
  if (!req.files || req.files.length === 0) return R.error(res, "No files uploaded", 400);

  const subDir = req.uploadSubDir || "products";
  const urls = req.files.map((file) => `/uploads/${subDir}/${file.filename}`);
  R.created(res, { urls }, "Images uploaded");
};

export const deleteImage = (req, res) => {
  const { filename, folder = "products" } = req.body;
  if (!filename) return R.error(res, "Filename is required", 400);

  const filePath = path.join(__dirname, "..", "uploads", folder, filename);

  if (!fs.existsSync(filePath)) return R.error(res, "File not found", 404);

  fs.unlinkSync(filePath);
  R.success(res, {}, "Image deleted");
};
