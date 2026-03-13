import type { AIInsight, GanttRow, Project, RadarDimension, ScenarioResult, TreemapNode } from "@/types/project";

export const projects: Project[] = [
  {
    id: 1,
    name: "จัดหาระบบบริหารจัดการข้อมูลส่วนบุคคล (PDPA)",
    budget: 1_000_000,
    year: "2569",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "ความปลอดภัยข้อมูล",
    status: "active",
    completionPct: 65,
    startDate: "2569-01",
    endDate: "2569-09",
    district: "เมืองนครสวรรค์",
    lat: 15.7047,
    lng: 100.1367,
    riskLevel: "medium",
    sdgGoals: [16, 17],
    tags: ["PDPA", "ข้อมูลส่วนบุคคล", "กฎหมาย"],
  },
  {
    id: 2,
    name: "จัดทำเว็บไซต์แบบมีปฏิสัมพันธ์ (Interactive Website)",
    budget: 500_000,
    year: "2569",
    pillar: "Smart Living",
    pillarTh: "การดำรงชีวิตอัจฉริยะ",
    category: "ความปลอดภัยข้อมูล",
    status: "completed",
    completionPct: 100,
    startDate: "2569-01",
    endDate: "2569-06",
    district: "เมืองนครสวรรค์",
    lat: 15.7050,
    lng: 100.1400,
    riskLevel: "low",
    sdgGoals: [9, 11],
    tags: ["เว็บไซต์", "บริการประชาชน"],
  },
  {
    id: 3,
    name: "ระบบรักษาความมั่นคงปลอดภัยไซเบอร์ ระยะที่ 1",
    budget: 1_500_000,
    year: "2569",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "เครือข่ายไซเบอร์",
    status: "active",
    completionPct: 45,
    startDate: "2569-03",
    endDate: "2569-12",
    district: "เมืองนครสวรรค์",
    lat: 15.7060,
    lng: 100.1350,
    riskLevel: "high",
    sdgGoals: [16],
    tags: ["ไซเบอร์", "ความปลอดภัย", "Phase1"],
  },
  {
    id: 4,
    name: "ระบบรักษาความมั่นคงปลอดภัยไซเบอร์ ระยะที่ 2",
    budget: 1_800_000,
    year: "2570",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "เครือข่ายไซเบอร์",
    status: "delayed",
    completionPct: 10,
    startDate: "2570-01",
    endDate: "2570-09",
    district: "เมืองนครสวรรค์",
    lat: 15.7060,
    lng: 100.1350,
    riskLevel: "high",
    sdgGoals: [16],
    tags: ["ไซเบอร์", "ความปลอดภัย", "Phase2"],
  },
  {
    id: 5,
    name: "ระบบรักษาความมั่นคงปลอดภัยไซเบอร์แบบรวมศูนย์",
    budget: 3_000_000,
    year: "2569",
    pillar: "Smart Governance",
    pillarTh: "การบริหารจัดการอัจฉริยะ",
    category: "เครือข่ายไซเบอร์",
    status: "at-risk",
    completionPct: 30,
    startDate: "2569-04",
    endDate: "2570-03",
    district: "เมืองนครสวรรค์",
    lat: 15.7055,
    lng: 100.1345,
    riskLevel: "high",
    sdgGoals: [16, 17],
    tags: ["ไซเบอร์", "รวมศูนย์", "งบสูง"],
  },
  {
    id: 6,
    name: "จ้างที่ปรึกษาพัฒนาแพลตฟอร์มดิจิทัล",
    budget: 500_000,
    year: "2569",
    pillar: "Smart Economy",
    pillarTh: "เศรษฐกิจอัจฉริยะ",
    category: "ที่ปรึกษาและนโยบาย",
    status: "active",
    completionPct: 80,
    startDate: "2569-02",
    endDate: "2569-08",
    district: "พยุหะคีรี",
    lat: 15.4800,
    lng: 100.1300,
    riskLevel: "low",
    sdgGoals: [8, 9],
    tags: ["ดิจิทัล", "แพลตฟอร์ม", "เศรษฐกิจ"],
  },
  {
    id: 7,
    name: "จ้างที่ปรึกษาการสื่อสารนโยบายเมืองอัจฉริยะ",
    budget: 500_000,
    year: "2569",
    pillar: "Smart People",
    pillarTh: "พลเมืองอัจฉริยะ",
    category: "ที่ปรึกษาและนโยบาย",
    status: "completed",
    completionPct: 100,
    startDate: "2569-01",
    endDate: "2569-05",
    district: "ตาคลี",
    lat: 15.2640,
    lng: 100.3420,
    riskLevel: "low",
    sdgGoals: [4, 17],
    tags: ["นโยบาย", "สื่อสาร", "ประชาชน"],
  },
];

