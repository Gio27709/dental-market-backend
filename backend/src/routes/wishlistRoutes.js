import express from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "../controllers/wishlistController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getFavorites);
router.get("/check/:product_id", checkFavorite);
router.post("/:product_id", addFavorite);
router.delete("/:product_id", removeFavorite);

export default router;
