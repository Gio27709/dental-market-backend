import fs from "fs";
import path from "path";
import assert from "assert/strict";
import { optimizeImage } from "../src/services/imageOptimizerService.js";

async function runTests() {
  console.log("Starting Image Optimizer Integration Tests...");

  try {
    const scripts = [
      "compress_image.py",
      "remove_background.py",
      "optimize_image.py",
    ];
    console.log("Checking Python scripts presence...");
    scripts.forEach((scriptNm) => {
      const scriptPath = path.resolve(
        process.cwd(),
        "backend",
        "scripts",
        scriptNm,
      );
      assert.ok(fs.existsSync(scriptPath), `Script ${scriptNm} should exist`);
      console.log(`✅ ${scriptNm} exists.`);
    });

    console.log("Checking requirements.txt...");
    const reqPath = path.resolve(
      process.cwd(),
      "backend",
      "scripts",
      "requirements.txt",
    );
    assert.ok(fs.existsSync(reqPath), "Requirements file should exist");
    console.log("✅ requirements.txt exists.");

    console.log("Checking optimization service export...");
    assert.ok(
      typeof optimizeImage === "function",
      "optimizeImage should be exported as a function",
    );
    console.log("✅ optimizeImage service is available.");

    console.log(
      "All Image Optimizer fundamental tests passed successfully! ✅",
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

runTests();