export const filterOptions = {
  years: [...new Set(projects.map((item) => item.year))].sort(),
  pillars: [...new Set(projects.map((item) => item.pillar))].sort(),
  categories: [...new Set(projects.map((item) => item.category))].sort(),
  statuses: [...new Set(projects.map((item) => item.status).filter(Boolean))] as string[],
  districts: [...new Set(projects.map((item) => item.district).filter(Boolean))].sort() as string[],
  budgetRange: [Math.min(...projects.map((item) => item.budget)), Math.max(...projects.map((item) => item.budget))] as [number, number],
};

export function getKPIData(all: Project[], filtered: Project[]) {
  const totalBudget = filtered.reduce((s, p) => s + p.budget, 0);
  const allBudget = all.reduce((s, p) => s + p.budget, 0);
  const completed = filtered.filter((p) => p.status === "completed").length;
  const atRisk = filtered.filter((p) => p.riskLevel === "high" || p.status === "at-risk" || p.status === "delayed").length;
  const avgCompletion = filtered.length ? Math.round(filtered.reduce((s, p) => s + (p.completionPct ?? 0), 0) / filtered.length) : 0;
  const budgetUtil = allBudget ? Math.round((totalBudget / allBudget) * 100) : 0;
  return [
    { id: "total", label: "โครงการทั้งหมด", value: filtered.length, unit: "โครงการ", change: 0, trend: "flat" as const, sparkline: [3, 4, 5, 5, 6, 6, 7], accent: "cyan", icon: "🏙️" },
    { id: "budget", label: "งบประมาณรวม", value: (totalBudget / 1_000_000).toFixed(2), unit: "ล้านบาท", change: 12.4, trend: "up" as const, sparkline: [2, 3, 4, 5, 5, 7, 8], accent: "violet", icon: "💰" },
    { id: "util", label: "Budget Utilization", value: budgetUtil, unit: "%", change: -2.1, trend: "down" as const, sparkline: [80, 78, 82, 75, 74, 73, budgetUtil], accent: "green", icon: "📊" },
    { id: "completion", label: "ความคืบหน้าเฉลี่ย", value: avgCompletion, unit: "%", change: 5.3, trend: "up" as const, sparkline: [30, 35, 40, 45, 50, 55, avgCompletion], accent: "amber", icon: "✅" },
    { id: "risk", label: "โครงการความเสี่ยงสูง", value: atRisk, unit: "โครงการ", change: 1, trend: "up" as const, sparkline: [1, 1, 2, 2, 2, 3, atRisk], accent: "rose", icon: "⚠️" },
    { id: "completed", label: "โครงการเสร็จสมบูรณ์", value: completed, unit: "โครงการ", change: 1, trend: "up" as const, sparkline: [0, 0, 0, 1, 1, 1, completed], accent: "emerald", icon: "🎯" },
  ];
}

export function getRadarData(projects: Project[]): RadarDimension[] {
  const total = projects.reduce((s, p) => s + p.budget, 0) || 1;
  const govBudget = projects.filter((p) => p.pillar === "Smart Governance").reduce((s, p) => s + p.budget, 0);
  const livingBudget = projects.filter((p) => p.pillar === "Smart Living").reduce((s, p) => s + p.budget, 0);
  const ecoScore = projects.filter((p) => p.pillar === "Smart Economy").length * 25;
  const peopleScore = projects.filter((p) => p.pillar === "Smart People").length * 25;
  const cyberBudget = projects.filter((p) => p.category === "เครือข่ายไซเบอร์").reduce((s, p) => s + p.budget, 0);
  return [
    { label: "Infrastructure", labelTh: "โครงสร้างพื้นฐาน", score: Math.min(100, Math.round((govBudget / total) * 120)), maxScore: 100 },
    { label: "Mobility", labelTh: "การเดินทาง", score: Math.min(100, Math.round((livingBudget / total) * 160) + 20), maxScore: 100 },
    { label: "Environment", labelTh: "สิ่งแวดล้อม", score: Math.min(100, Math.round(peopleScore) + 15), maxScore: 100 },
    { label: "Public Safety", labelTh: "ความปลอดภัย", score: Math.min(100, Math.round((cyberBudget / total) * 130)), maxScore: 100 },
    { label: "Digital Gov", labelTh: "รัฐบาลดิจิทัล", score: Math.min(100, Math.round((govBudget / total) * 100) + 10), maxScore: 100 },
    { label: "Economy", labelTh: "เศรษฐกิจ", score: Math.min(100, Math.round(ecoScore) + 20), maxScore: 100 },
  ];
}

