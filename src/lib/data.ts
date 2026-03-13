import path from "path";
import fs from "fs";
import { MediaFile, Project } from "@/types/project";

export const sourceDir = path.resolve("C:/Users/Patompong.l/Documents/รายงาน ผอ.หนึ่ง/Source");

export const projects: Project[] = [
  {
    id: 1,
    name: "จัดหาระบบบริหารจัดการข้อมูลส่วนบุคคล (PDPA)",
    budget: 1_000_000,
    year: "2569",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "ความปลอดภัยข้อมูล",
  },
  {
    id: 2,
    name: "จัดทำเว็บไซต์แบบมีปฏิสัมพันธ์ (Interactive Website)",
    budget: 500_000,
    year: "2569",
    pillar: "Smart Living",
    pillarTh: "การดำรงชีวิตอัจฉริยะ",
    category: "ความปลอดภัยข้อมูล",
  },
  {
    id: 3,
    name: "ระบบรักษาความมั่นคงปลอดภัยไซเบอร์ ระยะที่ 1",
    budget: 1_500_000,
    year: "2569",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "เครือข่ายไซเบอร์",
  },
  {
    id: 4,
    name: "ระบบรักษาความมั่นคงปลอดภัยไซเบอร์ ระยะที่ 2",
    budget: 1_800_000,
    year: "2570",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "เครือข่ายไซเบอร์",
  },
  {
    id: 5,
    name: "ระบบรักษาความมั่นคงปลอดภัยไซเบอร์แบบรวมศูนย์",
    budget: 3_000_000,
    year: "2569",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "เครือข่ายไซเบอร์",
  },
  {
    id: 6,
    name: "จ้างที่ปรึกษาพัฒนาแพลตฟอร์มดิจิทัล",
    budget: 500_000,
    year: "2569",
    pillar: "Smart Economy",
    pillarTh: "เศรษฐกิจอัจฉริยะ",
    category: "ที่ปรึกษาและนโยบาย",
  },
  {
    id: 7,
    name: "จ้างที่ปรึกษาการสื่อสารนโยบายเมืองอัจฉริยะ",
    budget: 500_000,
    year: "2569",
    pillar: "Smart People",
    pillarTh: "พลเมืองอัจฉริยะ",
    category: "ที่ปรึกษาและนโยบาย",
  },
];

export const filterOptions = {
  years: [...new Set(projects.map((item) => item.year))].sort(),
  pillars: [...new Set(projects.map((item) => item.pillar))].sort(),
  categories: [...new Set(projects.map((item) => item.category))].sort(),
  budgetRange: [Math.min(...projects.map((item) => item.budget)), Math.max(...projects.map((item) => item.budget))] as [number, number],
};

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
