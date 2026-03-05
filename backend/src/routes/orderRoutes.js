import express from "express";
import multer from "multer";
import {
  createOrder,
  getOrders,
  getOrderById,
  shipOrderItem,
  uploadPaymentProof,
} from "../controllers/orderController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { createOrderSchema, shipItemSchema } from "../utils/orderValidators.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(requireAuth);

// Anyone validated can pull their contextual orders
router.get("/", getOrders);

// Only typical buyers (and professionals) create orders out of their carts
router.post(
  "/",
  requireRole(["buyer", "professional"]),
  validate(createOrderSchema),
  createOrder,
);

// Get a single order by ID
router.get("/:id", getOrderById);

// Buyers submit payment proofs for their specific orders
router.post(
  "/:id/payment-proof",
  requireRole(["buyer", "professional"]),
  upload.single("file"),
  uploadPaymentProof,
);

// Stores (and Owners tracking disputes) manage shipping of item fragments
router.put(
  "/:item_id/ship",
  requireRole(["store", "owner"]),
  validate(shipItemSchema),
  shipOrderItem,
);

export default router;
