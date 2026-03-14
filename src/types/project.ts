export type Project = {
  id: number;
  name: string;
  budget: number;
  year: string;
  pillar: string;
  pillarTh: string;
  category: string;
  status?: "active" | "delayed" | "completed" | "at-risk";
  completionPct?: number;
  riskLevel?: "low" | "medium" | "high";
  sdgGoals?: number[];
  tags?: string[];
  description?: string;
};

export type KPICard = {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  change: number;
  trend: "up" | "down" | "flat";
  sparkline: number[];
  accent: string;
  icon: string;
};

export type RadarDimension = {
  label: string;
  labelTh: string;
  score: number;
  maxScore: number;
};

export type AIInsight = {
  type: "warning" | "opportunity" | "risk" | "info";
  title: string;
  description: string;
  affectedProjects?: number[];
  urgency: "high" | "medium" | "low";
};

export type TreemapNode = {
  label: string;
  value: number;
  color: string;
  children?: TreemapNode[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type GanttRow = {
  id: number;
  name: string;
  pillar: string;
  start: number;
  end: number;
  progress: number;
  status: string;
};

export type DisplayMode = "default" | "presentation" | "fullscreen";

export type UserRole = "admin" | "analyst" | "executive" | "viewer";

export type ScenarioResult = {
  label: string;
  currentBudget: number;
  simulatedBudget: number;
  benefitScore: number;
  pillar: string;
};

export type Filters = {
  query: string;
  years: string[];
  pillars: string[];
  categories: string[];
  statuses: string[];
  budgetRange: [number, number];
};

export type MediaFile = {
  name: string;
  type: "video" | "audio" | "image" | "document";
  ext: string;
  url: string;
  textContent?: string;
  projectId?: number;
  date?: string;
  category?: string;
  tags?: string[];
  location?: string;
  description?: string;
};
