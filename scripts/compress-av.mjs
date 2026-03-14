import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get ffmpeg path from @ffmpeg-installer/ffmpeg
let ffmpegPath;
try {
  const installer = await import("@ffmpeg-installer/ffmpeg");
  ffmpegPath = installer.default?.path || installer.path;
} catch {
  console.error("❌ @ffmpeg-installer/ffmpeg not found. Run: npm install --save-dev @ffmpeg-installer/ffmpeg");
  process.exit(1);
}

const mediaDir = path.join(__dirname, "..", "public", "media");

function compressFile(inputPath, outputPath, args) {
  const sizeBefore = fs.statSync(inputPath).size;
  const name = path.basename(inputPath);
  console.log(`⏳ Compressing ${name} (${(sizeBefore / 1024 / 1024).toFixed(2)}MB)...`);

  try {
    execSync(`"${ffmpegPath}" -i "${inputPath}" ${args} "${outputPath}" -y`, {
      stdio: "pipe",
      timeout: 300_000, // 5 min timeout
    });
    const sizeAfter = fs.statSync(outputPath).size;
    // Replace original
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);
    console.log(`✅ ${name}: ${(sizeBefore / 1024 / 1024).toFixed(2)}MB → ${(sizeAfter / 1024 / 1024).toFixed(2)}MB (${Math.round((1 - sizeAfter / sizeBefore) * 100)}% reduction)`);
  } catch (e) {
    console.error(`❌ Failed to compress ${name}: ${e.message}`);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
}

const files = fs.readdirSync(mediaDir);
console.log("🔧 Compressing audio/video files with ffmpeg...\n");

for (const file of files) {
  const filePath = path.join(mediaDir, file);
  const ext = path.extname(file).toLowerCase();
  const tmpPath = filePath + ".tmp" + ext;

  if (ext === ".mp4") {
    // Compress video: lower bitrate, smaller resolution
    compressFile(filePath, tmpPath, "-vf scale=1280:-2 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 96k -movflags +faststart");
  } else if ([".m4a", ".mp3", ".wav", ".aac"].includes(ext)) {
    // Compress audio: lower bitrate mono
    compressFile(filePath, tmpPath, "-c:a aac -b:a 64k -ac 1");
  }
}

// Final summary
console.log("\n📊 Final file sizes:");
const finalFiles = fs.readdirSync(mediaDir);
let total = 0;
for (const f of finalFiles) {
  const size = fs.statSync(path.join(mediaDir, f)).size;
  total += size;
  console.log(`  ${f}: ${(size / 1024 / 1024).toFixed(2)}MB`);
}
console.log(`\n  Total: ${(total / 1024 / 1024).toFixed(2)}MB`);
