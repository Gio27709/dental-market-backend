import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import professionalRoutes from "./routes/professionalRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import diagRoutes from "./routes/diagRoutes.js";

// Register Application Base Routes
app.use("/", healthRoutes);
app.use("/api", diagRoutes);

// Register API Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/store/wallet", walletRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/professional", professionalRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});
