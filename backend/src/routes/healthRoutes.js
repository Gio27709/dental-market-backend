import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Dental Market API is running",
    timestamp: new Date().toISOString(),
  });
});

router.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

export default router;
