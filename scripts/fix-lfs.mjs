/**
 * Fix Git LFS issue: Vercel doesn't pull LFS objects during build.
 * This script:
 * 1. Removes .gitattributes (untrack LFS)
 * 2. Removes LFS cache for tracked files
 * 3. Re-adds the actual binary files to git
 * 4. Commits and pushes
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function run(cmd) {
  console.log(`$ ${cmd}`);
  try {
    const out = execSync(cmd, { cwd: root, encoding: "utf-8", stdio: "pipe" });
    if (out.trim()) console.log(out.trim());
  } catch (e) {
    console.log(e.stdout?.trim?.() || "");
    console.error(e.stderr?.trim?.() || e.message);
  }
}

console.log("=== Step 1: Remove .gitattributes (untrack LFS) ===");
const gaPath = path.join(root, ".gitattributes");
if (fs.existsSync(gaPath)) {
  fs.unlinkSync(gaPath);
  console.log("Deleted .gitattributes");
}

console.log("\n=== Step 2: Remove LFS hooks ===");
run("git lfs uninstall");

console.log("\n=== Step 3: Re-add media files as real binaries ===");
const mediaDir = path.join(root, "public", "media");
const files = fs.readdirSync(mediaDir);
for (const f of files) {
  const size = fs.statSync(path.join(mediaDir, f)).size;
  console.log(`  ${f}: ${(size / 1024 / 1024).toFixed(2)} MB`);
}

run("git rm --cached public/media/Budget_Approval_Technique_Analysis.m4a");
run("git rm --cached public/media/Strategic_Investment_Digital_NakhonSawan.mp4");
run("git rm --cached .gitattributes");

console.log("\n=== Step 4: Stage all files ===");
run("git add public/media/Budget_Approval_Technique_Analysis.m4a");
run("git add public/media/Strategic_Investment_Digital_NakhonSawan.mp4");
run("git add -A");

console.log("\n=== Step 5: Commit ===");
run('git commit -m "Fix: remove Git LFS, push real binary files for Vercel compatibility"');

console.log("\n=== Step 6: Push ===");
run("git push origin main");

console.log("\n✅ Done! Now run: vercel --prod --yes");
