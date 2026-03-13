import { Filters, Project } from "@/types/project";
import { formatNumber } from "@/lib/insights";

function stringifyFilters(filters: Filters) {
  return [
    `ปีงบประมาณ: ${filters.years.length ? filters.years.join(", ") : "ทั้งหมด"}`,
    `ยุทธศาสตร์: ${filters.pillars.length ? filters.pillars.join(", ") : "ทั้งหมด"}`,
    `หมวดหมู่: ${filters.categories.length ? filters.categories.join(", ") : "ทั้งหมด"}`,
    `ช่วงงบประมาณ: ${formatNumber(filters.budgetRange[0])} - ${formatNumber(filters.budgetRange[1])} บาท`,
    `คำค้นหา: ${filters.query.trim() || "-"}`,
  ].join("\n");
}

export function buildCsv(projects: Project[]) {
  const header = ["รหัส", "ชื่อโครงการ", "งบประมาณ (บาท)", "ปีงบประมาณ", "ยุทธศาสตร์ (EN)", "ยุทธศาสตร์ (TH)", "หมวดหมู่"];
  const rows = projects.map((item) => [item.id, item.name, item.budget, item.year, item.pillar, item.pillarTh, item.category]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

export function buildExecutiveReport(projects: Project[], filters: Filters, now: string) {
  const totalBudget = projects.reduce((sum, item) => sum + item.budget, 0);
  const groupedPillar = groupBy(projects, (item) => item.pillar);
  const groupedYear = groupBy(projects, (item) => item.year);
  const groupedCategory = groupBy(projects, (item) => item.category);

  return [
    "═".repeat(60),
    "รายงานสรุปผู้บริหาร",
    "ระบบวิเคราะห์โครงการเมืองอัจฉริยะ — เทศบาลนครนครสวรรค์",
    `วันที่ออกรายงาน: ${now}`,
    "═".repeat(60),
    "",
    "1. ภาพรวม",
    `   จำนวนโครงการ: ${projects.length}`,
    `   งบประมาณรวม: ${formatNumber(totalBudget)} บาท`,
    "",
    "2. งบประมาณแยกตามยุทธศาสตร์",
    ...Object.entries(groupedPillar).map(([key, items]) => `   - ${key}: ${formatNumber(sumBudget(items))} บาท (${items.length} โครงการ)`),
    "",
    "3. งบประมาณแยกตามปีงบประมาณ",
    ...Object.entries(groupedYear).map(([key, items]) => `   - พ.ศ. ${key}: ${formatNumber(sumBudget(items))} บาท (${items.length} โครงการ)`),
    "",
    "4. งบประมาณแยกตามหมวดหมู่การลงทุน",
    ...Object.entries(groupedCategory).map(([key, items]) => `   - ${key}: ${formatNumber(sumBudget(items))} บาท (${items.length} โครงการ)`),
    "",
    "5. รายชื่อโครงการ",
    ...projects.flatMap((item) => [
      `   โครงการที่ ${item.id}: ${item.name}`,
      `     งบประมาณ: ${formatNumber(item.budget)} บาท | ปี: ${item.year} | ยุทธศาสตร์: ${item.pillarTh}`,
    ]),
    "",
    "ตัวกรองที่ใช้",
    stringifyFilters(filters),
    "═".repeat(60),
  ].join("\n");
}

export function buildDeepAnalysis(projects: Project[], filters: Filters, now: string) {
  const totalBudget = sumBudget(projects);
  const cyber = projects.filter((item) => [3, 4, 5].includes(item.id));
  const cyberBudget = sumBudget(cyber);

  return [
    "═".repeat(60),
    "รายงานวิเคราะห์เชิงลึก",
    "ระบบวิเคราะห์โครงการเมืองอัจฉริยะ — เทศบาลนครนครสวรรค์",
    `วันที่ออกรายงาน: ${now}`,
    "═".repeat(60),
    "",
    "1. ประเด็นความซ้ำซ้อน",
    `   โครงการด้านไซเบอร์ในมุมมองนี้มี ${cyber.length} โครงการ รวมงบ ${formatNumber(cyberBudget)} บาท`,
    `   หากเลือกแนวทางรวมศูนย์ จะลดความซ้ำซ้อนเชิงงบประมาณได้มากที่สุด`,
    "",
    "2. สัดส่วนงบประมาณ",
    ...Object.entries(groupBy(projects, (item) => item.pillar)).flatMap(([pillar, items]) => [
      `   ${pillar}: ${formatNumber(sumBudget(items))} บาท (${Math.round((sumBudget(items) / totalBudget) * 100) || 0}%)`,
    ]),
    "",
    "3. ข้อพิจารณาสำหรับผู้บริหาร",
    "   - เร่งงานที่เกี่ยวข้องกับข้อกำหนดและมาตรฐานภาครัฐก่อน",
    "   - ตัดสินใจเรื่องโครงการไซเบอร์ให้ชัดเพื่อลดความซ้ำซ้อน",
    "   - ทบทวนงานจ้างที่ปรึกษาว่าสามารถรวมขอบเขตงานได้หรือไม่",
    "",
    "ตัวกรองที่ใช้",
    stringifyFilters(filters),
    "═".repeat(60),
  ].join("\n");
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = getKey(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function sumBudget(projects: Project[]) {
  return projects.reduce((sum, item) => sum + item.budget, 0);
}
