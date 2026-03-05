import express from "express";
import {
  approvePayment,
  rejectPayment,
} from "../controllers/orderController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["admin", "owner"]));

// Admin: Approve a payment proof
router.put("/:id/approve-payment", approvePayment);

// Admin: Reject a payment proof
router.put("/:id/reject-payment", rejectPayment);

export default router;
