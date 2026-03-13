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
  const header = ["รหัส", "ชื่อโครงการ", "งบประมาณ (บาท)", "ปีงบประมาณ", "ยุทธศาสตร์ (EN)", "ยุทธศาสตร์ (TH)", "หมวดหมู่", "สถานะ", "ความคืบหน้า (%)", "อำเภอ"];
  const rows = projects.map((p) => [
    p.id, p.name, p.budget, p.year, p.pillar, p.pillarTh, p.category,
    p.status ?? "", p.completionPct ?? "", p.district ?? "",
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

export function buildExecutiveReport(projects: Project[], filters: Filters, now: string) {
  if (projects.length === 0) return "ไม่มีโครงการในมุมมองที่เลือก";

  const totalBudget = sumBudget(projects);
  const avgBudget = totalBudget / projects.length;
  const maxProject = [...projects].sort((a, b) => b.budget - a.budget)[0];
  const groupedPillar = groupBy(projects, (p) => p.pillar);
  const groupedYear = groupBy(projects, (p) => p.year);
  const groupedCategory = groupBy(projects, (p) => p.category);

  const statusGroups = groupBy(projects.filter((p) => p.status), (p) => p.status as string);
  const delayedCount = (statusGroups["delayed"] ?? []).length;
  const atRiskCount = (statusGroups["at-risk"] ?? []).length;
  const completedCount = (statusGroups["completed"] ?? []).length;

  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push("รายงานสรุปผู้บริหาร");
  lines.push("ระบบวิเคราะห์โครงการเมืองอัจฉริยะ — เทศบาลนครนครสวรรค์");
  lines.push(`วันที่ออกรายงาน: ${now}`);
  lines.push("═".repeat(60));
  lines.push("");
  lines.push("1. ภาพรวม");
  lines.push(`   จำนวนโครงการ: ${projects.length} รายการ`);
  lines.push(`   งบประมาณรวม: ${formatNumber(totalBudget)} บาท`);
  lines.push(`   งบประมาณเฉลี่ย: ${formatNumber(Math.round(avgBudget))} บาท/โครงการ`);
  lines.push(`   โครงการงบสูงสุด: ${maxProject.name} (${formatNumber(maxProject.budget)} บาท)`);
  lines.push("");
  lines.push("2. สถานะโครงการ");
  lines.push(`   เสร็จสิ้น: ${completedCount} | ดำเนินการ: ${(statusGroups["active"] ?? []).length} | ล่าช้า: ${delayedCount} | เสี่ยง: ${atRiskCount}`);
  lines.push("");
  lines.push("3. งบประมาณแยกตามยุทธศาสตร์");
  Object.entries(groupedPillar)
    .sort((a, b) => sumBudget(b[1]) - sumBudget(a[1]))
    .forEach(([key, items]) => {
      const pct = Math.round((sumBudget(items) / totalBudget) * 100);
      lines.push(`   - ${key}: ${formatNumber(sumBudget(items))} บาท (${pct}%, ${items.length} โครงการ)`);
    });
  lines.push("");
  lines.push("4. งบประมาณแยกตามปีงบประมาณ");
  Object.entries(groupedYear)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([key, items]) => {
      lines.push(`   - พ.ศ. ${key}: ${formatNumber(sumBudget(items))} บาท (${items.length} โครงการ)`);
    });
  lines.push("");
  lines.push("5. งบประมาณแยกตามหมวดหมู่การลงทุน");
  Object.entries(groupedCategory)
    .sort((a, b) => sumBudget(b[1]) - sumBudget(a[1]))
    .forEach(([key, items]) => {
      lines.push(`   - ${key}: ${formatNumber(sumBudget(items))} บาท (${items.length} โครงการ)`);
    });
  lines.push("");
  lines.push("6. รายชื่อโครงการ");
  projects.forEach((p) => {
    lines.push(`   ${p.id}. ${p.name}`);
    lines.push(`      งบ: ${formatNumber(p.budget)} บาท | ปี: ${p.year} | ยุทธศาสตร์: ${p.pillarTh || p.pillar}${p.status ? ` | สถานะ: ${p.status}` : ""}${p.completionPct != null ? ` | คืบหน้า: ${p.completionPct}%` : ""}`);
  });
  lines.push("");
  lines.push("ตัวกรองที่ใช้");
  lines.push(stringifyFilters(filters));
  lines.push("═".repeat(60));
  return lines.join("\n");
}

export function buildDeepAnalysis(projects: Project[], filters: Filters, now: string) {
  if (projects.length === 0) return "ไม่มีโครงการในมุมมองที่เลือก";

  const totalBudget = sumBudget(projects);
  const pillarGroups = groupBy(projects, (p) => p.pillar);
  const categoryGroups = groupBy(projects, (p) => p.category);

  const topPillar = Object.entries(pillarGroups).sort((a, b) => sumBudget(b[1]) - sumBudget(a[1]))[0];
  const topPillarPct = Math.round((sumBudget(topPillar[1]) / totalBudget) * 100);

  const duplicateCategoryGroups = Object.entries(categoryGroups).filter(([, items]) => items.length >= 2);
  const delayedProjects = projects.filter((p) => p.status === "delayed" || p.status === "at-risk");

  const pillarBudgetConcentration = topPillarPct >= 50;

  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push("รายงานวิเคราะห์เชิงลึก");
  lines.push("ระบบวิเคราะห์โครงการเมืองอัจฉริยะ — เทศบาลนครนครสวรรค์");
  lines.push(`วันที่ออกรายงาน: ${now}`);
  lines.push("═".repeat(60));
  lines.push("");
  lines.push("1. การกระจุกตัวของงบประมาณ");
  Object.entries(pillarGroups)
    .sort((a, b) => sumBudget(b[1]) - sumBudget(a[1]))
    .forEach(([pillar, items]) => {
      const pct = Math.round((sumBudget(items) / totalBudget) * 100);
      const flag = pct >= 50 ? " ⚠️ (กระจุกตัวสูง)" : "";
      lines.push(`   ${pillar}: ${formatNumber(sumBudget(items))} บาท (${pct}%)${flag}`);
    });
  if (pillarBudgetConcentration) {
    lines.push(`   → ยุทธศาสตร์ "${topPillar[0]}" ใช้งบถึง ${topPillarPct}% ของมุมมองนี้`);
  }
  lines.push("");
  lines.push("2. หมวดหมู่ที่มีหลายโครงการ (เสี่ยงซ้ำซ้อน)");
  if (duplicateCategoryGroups.length === 0) {
    lines.push("   ไม่พบหมวดหมู่ที่มีมากกว่า 1 โครงการในมุมมองนี้");
  } else {
    duplicateCategoryGroups
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([cat, items]) => {
        lines.push(`   - ${cat}: ${items.length} โครงการ, รวมงบ ${formatNumber(sumBudget(items))} บาท`);
        items.forEach((p) => lines.push(`     • #${p.id} ${p.name} (${formatNumber(p.budget)} บาท)`));
      });
  }
  lines.push("");
  lines.push("3. โครงการที่ต้องติดตาม (ล่าช้าหรือเสี่ยง)");
  if (delayedProjects.length === 0) {
    lines.push("   ไม่พบโครงการที่มีสถานะล่าช้าหรือเสี่ยงในมุมมองนี้");
  } else {
    delayedProjects.forEach((p) => {
      lines.push(`   - #${p.id} ${p.name} — สถานะ: ${p.status}${p.completionPct != null ? `, คืบหน้า ${p.completionPct}%` : ""}`);
    });
  }
  lines.push("");
  lines.push("4. สัดส่วนงบประมาณตามหมวดหมู่");
  Object.entries(categoryGroups)
    .sort((a, b) => sumBudget(b[1]) - sumBudget(a[1]))
    .forEach(([cat, items]) => {
      const pct = Math.round((sumBudget(items) / totalBudget) * 100);
      lines.push(`   ${cat}: ${formatNumber(sumBudget(items))} บาท (${pct}%)`);
    });
  lines.push("");
  lines.push("ตัวกรองที่ใช้");
  lines.push(stringifyFilters(filters));
  lines.push("═".repeat(60));
  return lines.join("\n");
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
