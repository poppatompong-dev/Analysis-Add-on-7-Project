import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const SOURCE_DIR = path.resolve(
  "C:/Users/Patompong.l/Documents/รายงาน ผอ.หนึ่ง/Source"
);

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

function sanitizeFilename(raw: string): string {
  return decodeURIComponent(raw).replace(/[/\\]/g, "").trim();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { name: string } }
) {
  const filename = sanitizeFilename(params.name);

  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filePath = path.join(SOURCE_DIR, filename);
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(SOURCE_DIR + path.sep) && resolvedPath !== SOURCE_DIR) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(resolvedPath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  try {
    const buffer = fs.readFileSync(resolvedPath);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
