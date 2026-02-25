import multer from "multer";
import path from "path";
import fs from "fs";
import {
  optimizeImage,
  cleanupTempFiles,
} from "../services/imageOptimizerService.js";
import { supabaseAdmin } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

// Configurar almacenamiento temporal nativo de Multer
const tempDest = path.resolve("uploads/temp");
if (!fs.existsSync(tempDest)) {
  fs.mkdirSync(tempDest, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo inicial antes de comprimir
  fileFilter,
});

/**
 * Middleware para invocar el pipeline de optimización de Python
 */
export const optimizeUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // Pasa al siguiente middleware (por si el controlador requiere manejar error)
    }

    const { remove_background, max_size_mb } = req.body;
    const shouldRemoveBg = remove_background === "true";
    const targetSizeMb = max_size_mb ? parseFloat(max_size_mb) : 1.5;

    const originalPath = req.file.path;

    // Llamamos al servicio (Child Process)
    const result = await optimizeImage(
      originalPath,
      shouldRemoveBg,
      targetSizeMb,
    );

    // Adjuntamos la información
    req.optimizedFile = {
      originalPath,
      optimizedPath: result.success
        ? result.optimizedPath
        : result.fallbackPath,
      success: result.success,
      data: result.data || null,
      wasFallback: !result.success,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware para subir el archivo (optimizado o fallback) a Supabase Storage ("products" bucket)
 */
export const uploadToSupabase = async (req, res, next) => {
  try {
    if (!req.optimizedFile) {
      return res.status(400).json({ error: "No image processed" });
    }

    const { optimizedPath, originalPath, data, wasFallback } =
      req.optimizedFile;
    const storeId = req.user.id;

    // Generar path seguro en supabase (carpeta por storeId)
    const ext = path.extname(optimizedPath) || ".webp";
    const fileName = `${storeId}/${uuidv4()}_${Date.now()}${ext}`;

    const fileBuffer = fs.readFileSync(optimizedPath);
    let mimeType = "image/webp";
    if (wasFallback) {
      const originalExt = path.extname(originalPath).toLowerCase();
      if (originalExt === ".png") mimeType = "image/png";
      if (originalExt === ".jpg" || originalExt === ".jpeg")
        mimeType = "image/jpeg";
      if (originalExt === ".gif") mimeType = "image/gif";
    }

    const { data: storageData, error } = await supabaseAdmin.storage
      .from("products")
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      cleanupTempFiles([originalPath, optimizedPath]);
      throw error;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(storageData.path);

    // Limpieza de los archivos nativos en /uploads/temp
    cleanupTempFiles([originalPath, optimizedPath]);

    // Attach for Final Controller Return
    req.uploadedFile = {
      url: urlData.publicUrl,
      path: storageData.path,
      size: data?.final_size || fs.statSync(optimizedPath).size,
      originalSize: data?.original_size || fs.statSync(originalPath).size,
      format: wasFallback ? "original" : "webp",
      removeBg: data?.bg_removed || false,
      metadata: data,
    };

    next();
  } catch (err) {
    next(err);
  }
};
