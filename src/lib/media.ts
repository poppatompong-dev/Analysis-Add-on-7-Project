import type { MediaFile } from "@/types/project";

/**
 * Hardcoded media manifest — works on both local dev and Vercel production.
 * Files live in public/media/ and are served as static assets by Next.js.
 * Text content is loaded at build time via the generate script below.
 */

type MediaEntry = {
  name: string;
  ext: string;
  type: MediaFile["type"];
};

const MEDIA_MANIFEST: MediaEntry[] = [
  { name: "Strategic_Investment_Digital_NakhonSawan.mp4", ext: ".mp4", type: "video" },
  { name: "Budget_Approval_Technique_Analysis.m4a", ext: ".m4a", type: "audio" },
  { name: "info.webp", ext: ".webp", type: "image" },
  { name: "คำขอ.pdf", ext: ".pdf", type: "document" },
  { name: "Digital_SmartCity_Plan_2569-2570.txt", ext: ".txt", type: "document" },
  { name: "Digital_SmartCity_Strategy_NakhonSawan.txt", ext: ".txt", type: "document" },
  { name: "Project_Management_Strategy_Executive.txt", ext: ".txt", type: "document" },
  { name: "Strategic_Budget_Allocation_Plan.txt", ext: ".txt", type: "document" },
  { name: "รายงานเชิงกลยุทธ์เพื่อการตัดสินใจ.txt", ext: ".txt", type: "document" },
];

let _textCache: Map<string, string> | null = null;

function loadTextContents(): Map<string, string> {
  if (_textCache) return _textCache;
  _textCache = new Map();
  try {
    const fs = require("fs");
    const path = require("path");
    const dir = path.join(process.cwd(), "public", "media");
    for (const entry of MEDIA_MANIFEST) {
      if (entry.ext === ".txt" || entry.ext === ".md") {
        try {
          const content = fs.readFileSync(path.join(dir, entry.name), "utf-8");
          _textCache.set(entry.name, content);
        } catch { /* skip */ }
      }
    }
  } catch { /* fs not available on edge — text content will be empty */ }
  return _textCache;
}

export function getMediaFiles(): MediaFile[] {
  const textContents = loadTextContents();

  return MEDIA_MANIFEST.map((entry): MediaFile => ({
    name: entry.name,
    ext: entry.ext,
    type: entry.type,
    textContent: textContents.get(entry.name),
    url: `/media/${encodeURIComponent(entry.name)}`,
  }));
}
