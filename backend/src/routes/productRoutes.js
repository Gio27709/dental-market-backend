import express from "express";
import {
  getProducts,
  createProduct,
  deleteProduct,
  bulkImportProducts,
  getBulkImportTemplate,
} from "../controllers/productController.js";
import {
  upload,
  optimizeUpload,
  uploadToSupabase,
} from "../middlewares/upload.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { createProductSchema } from "../utils/validators.js";

const router = express.Router();

// Public
router.get("/", getProducts);

// Bulk Import Template
router.get(
  "/bulk-import/template",
  requireAuth,
  requireRole(["store", "admin", "owner"]),
  getBulkImportTemplate,
);

// Bulk Import Processing
router.post(
  "/bulk-import",
  requireAuth,
  requireRole(["store", "admin", "owner"]),
  upload.single("file"),
  bulkImportProducts,
);

// Secure Image Upload with Optimization
router.post(
  "/upload-image",
  requireAuth,
  requireRole(["store", "owner"]),
  upload.single("image"),
  optimizeUpload,
  uploadToSupabase,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: req.optimizedFile.wasFallback
        ? "Image uploaded successfully but optimization failed (fallback to original used)"
        : "Image optimized and uploaded successfully",
      file: req.uploadedFile,
    });
  },
);

// Protected: Store, Admin, Owner
router.post(
  "/",
  requireAuth,
  requireRole(["store", "admin", "owner"]),
  validate(createProductSchema),
  createProduct,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["store", "admin", "owner"]),
  deleteProduct,
);

export default router;
