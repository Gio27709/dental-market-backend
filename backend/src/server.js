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
    origin: function (origin, callback) {
      if (
        !origin ||
        origin === "http://localhost:5173" ||
        origin.endsWith(".vercel.app") ||
        origin === process.env.CORS_ORIGIN
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
import cartRoutes from "./routes/cartRoutes.js";

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
app.use("/api/cart", cartRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});
