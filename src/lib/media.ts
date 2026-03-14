import "server-only";
import path from "path";
import fs from "fs";
import type { MediaFile } from "@/types/project";

const candidates = [
  path.join(process.cwd(), "Source"),
  path.join(process.cwd(), "..", "Source"),
  "C:/Users/Patompong.l/Documents/รายงาน ผอ.หนึ่ง/Source",
];
export const sourceDir = candidates.find((p) => fs.existsSync(p)) ?? candidates[0];

const videoExt = new Set([".mp4", ".mov", ".avi", ".webm"]);
const audioExt = new Set([".mp3", ".wav", ".m4a", ".aac"]);
const imageExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const textExt = new Set([".txt", ".md"]);
const docExt = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx"]);

export function getMediaFiles(): MediaFile[] {
  if (!fs.existsSync(sourceDir)) return [];

  const items = fs.readdirSync(sourceDir).map<MediaFile | null>((name) => {
    const ext = path.extname(name).toLowerCase();
    const filePath = path.join(sourceDir, name);
    const encoded = encodeURIComponent(name);

    let type: MediaFile["type"] | null = null;
    if (videoExt.has(ext)) type = "video";
    if (audioExt.has(ext)) type = "audio";
    if (imageExt.has(ext)) type = "image";
    if (textExt.has(ext) || docExt.has(ext)) type = "document";
    if (!type) return null;

    let textContent: string | undefined;
    if (textExt.has(ext)) {
      try {
        textContent = fs.readFileSync(filePath, "utf-8");
      } catch {
        textContent = undefined;
      }
    }

    return {
      name,
      ext,
      type,
      textContent,
      url: `/api/media/${encoded}`,
    } satisfies MediaFile;
  });

  return items.filter((item): item is MediaFile => item !== null);
}
