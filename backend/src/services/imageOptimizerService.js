import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/**
 * Optimizes an image using Python scripts
 *
 * @param {string} inputPath - Original image path
 * @param {boolean} removeBackground - Whether to remove the background
 * @param {number} maxSizeMb - Maximum allowed file size
 * @returns {Promise<Object>} - The optimization result
 */
export const optimizeImage = (
  inputPath,
  removeBackground = false,
  maxSizeMb = 1.5,
) => {
  return new Promise((resolve) => {
    const ext = path.extname(inputPath);
    const directory = path.dirname(inputPath);
    const baseName = path.basename(inputPath, ext);
    const outputPath = path.join(directory, `${baseName}_optimized.webp`);

    const scriptPath = path.resolve("scripts/optimize_image.py");
    const pythonCommand = process.env.PYTHON_COMMAND || "python3";

    const pythonProcess = spawn(pythonCommand, [
      scriptPath,
      inputPath,
      outputPath,
      String(removeBackground),
      String(maxSizeMb),
    ]);

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      try {
        if (code !== 0) {
          console.error("Python Script Error:", stderrData);
          resolve({
            success: false,
            fallbackPath: inputPath,
            error: "Python processing failed, falling back to original image.",
          });
          return;
        }

        // Python prints JSON at the end
        const match = stdoutData.match(/\{.*\}/s);
        if (!match) {
          resolve({
            success: false,
            fallbackPath: inputPath,
            error: "Could not parse Python output.",
          });
          return;
        }

        const result = JSON.parse(match[0]);

        if (result.success) {
          resolve({
            success: true,
            optimizedPath: outputPath,
            data: result.data,
          });
        } else {
          resolve({
            success: false,
            fallbackPath: inputPath,
            error: result.error || "Unknown Python Script error",
          });
        }
      } catch (err) {
        resolve({
          success: false,
          fallbackPath: inputPath,
          error: "Failed to parse Python response: " + err.message,
        });
      }
    });
  });
};

/**
 * Cleans up temporary files
 * @param {Array<string>} filePaths - Array of absolute file paths to delete
 */
export const cleanupTempFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error(`Failed to delete temp file ${filePath}:`, e.message);
      }
    }
  });
};
