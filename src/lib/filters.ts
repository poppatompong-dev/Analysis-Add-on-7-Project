import { Filters, Project } from "@/types/project";

export function applyFilters(projects: Project[], filters: Filters) {
  return projects.filter((item) => {
    const matchesQuery = filters.query.trim()
      ? item.name.toLowerCase().includes(filters.query.trim().toLowerCase())
      : true;
    const matchesYear = filters.years.length ? filters.years.includes(item.year) : true;
    const matchesPillar = filters.pillars.length ? filters.pillars.includes(item.pillar) : true;
    const matchesCategory = filters.categories.length ? filters.categories.includes(item.category) : true;
    const matchesBudget = item.budget >= filters.budgetRange[0] && item.budget <= filters.budgetRange[1];

    return matchesQuery && matchesYear && matchesPillar && matchesCategory && matchesBudget;
  });
}
