import express from "express";
import multer from "multer";

import {
  uploadLicense,
  getStatus,
  getPendingLicenses,
  verifyLicense,
} from "../controllers/professionalController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Professional interacting with their own profile
router.post(
  "/license-upload",
  requireAuth,
  requireRole(["professional"]),
  upload.single("file"),
  uploadLicense,
);

router.get("/status", requireAuth, requireRole(["professional"]), getStatus);

// Admins managing verifications
router.get(
  "/admin/professional-licenses",
  requireAuth,
  requireRole(["admin", "owner"]),
  getPendingLicenses,
);

router.put(
  "/admin/professionals/:id/verify",
  requireAuth,
  requireRole(["admin", "owner"]),
  verifyLicense,
);

export default router;
