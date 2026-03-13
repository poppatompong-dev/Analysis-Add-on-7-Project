import { Project } from "@/types/project";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

export function getMetrics(projects: Project[]) {
  const totalBudget = projects.reduce((sum, item) => sum + item.budget, 0);
  const avgBudget = projects.length ? totalBudget / projects.length : 0;
  const maxProject = projects.length ? [...projects].sort((a, b) => b.budget - a.budget)[0] : null;
  const pillarCount = new Set(projects.map((item) => item.pillar)).size;

  return { totalBudget, avgBudget, maxProject, pillarCount };
}

export function getExecutiveSummary(filtered: Project[], allProjects: Project[]) {
  const filteredBudget = filtered.reduce((sum, item) => sum + item.budget, 0);
  const totalBudget = allProjects.reduce((sum, item) => sum + item.budget, 0);
  const pillarMap = new Map<string, number>();
  filtered.forEach((item) => pillarMap.set(item.pillar, (pillarMap.get(item.pillar) || 0) + item.budget));
  const topPillarEntry = [...pillarMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const avgBudget = filtered.length ? filteredBudget / filtered.length : 0;
  const maxProject = filtered.length ? [...filtered].sort((a, b) => b.budget - a.budget)[0] : null;
  const yearCount = new Set(filtered.map((item) => item.year)).size;

  const bullets: string[] = [];
  bullets.push(`งบประมาณรวม ${formatNumber(filteredBudget)} บาท จาก ${filtered.length} โครงการ` + (totalBudget ? ` คิดเป็น ${Math.round((filteredBudget / totalBudget) * 100)}% ของงบทั้งหมด` : ""));
  if (topPillarEntry) {
    bullets.push(`งบประมาณส่วนใหญ่กระจุกตัวใน ${topPillarEntry[0]} คิดเป็น ${Math.round((topPillarEntry[1] / filteredBudget) * 100)}% ของมุมมองปัจจุบัน`);
  }
  if (maxProject) {
    bullets.push(`โครงการที่ใช้งบสูงสุดคือ ${maxProject.name} จำนวน ${formatNumber(maxProject.budget)} บาท`);
  }
  bullets.push(`งบประมาณเฉลี่ยต่อโครงการอยู่ที่ ${formatNumber(Math.round(avgBudget))} บาท`);
  bullets.push(yearCount > 1 ? "โครงการในมุมมองนี้ครอบคลุม 2 ปีงบประมาณ" : `โครงการทั้งหมดอยู่ในปีงบประมาณ ${filtered[0]?.year ?? "-"}`);

  return bullets;
}

export function getExecutiveInsights(allProjects: Project[]) {
  const totalBudget = allProjects.reduce((sum, item) => sum + item.budget, 0);
  const cyber = allProjects.filter((item) => [3, 4, 5].includes(item.id));
  const cyberBudget = cyber.reduce((sum, item) => sum + item.budget, 0);
  const governance = allProjects.filter((item) => item.pillar === "Smart Governance");
  const governanceBudget = governance.reduce((sum, item) => sum + item.budget, 0);
  const year2570 = allProjects.filter((item) => item.year === "2570");

  return [
    `โครงการที่ 3, 4 และ 5 เป็นงานด้านไซเบอร์ทั้งหมด รวมงบ ${formatNumber(cyberBudget)} บาท หรือ ${Math.round((cyberBudget / totalBudget) * 100)}% ของงบรวม จึงเป็นจุดตัดสินใจสำคัญที่สุด`,
    `หากเลือกดำเนินการเฉพาะโครงการที่ 5 แบบรวมศูนย์ จะประหยัดได้ประมาณ ${formatNumber(3_300_000)} บาท เมื่อเทียบกับการทำทั้ง 3 โครงการ`,
    `Smart Governance ใช้งบ ${formatNumber(governanceBudget)} บาท หรือ ${Math.round((governanceBudget / totalBudget) * 100)}% ของงบทั้งหมด ทำให้งบกระจุกตัวชัดเจน`,
    `ปีงบประมาณ 2570 มีเพียง ${year2570.length} โครงการ คือโครงการที่ 4 จึงควรพิจารณาความจำเป็นเชิงยุทธศาสตร์แยกต่างหาก`,
    "โครงการที่ 1 และ 2 เป็นโครงการที่มีแรงผลักจากข้อกำหนดและมาตรฐานภาครัฐ จึงควรจัดเป็นงานเร่งด่วนก่อนงานเสริมอื่น",
  ];
}
