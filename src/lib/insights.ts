import { Project } from "@/types/project";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

export function getExecutiveSummary(filtered: Project[], allProjects: Project[]): string[] {
  if (filtered.length === 0) return ["ไม่มีโครงการในมุมมองที่เลือก"];

  const filteredBudget = filtered.reduce((s, p) => s + p.budget, 0);
  const totalBudget = allProjects.reduce((s, p) => s + p.budget, 0);

  const pillarMap = new Map<string, { budget: number; count: number }>();
  filtered.forEach((p) => {
    const existing = pillarMap.get(p.pillar) ?? { budget: 0, count: 0 };
    pillarMap.set(p.pillar, { budget: existing.budget + p.budget, count: existing.count + 1 });
  });
  const topPillar = [...pillarMap.entries()].sort((a, b) => b[1].budget - a[1].budget)[0];

  const categoryMap = new Map<string, number>();
  filtered.forEach((p) => categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + p.budget));
  const topCategory = [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const maxProject = [...filtered].sort((a, b) => b.budget - a.budget)[0];
  const avgBudget = filteredBudget / filtered.length;
  const years = [...new Set(filtered.map((p) => p.year))].sort();

  const delayedCount = filtered.filter((p) => p.status === "delayed").length;
  const atRiskCount = filtered.filter((p) => p.status === "at-risk").length;
  const completedCount = filtered.filter((p) => p.status === "completed").length;
  const avgCompletion = filtered.filter((p) => p.completionPct != null).reduce((s, p) => s + (p.completionPct ?? 0), 0) / (filtered.filter((p) => p.completionPct != null).length || 1);

  const bullets: string[] = [];

  bullets.push(
    `งบประมาณรวม ${formatNumber(filteredBudget)} บาท จาก ${filtered.length} โครงการ` +
    (totalBudget > 0 ? ` (${Math.round((filteredBudget / totalBudget) * 100)}% ของงบทั้งหมด)` : "")
  );

  if (topPillar) {
    const pct = Math.round((topPillar[1].budget / filteredBudget) * 100);
    bullets.push(`ยุทธศาสตร์ที่ใช้งบสูงสุดคือ "${topPillar[0]}" — ${formatNumber(topPillar[1].budget)} บาท (${pct}%, ${topPillar[1].count} โครงการ)`);
  }

  if (topCategory) {
    bullets.push(`หมวดหมู่ที่ใช้งบสูงสุดคือ "${topCategory[0]}" — ${formatNumber(topCategory[1])} บาท`);
  }

  bullets.push(`โครงการงบสูงสุดคือ "${maxProject.name}" — ${formatNumber(maxProject.budget)} บาท`);
  bullets.push(`งบประมาณเฉลี่ยต่อโครงการ ${formatNumber(Math.round(avgBudget))} บาท`);

  if (years.length > 1) {
    bullets.push(`ครอบคลุม ${years.length} ปีงบประมาณ: ${years.join(", ")}`);
  } else {
    bullets.push(`ปีงบประมาณ ${years[0] ?? "—"}`);
  }

  if (delayedCount > 0 || atRiskCount > 0) {
    bullets.push(`โครงการล่าช้า ${delayedCount} รายการ · เสี่ยง ${atRiskCount} รายการ — ต้องการการติดตาม`);
  }
  if (completedCount > 0) {
    bullets.push(`เสร็จสิ้นแล้ว ${completedCount} โครงการ จากทั้งหมด ${filtered.length} ในมุมมองนี้`);
  }
  if (filtered.some((p) => p.completionPct != null)) {
    bullets.push(`ความคืบหน้าเฉลี่ย ${Math.round(avgCompletion)}% ในโครงการที่มีข้อมูล`);
  }

  return bullets;
}
