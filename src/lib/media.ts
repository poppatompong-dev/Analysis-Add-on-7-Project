import "server-only";
import path from "path";
import fs from "fs";
import type { MediaFile } from "@/types/project";

const videoExt = new Set([".mp4", ".mov", ".avi", ".webm"]);
const audioExt = new Set([".mp3", ".wav", ".m4a", ".aac"]);
const imageExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const textExt = new Set([".txt", ".md"]);
const docExt = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx"]);

function getExtType(ext: string): MediaFile["type"] | null {
  if (videoExt.has(ext)) return "video";
  if (audioExt.has(ext)) return "audio";
  if (imageExt.has(ext)) return "image";
  if (textExt.has(ext) || docExt.has(ext)) return "document";
  return null;
}

export function getMediaFiles(): MediaFile[] {
  const publicMediaDir = path.join(process.cwd(), "public", "media");

  if (!fs.existsSync(publicMediaDir)) return [];

  const items = fs.readdirSync(publicMediaDir).map<MediaFile | null>((name) => {
    const ext = path.extname(name).toLowerCase();
    const type = getExtType(ext);
    if (!type) return null;

    const encoded = encodeURIComponent(name);

    let textContent: string | undefined;
    if (textExt.has(ext)) {
      try {
        textContent = fs.readFileSync(path.join(publicMediaDir, name), "utf-8");
      } catch {
        textContent = undefined;
      }
    }

    return {
      name,
      ext,
      type,
      textContent,
      url: `/media/${encoded}`,
    } satisfies MediaFile;
  });

  return items.filter((item): item is MediaFile => item !== null);
}
