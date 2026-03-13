import { NextRequest, NextResponse } from "next/server";
import { Project } from "@/types/project";

const VALID_PILLARS = ["Smart Governance", "Smart Living", "Smart Economy", "Smart People", "Smart Mobility", "Smart Environment"];
const VALID_STATUSES = ["active", "completed", "delayed", "at-risk"];

function parseCSV(text: string): string[][] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  return lines.map((line) => {
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    return cols;
  });
}

function validateRow(row: string[], headers: string[], index: number): { project: Partial<Project>; errors: string[] } {
  const errors: string[] = [];
  const get = (col: string) => row[headers.indexOf(col)]?.trim() ?? "";

  const id = parseInt(get("id") || get("รหัส"));
  const name = get("name") || get("ชื่อโครงการ");
  const budget = parseFloat((get("budget") || get("งบประมาณ")).replace(/,/g, ""));
  const year = get("year") || get("ปีงบประมาณ");
  const pillar = get("pillar") || get("ยุทธศาสตร์");
  const pillarTh = get("pillarTh") || get("ยุทธศาสตร์ (TH)") || pillar;
  const category = get("category") || get("หมวดหมู่");
  const status = get("status") || get("สถานะ");
  const completionPct = parseFloat(get("completionPct") || get("ความคืบหน้า") || "0");
  const district = get("district") || get("อำเภอ");
  const riskLevel = get("riskLevel") || get("ระดับความเสี่ยง");

  if (!name) errors.push(`แถว ${index + 2}: ไม่มีชื่อโครงการ`);
  if (isNaN(budget) || budget < 0) errors.push(`แถว ${index + 2}: งบประมาณไม่ถูกต้อง`);
  if (!year) errors.push(`แถว ${index + 2}: ไม่มีปีงบประมาณ`);
  if (pillar && !VALID_PILLARS.includes(pillar)) errors.push(`แถว ${index + 2}: ยุทธศาสตร์ "${pillar}" ไม่ถูกต้อง`);
  if (status && !VALID_STATUSES.includes(status)) errors.push(`แถว ${index + 2}: สถานะ "${status}" ไม่ถูกต้อง`);

  const project: Partial<Project> = {
    id: isNaN(id) ? index + 100 : id,
    name: name || `โครงการที่ ${index + 2}`,
    budget: isNaN(budget) ? 0 : budget,
    year: year || new Date().getFullYear().toString(),
    pillar: VALID_PILLARS.includes(pillar) ? pillar : "Smart Governance",
    pillarTh: pillarTh || pillar,
    category: category || "ทั่วไป",
    ...(VALID_STATUSES.includes(status) && { status: status as Project["status"] }),
    ...(completionPct >= 0 && completionPct <= 100 && { completionPct }),
    ...(district && { district }),
    ...(["low", "medium", "high"].includes(riskLevel) && { riskLevel: riskLevel as Project["riskLevel"] }),
  };

  return { project, errors };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let csvText = "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ success: false, error: "ไม่พบไฟล์" }, { status: 400 });
      }
      csvText = await (file as File).text();
    } else {
      csvText = await req.text();
    }

    if (!csvText.trim()) {
      return NextResponse.json({ success: false, error: "ไฟล์ว่างเปล่า" }, { status: 400 });
    }

    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      return NextResponse.json({ success: false, error: "ต้องมีอย่างน้อย 1 แถวข้อมูล (ไม่รวม header)" }, { status: 400 });
    }

    const headers = rows[0].map((h) => h.replace(/^"/, "").replace(/"$/, "").trim().toLowerCase()
      .replace("รหัส", "id")
      .replace("ชื่อโครงการ", "name")
      .replace("งบประมาณ (บาท)", "budget")
      .replace("งบประมาณ", "budget")
      .replace("ปีงบประมาณ", "year")
      .replace("ยุทธศาสตร์ (en)", "pillar")
      .replace("ยุทธศาสตร์ (th)", "pillarTh")
      .replace("หมวดหมู่", "category")
      .replace("สถานะ", "status")
      .replace("ความคืบหน้า", "completionPct")
      .replace("อำเภอ", "district")
    );

    const projects: Partial<Project>[] = [];
    const allErrors: string[] = [];

    rows.slice(1).forEach((row, i) => {
      if (row.every((cell) => !cell)) return;
      const { project, errors } = validateRow(row, headers, i);
      projects.push(project);
      allErrors.push(...errors);
    });

    return NextResponse.json({
      success: true,
      imported: projects.length,
      warnings: allErrors,
      projects,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
