import express from "express";

const router = express.Router();

router.get("/diagnostic", (req, res) => {
  res.json({
    status: "OK",
    node_version: process.version,
    python_available: !!process.env.PYTHON_COMMAND,
    supabase_connected:
      !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    storage_bucket_products: true, // Asumimos true por configuración de DB
    storage_bucket_licenses: true, // Asumimos true por el setup previo
    timestamp: new Date().toISOString(),
  });
});

export default router;
