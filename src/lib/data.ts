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
    riskLevel: "medium",
    sdgGoals: [16, 17],
    tags: ["PDPA", "ข้อมูลส่วนบุคคล", "กฎหมาย"],
    description: "โครงการจัดหาระบบบริหารจัดการข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ครอบคลุมการจัดเก็บ ประมวลผล และเผยแพร่ข้อมูลส่วนบุคคลของประชาชนและบุคลากรเทศบาล",
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
    riskLevel: "low",
    sdgGoals: [9, 11],
    tags: ["เว็บไซต์", "บริการประชาชน"],
    description: "พัฒนาเว็บไซต์เทศบาลนครนครสวรรค์แบบมีปฏิสัมพันธ์ (Interactive) เพื่อให้ประชาชนเข้าถึงข้อมูลโครงการเมืองอัจฉริยะและบริการออนไลน์ได้สะดวกยิ่งขึ้น",
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
    riskLevel: "high",
    sdgGoals: [16],
    tags: ["ไซเบอร์", "ความปลอดภัย", "Phase1"],
    description: "โครงการจัดหาระบบรักษาความมั่นคงปลอดภัยไซเบอร์ระยะที่ 1 ครอบคลุมการตรวจจับภัยคุกคามทางไซเบอร์ การป้องกันเครือข่ายของเทศบาล และการสร้างความตระหนักรู้ด้านความปลอดภัยทางดิจิทัลให้กับบุคลากร",
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
    riskLevel: "high",
    sdgGoals: [16],
    tags: ["ไซเบอร์", "ความปลอดภัย", "Phase2"],
    description: "ระยะที่ 2 ของโครงการไซเบอร์ซิเคียวริตี้ เน้นการติดตั้ง SOC (Security Operations Center) และระบบแจ้งเตือนภัยคุกคามอัตโนมัติ เพื่อยกระดับความปลอดภัยของเครือข่ายทั้งหมด",
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
    riskLevel: "high",
    sdgGoals: [16, 17],
    tags: ["ไซเบอร์", "รวมศูนย์", "งบสูง"],
    description: "ระบบบริหารจัดการความมั่นคงปลอดภัยไซเบอร์แบบรวมศูนย์ (Unified SOC) ครอบคลุมทุกหน่วยงาน รวมถึง Firewall, Endpoint Protection, SIEM และ Incident Response Plan เพื่อปกป้องข้อมูลสำคัญของเทศบาลและประชาชน",
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
    riskLevel: "low",
    sdgGoals: [8, 9],
    tags: ["ดิจิทัล", "แพลตฟอร์ม", "เศรษฐกิจ"],
    description: "จ้างที่ปรึกษาเพื่อพัฒนาแพลตฟอร์มดิจิทัลสำหรับส่งเสริมเศรษฐกิจท้องถิ่น รวมถึงระบบ E-Commerce, E-Market และการเชื่อมโยงผู้ประกอบการในพื้นที่กับตลาดดิจิทัล",
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
    riskLevel: "low",
    sdgGoals: [4, 17],
    tags: ["นโยบาย", "สื่อสาร", "ประชาชน"],
    description: "จ้างที่ปรึกษาด้านการสื่อสารนโยบายเมืองอัจฉริยะให้ประชาชนเข้าใจและมีส่วนร่วม ครอบคลุมการสร้างสื่อประชาสัมพันธ์ การจัดเวทีเสวนา และสื่อออนไลน์สำหรับประชาชนและภาคเอกชน",
  },
];

export const filterOptions = {
  years: [...new Set(projects.map((item) => item.year))].sort(),
  pillars: [...new Set(projects.map((item) => item.pillar))].sort(),
  categories: [...new Set(projects.map((item) => item.category))].sort(),
  statuses: [] as string[],
  budgetRange: [Math.min(...projects.map((item) => item.budget)), Math.max(...projects.map((item) => item.budget))] as [number, number],
};

