import express from "express";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} from "../controllers/cartController.js";

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:id", updateCartItem);
router.delete("/items/:id", removeFromCart);
router.delete("/", clearCart);
router.post("/merge", mergeCart);

export default router;
