import express from "express";
import {
  getWalletBalance,
  getTransactions,
  requestPayout,
} from "../controllers/walletController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only Stores can pull and view their raw wallet data or trigger a withdraw logic.
router.use(requireAuth);
router.use(requireRole(["store"]));

router.get("/", getWalletBalance);
router.get("/transactions", getTransactions);
router.post("/payout", requestPayout);

export default router;