export function getKPIData(all: Project[], filtered: Project[]) {
  const totalBudget = filtered.reduce((s, p) => s + p.budget, 0);
  const allBudget = all.reduce((s, p) => s + p.budget, 0);
  const byPillar = new Map<string, number>();
  filtered.forEach((p) => byPillar.set(p.pillar, (byPillar.get(p.pillar) ?? 0) + p.budget));
  const pillarCount = byPillar.size;
  const budgetUtil = allBudget ? Math.round((totalBudget / allBudget) * 100) : 0;
  const categoryCount = new Set(filtered.map((p) => p.category)).size;
  const avgBudget = filtered.length ? Math.round(totalBudget / filtered.length) : 0;
  return [
    { id: "total", label: "โครงการทั้งหมด", value: filtered.length, unit: "โครงการ", change: 0, trend: "flat" as const, sparkline: [3, 4, 5, 5, 6, 6, 7], accent: "cyan", icon: "🏙️" },
    { id: "budget", label: "งบประมาณรวม", value: (totalBudget / 1_000_000).toFixed(2), unit: "ล้านบาท", change: 0, trend: "flat" as const, sparkline: [2, 3, 4, 5, 5, 7, 8], accent: "violet", icon: "💰" },
    { id: "util", label: "สัดส่วนงบ (กรอง/ทั้งหมด)", value: budgetUtil, unit: "%", change: 0, trend: "flat" as const, sparkline: [80, 78, 82, 75, 74, 73, budgetUtil], accent: "green", icon: "📊" },
    { id: "pillar", label: "จำนวนยุทธศาสตร์", value: pillarCount, unit: "ยุทธศาสตร์", change: 0, trend: "flat" as const, sparkline: [1, 2, 2, 3, 3, 4, pillarCount], accent: "amber", icon: "🎯" },
    { id: "category", label: "จำนวนหมวดหมู่", value: categoryCount, unit: "หมวดหมู่", change: 0, trend: "flat" as const, sparkline: [1, 1, 2, 2, 3, 3, categoryCount], accent: "emerald", icon: "📁" },
    { id: "avgbudget", label: "งบเฉลี่ย/โครงการ", value: (avgBudget / 1_000_000).toFixed(2), unit: "ล้านบาท", change: 0, trend: "flat" as const, sparkline: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, avgBudget / 1_000_000], accent: "rose", icon: "📐" },
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
  const topPillarBudget = Math.max(...["Smart Governance","Smart Living","Smart Economy","Smart People"].map((pl) => projects.filter((p) => p.pillar === pl).reduce((s, p) => s + p.budget, 0)));
  const concentration = total ? Math.round((topPillarBudget / total) * 100) : 0;
  const insights: AIInsight[] = [];
  if (atRisk.length > 0) insights.push({ type: "warning", title: `โครงการที่มีระดับความเสี่ยงสูง: ${atRisk.length} โครงการ`, description: `โครงการ: ${atRisk.map((p) => `#${p.id} ${p.name}`).join(" / ")}`, affectedProjects: atRisk.map((p) => p.id), urgency: "high" });
  if (concentration > 60) insights.push({ type: "info", title: `งบประมาณกระจุกตัวใน 1 ยุทธศาสตร์ คิดเป็น ${concentration}%`, description: `งบประมาณส่วนใหญ่อยู่ในยุทธศาสตร์ที่มีสัดส่วนสูงสุด (${concentration}% ของงบในมุมมองนี้)`, urgency: "medium" });
  const cyberProjects = projects.filter((p) => p.category === "เครือข่ายไซเบอร์");
  if (cyberProjects.length >= 2) {
    const cyberBudget = cyberProjects.reduce((s, p) => s + p.budget, 0);
    insights.push({ type: "info", title: `โครงการหมวดเครือข่ายไซเบอร์: ${cyberProjects.length} โครงการ`, description: `รวมงบประมาณ ${cyberProjects.length} โครงการในหมวดนี้ทั้งสิ้น ${(cyberBudget / 1_000_000).toFixed(2)} ล้านบาท (${Math.round((cyberBudget / total) * 100)}% ของงบรวม)`, affectedProjects: cyberProjects.map((p) => p.id), urgency: "low" });
  }
  const sdgCount = new Set(projects.flatMap((p) => p.sdgGoals ?? [])).size;
  if (sdgCount > 0) insights.push({ type: "info", title: `ครอบคลุม ${sdgCount} SDG Goals`, description: `โครงการในมุมมองนี้เกี่ยวข้องกับเป้าหมาย SDG จำนวน ${sdgCount} ข้อ`, urgency: "low" });
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
      children: items.map((p, i) => ({ label: p.name, value: p.budget, color: pillarColors[pillar] ?? "#94a3b8", x: offsetX, y: i * (100 / items.length), width: pillarWidth, height: 100 / items.length })),
    });
    offsetX += pillarWidth;
  });
  return nodes;
}

export function getGanttData(projects: Project[]): GanttRow[] {
  return projects.map((p, i) => {
    return { id: p.id, name: p.name, pillar: p.pillar, start: 1, end: 12, progress: 0, status: "active" };
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