export function getAIInsights(projects: Project[]): AIInsight[] {
  const total = projects.reduce((s, p) => s + p.budget, 0);
  const atRisk = projects.filter((p) => p.riskLevel === "high");
  const delayed = projects.filter((p) => p.status === "delayed");
  const topPillarBudget = Math.max(...["Smart Governance","Smart Living","Smart Economy","Smart People"].map((pl) => projects.filter((p) => p.pillar === pl).reduce((s, p) => s + p.budget, 0)));
  const concentration = total ? Math.round((topPillarBudget / total) * 100) : 0;
  const insights: AIInsight[] = [];
  if (atRisk.length > 0) insights.push({ type: "warning", title: `${atRisk.length} โครงการมีความเสี่ยงสูง`, description: `โครงการ: ${atRisk.map((p) => `#${p.id}`).join(", ")} ต้องการการติดตามอย่างใกล้ชิด`, affectedProjects: atRisk.map((p) => p.id), urgency: "high" });
  if (delayed.length > 0) insights.push({ type: "risk", title: `${delayed.length} โครงการล่าช้ากว่าแผน`, description: `โครงการ ${delayed.map((p) => p.name).join(", ")} มีความเสี่ยงต่อการเบิกจ่ายงบประมาณ`, affectedProjects: delayed.map((p) => p.id), urgency: "high" });
  if (concentration > 60) insights.push({ type: "risk", title: `งบประมาณกระจุกตัว ${concentration}%`, description: "งบประมาณส่วนใหญ่อยู่ในยุทธศาสตร์เดียว อาจทำให้ขาดความสมดุลเชิงนโยบาย", urgency: "medium" });
  insights.push({ type: "opportunity", title: "ศักยภาพการรวมโครงการไซเบอร์", description: "โครงการด้านไซเบอร์ 3 โครงการ อาจรวมกันได้เพื่อประหยัดงบประมาณประมาณ 3.3 ล้านบาท", affectedProjects: [3, 4, 5], urgency: "medium" });
  insights.push({ type: "info", title: "SDG Alignment ดีขึ้น", description: "โครงการครอบคลุม SDG Goals 8 ข้อ ซึ่งสอดคล้องกับเป้าหมายการพัฒนาอย่างยั่งยืน", urgency: "low" });
  return insights;
}

export function getTreemapData(projects: Project[]): TreemapNode[] {
  const pillarColors: Record<string, string> = { "Smart Governance": "#38bdf8", "Smart Living": "#a78bfa", "Smart Economy": "#34d399", "Smart People": "#f59e0b" };
  const grouped = new Map<string, Project[]>();
  projects.forEach((p) => { const list = grouped.get(p.pillar) ?? []; list.push(p); grouped.set(p.pillar, list); });
  const total = projects.reduce((s, p) => s + p.budget, 0) || 1;
  const nodes: TreemapNode[] = [];
  let offsetX = 0;
  grouped.forEach((items, pillar) => {
    const pillarBudget = items.reduce((s, p) => s + p.budget, 0);
    const pillarWidth = (pillarBudget / total) * 100;
    nodes.push({
      label: pillar, value: pillarBudget, color: pillarColors[pillar] ?? "#94a3b8",
      x: offsetX, y: 0, width: pillarWidth, height: 100,
      children: items.map((p, i) => ({ label: p.name.substring(0, 20), value: p.budget, color: pillarColors[pillar] ?? "#94a3b8", x: offsetX, y: i * (100 / items.length), width: pillarWidth, height: 100 / items.length })),
    });
    offsetX += pillarWidth;
  });
  return nodes;
}

export function getGanttData(projects: Project[]): GanttRow[] {
  return projects.map((p) => {
    const startMonth = p.startDate ? parseInt(p.startDate.split("-")[1] ?? "1") : 1;
    const endMonth = p.endDate ? parseInt(p.endDate.split("-")[1] ?? "12") : 12;
    return { id: p.id, name: p.name, pillar: p.pillar, start: startMonth, end: endMonth, progress: p.completionPct ?? 0, status: p.status ?? "active" };
  });
}

export function getScenarioSimulation(projects: Project[], increasePercent: number): ScenarioResult[] {
  const pillarGroups = new Map<string, Project[]>();
  projects.forEach((p) => { const list = pillarGroups.get(p.pillar) ?? []; list.push(p); pillarGroups.set(p.pillar, list); });
  const results: ScenarioResult[] = [];
  pillarGroups.forEach((items, pillar) => {
    const currentBudget = items.reduce((s, p) => s + p.budget, 0);
    const simulatedBudget = Math.round(currentBudget * (1 + increasePercent / 100));
    const benefitScore = Math.min(100, Math.round((simulatedBudget / 1_000_000) * 8 + items.length * 12));
    results.push({ label: pillar, currentBudget, simulatedBudget, benefitScore, pillar });
  });
  return results.sort((a, b) => b.benefitScore - a.benefitScore);
}

