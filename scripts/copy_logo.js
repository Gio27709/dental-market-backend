const fs = require("fs");
const path = require("path");
const dir =
  "c:/Users/GiovanyDev/.gemini/antigravity/brain/4fabfaa2-49c8-4842-b480-4618738c12bc";
const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith("media__") && f.endsWith(".png"));
files.sort(
  (a, b) =>
    fs.statSync(path.join(dir, b)).mtimeMs -
    fs.statSync(path.join(dir, a)).mtimeMs,
);

const dest = "./public/images/logo.png";
if (!fs.existsSync(path.dirname(dest))) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
}
fs.copyFileSync(path.join(dir, files[0]), dest);
console.log("Copied " + files[0] + " to " + dest);
