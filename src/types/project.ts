export type Project = {
  id: number;
  name: string;
  budget: number;
  year: string;
  pillar: string;
  pillarTh: string;
  category: string;
};

export type Filters = {
  query: string;
  years: string[];
  pillars: string[];
  categories: string[];
  budgetRange: [number, number];
};

export type MediaFile = {
  name: string;
  type: "video" | "audio" | "image" | "document";
  ext: string;
  url: string;
  textContent?: string;
};
