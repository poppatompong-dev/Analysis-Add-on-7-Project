import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mediaDir = path.join(__dirname, "..", "public", "media");

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath);
  const sizeBefore = fs.statSync(filePath).size;

  if (ext === ".png") {
    // Convert PNG to optimized WebP (keep original name but as .webp)
    const webpPath = filePath.replace(/\.png$/i, ".webp");
    await sharp(filePath)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);
    const sizeAfter = fs.statSync(webpPath).size;
    // Remove original PNG
    fs.unlinkSync(filePath);
    console.log(`✅ ${name} → ${path.basename(webpPath)}: ${(sizeBefore / 1024 / 1024).toFixed(2)}MB → ${(sizeAfter / 1024 / 1024).toFixed(2)}MB`);
  } else if ([".jpg", ".jpeg"].includes(ext)) {
    const tmpPath = filePath + ".tmp";
    await sharp(filePath)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(tmpPath);
    const sizeAfter = fs.statSync(tmpPath).size;
    fs.renameSync(tmpPath, filePath);
    console.log(`✅ ${name}: ${(sizeBefore / 1024 / 1024).toFixed(2)}MB → ${(sizeAfter / 1024 / 1024).toFixed(2)}MB`);
  }
}

async function main() {
  const files = fs.readdirSync(mediaDir);
  console.log("🔧 Compressing media files...\n");

  for (const file of files) {
    const filePath = path.join(mediaDir, file);
    const ext = path.extname(file).toLowerCase();

    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      await compressImage(filePath);
    }
  }

  // Show final summary
  console.log("\n📊 Final file sizes:");
  const finalFiles = fs.readdirSync(mediaDir);
  let total = 0;
  for (const file of finalFiles) {
    const size = fs.statSync(path.join(mediaDir, file)).size;
    total += size;
    console.log(`  ${file}: ${(size / 1024 / 1024).toFixed(2)}MB`);
  }
  console.log(`\n  Total: ${(total / 1024 / 1024).toFixed(2)}MB`);
}

main().catch(console.error);
