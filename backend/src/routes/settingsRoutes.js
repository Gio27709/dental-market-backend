import express from "express";
import {
  getSettings,
  updateBcvRate,
  updateCommission,
} from "../controllers/settingsController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getSettings);

// Protected routes: Only 'owner' role can edit these settings.
router.use(requireAuth);
router.use(requireRole(["owner"]));

router.put("/bcv-rate", updateBcvRate);
router.put("/commission", updateCommission);

export default router;
