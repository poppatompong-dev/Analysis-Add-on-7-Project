import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const SOURCE_DIR = (() => {
  const candidates = [
    path.join(process.cwd(), "Source"),
    path.join(process.cwd(), "..", "Source"),
    "C:/Users/Patompong.l/Documents/รายงาน ผอ.หนึ่ง/Source",
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
})();

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
    const stat = fs.statSync(resolvedPath);
    const fileSize = stat.size;
    const rangeHeader = _req.headers.get("range");

    if (rangeHeader) {
      const [startStr, endStr] = rangeHeader.replace("bytes=", "").split("-");
      const start = parseInt(startStr ?? "0", 10);
      const end = endStr ? parseInt(endStr, 10) : Math.min(start + 1_048_576 - 1, fileSize - 1);
      const chunkSize = end - start + 1;
      const fd = fs.openSync(resolvedPath, "r");
      const arr = new Uint8Array(chunkSize);
      fs.readSync(fd, arr, 0, chunkSize, start);
      fs.closeSync(fd);
      return new NextResponse(arr as unknown as BodyInit, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    const raw = fs.readFileSync(resolvedPath);
    return new NextResponse(raw as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileSize),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
