# System Documentation: Nakhon Sawan Smart City Command Center Dashboard

**Version:** 2.0 — Production-Grade  
**Last Updated:** 2026-03  
**Stack:** Next.js 14 App Router · TypeScript · React 18 · Custom CSS Glassmorphism

เอกสารฉบับนี้ครอบคลุมสถาปัตยกรรม, โมดูลทั้งหมด, และแนวทางพัฒนาต่อสำหรับระบบ Smart City Executive Dashboard ระดับ Production

---

## 1. Project Overview

ระบบ Command Center Dashboard สำหรับผู้บริหารเทศบาลนครนครสวรรค์ รวมทุก Analytics Layer ไว้ในที่เดียว:

| Feature | คำอธิบาย |
|---|---|
| **KPI Cards + Sparkline** | 6 ตัวชี้วัดหลัก พร้อม trend arrow, % change, และ mini sparkline chart |
| **Strategic Radar Chart** | ดัชนีความสมดุลเมืองอัจฉริยะ 6 มิติ (SVG Custom) |
| **AI Decision Intelligence** | Panel แสดง Insights อัตโนมัติ จำแนกตาม urgency (high/medium/low) |
| **Budget Treemap** | Treemap แสดงสัดส่วนงบประมาณตามยุทธศาสตร์และโครงการ |
| **Gantt Chart** | Timeline ความคืบหน้าโครงการพร้อม status colors |
| **Scenario Simulation** | จำลองสถานการณ์ "ถ้างบเพิ่ม X% ยุทธศาสตร์ไหนได้ประโยชน์สูงสุด" |
| **Tab Navigation** | แบ่งเป็น 5 Tab: ภาพรวม KPI / วิเคราะห์เชิงลึก / AI Intelligence / ศูนย์สื่อ / รายงาน |
| **Display Modes** | Default / Dark+ / Presentation / Fullscreen |
| **Media Center + Search** | ค้นหาและกรองสื่อตามประเภท พร้อม metadata support |
| **Report Export** | CSV, Executive Report (.txt), Deep Analysis (.txt) |

---

## 2. Technology Stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Language:** TypeScript (strict)
- **Styling:** CSS3 Custom Glassmorphism — zero UI framework dependency
- **Charts:** Custom SVG + HTML (ไม่ใช้ recharts/chart.js เพื่อ performance)
- **File System:** Node.js `fs` / `path` (Server-side only)
- **API:** Next.js Route Handlers

---

## 3. Directory Structure

```text
nextjs-dashboard/
├── src/
│   ├── app/
│   │   ├── api/media/[name]/route.ts   # Media file server with Content-Type + UTF-8
│   │   ├── globals.css                  # All styles: Glassmorphism, KPI, Radar, Gantt, Treemap
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Server Component entry — loads data, passes to DashboardApp
│   │
│   ├── components/dashboard/
│   │   └── dashboard-app.tsx            # Main Client Component (all state + UI)
│   │
│   ├── lib/
│   │   ├── data.ts       # Mock data + getKPIData, getRadarData, getAIInsights,
│   │   │                 #   getTreemapData, getGanttData, getScenarioSimulation,
│   │   │                 #   getMediaFiles
│   │   ├── filters.ts    # applyFilters() — pure function, filter by all dimensions
│   │   ├── insights.ts   # getMetrics, getExecutiveSummary, formatNumber
│   │   └── reports.ts    # buildCsv, buildExecutiveReport, buildDeepAnalysis
│   │
│   └── types/project.ts  # All TypeScript types (see Section 4)
│
├── Source/               # Local media files (PDF, MP4, PNG, etc.)
├── system-document.md    # This file
├── package.json
└── tsconfig.json
```

---

## 4. TypeScript Types (`src/types/project.ts`)

```typescript
Project          // id, name, budget, year, pillar, pillarTh, category
                 // + status, completionPct, startDate, endDate
                 // + district, lat, lng, riskLevel, sdgGoals, tags

Filters          // query, years[], pillars[], categories[], budgetRange

MediaFile        // name, type, ext, url, textContent
                 // + projectId, date, category, tags, location, description

KPICard          // id, label, value, unit, change, trend, sparkline[], accent, icon
RadarDimension   // label, labelTh, score, maxScore
AIInsight        // type, title, description, affectedProjects[], urgency
TreemapNode      // label, value, color, children[], x, y, width, height
GanttRow         // id, name, pillar, start, end, progress, status
DisplayMode      // "default" | "dark" | "presentation" | "fullscreen"
UserRole         // "admin" | "analyst" | "executive" | "viewer"
ScenarioResult   // label, currentBudget, simulatedBudget, benefitScore, pillar
```

---

## 5. Data Layer — `src/lib/data.ts`

### ฟังก์ชัน Helper ทั้งหมด

| ฟังก์ชัน | Input | Output | คำอธิบาย |
|---|---|---|---|
| `getKPIData(all, filtered)` | Project[] x2 | KPICard[] (6 ตัว) | คำนวณ KPI หลัก |
| `getRadarData(projects)` | Project[] | RadarDimension[] (6 มิติ) | คำนวณ Smart City Score |
| `getAIInsights(projects)` | Project[] | AIInsight[] | สร้าง Insight อัตโนมัติ |
| `getTreemapData(projects)` | Project[] | TreemapNode[] | จัดกลุ่มงบตามยุทธศาสตร์ |
| `getGanttData(projects)` | Project[] | GanttRow[] | แปลง startDate/endDate เป็น month index |
| `getScenarioSimulation(projects, pct)` | Project[], number | ScenarioResult[] | จำลองเพิ่มงบ X% |
| `getMediaFiles()` | — | MediaFile[] | อ่านไฟล์จาก `Source/` folder |

### การเพิ่มข้อมูล Project
แก้ไข array `projects` ใน `data.ts` โดยเพิ่ม field ใหม่ตาม type `Project`:
```typescript
{
  id: 8,
  name: "ชื่อโครงการ",
  budget: 2_000_000,
  year: "2570",
  pillar: "Smart Mobility",
  pillarTh: "การเดินทางอัจฉริยะ",
  category: "โครงสร้างพื้นฐาน",
  status: "active",
  completionPct: 20,
  startDate: "2570-01",
  endDate: "2570-12",
  riskLevel: "medium",
  sdgGoals: [11],
  tags: ["mobility", "transport"],
}
```

---

## 6. Component Architecture — `dashboard-app.tsx`

### State ที่จัดการ

| State | Type | คำอธิบาย |
|---|---|---|
| `filters` | Filters | ตัวกรองหลักทุกมิติ |
| `activeTab` | ActiveTab | Tab ที่แสดงอยู่ |
| `displayMode` | DisplayMode | โหมดการแสดงผล |
| `mediaSearch` | string | คำค้นหาไฟล์สื่อ |
| `mediaTypeFilter` | string | ประเภทสื่อที่กรอง |
| `scenarioPct` | number | % เพิ่มงบประมาณ (Scenario Simulation) |
| `isFullscreen` | boolean | สถานะ Fullscreen |

### Derived Data (useMemo)
```
filteredProjects → metrics → summaryBullets
                → kpiData, radarData, aiInsights
                → treemapData, ganttData, scenarioData
                → pillarData, projectBars, categoryData, yearPillarMatrix
                → csvText, executiveReport, deepAnalysis
                → mediaCounts, filteredMedia
```

### Sub-Components ทั้งหมด

| Component | คำอธิบาย |
|---|---|
| `KPICard` | KPI card พร้อม icon, trend arrow, sparkline SVG |
| `RadarChart` | Custom SVG Radar (6 axes) |
| `AIInsightCard` | Insight card จำแนกตาม type/urgency |
| `TreemapChart` | Budget treemap แบบ proportional flex layout |
| `GanttChart` | Project timeline พร้อม progress bar |
| `ScenarioChart` | Bar chart แสดง benefit score จาก simulation |
| `Panel` | Generic glass panel พร้อม accent color |
| `FilterChecklist` | Filter toggle buttons |
| `MediaBlock` | Media category block (video/audio/image/doc) |
| `ReportCard` | Report download card |

---

## 7. Display Modes

| Mode | CSS Class | คำอธิบาย |
|---|---|---|
| Default | — | โหมดปกติ |
| Dark+ | `.modeDark` | `filter: brightness(0.88) contrast(1.08)` |
| Presentation | `.modePresentation` | Font ใหญ่ขึ้น เหมาะสำหรับนำเสนอ |
| Fullscreen | `.fullscreenMode` + Web Fullscreen API | ใช้ `document.requestFullscreen()` |

---

## 8. Styling System (`globals.css`)

### CSS Variables
```css
--bg, --bg-soft, --panel, --panel-2, --border
--text, --muted
--cyan, --violet, --green, --amber
```

### Color Coding (border-left)
| สี | Section |
|---|---|
| `#38bdf8` cyan | Hero, Treemap, AI Panel |
| `#a78bfa` violet | Charts Grid |
| `#34d399` green | Report Center, Scenario |
| `#f59e0b` amber | Data Table, Gantt |
| `#f472b6` pink | Media Center |
| `#f87171` red | AI Decision Panel |
| `#22d3ee` teal | Quick Access |

---

## 9. แนวทางพัฒนาต่อยอด

### 9.1 เชื่อมต่อ Database จริง (PostgreSQL / Supabase)
1. ติดตั้ง `@supabase/supabase-js` หรือ `prisma`
2. ใน `page.tsx` (Server Component) เปลี่ยน `import { projects }` เป็น `await supabase.from('projects').select('*')`
3. `data.ts` ยังคงใช้ helper functions เดิมได้ทั้งหมด — เปลี่ยนแค่ data source

### 9.2 เพิ่ม Authentication (NextAuth.js)
1. `npm install next-auth`
2. สร้าง `src/app/api/auth/[...nextauth]/route.ts`
3. ห่อ `DashboardApp` ด้วย role check ตาม `UserRole` type ที่มีอยู่แล้ว
4. เพิ่ม middleware `middleware.ts` ที่ root เพื่อ protect routes

### 9.3 เพิ่ม CSV/Excel Import
1. ติดตั้ง `papaparse` (CSV) หรือ `xlsx` (Excel)
2. สร้าง `src/app/api/import/route.ts` สำหรับ POST endpoint
3. เพิ่ม upload form ใน sidebar หรือ Tab รายงาน

### 9.4 เพิ่ม Geospatial Map (Leaflet)
```bash
npm install react-leaflet leaflet @types/leaflet
```
1. สร้าง `MapView` component ใน `src/components/dashboard/`
2. ใช้ `dynamic import` เพื่อหลีกเลี่ยง SSR error: `const MapView = dynamic(() => import('./MapView'), { ssr: false })`
3. ใช้ `lat/lng` จาก `Project` type ที่มีอยู่แล้ว

### 9.5 Table Virtualization (Large Dataset)
```bash
npm install react-window
```
แทนที่ `<table>` ใน DataTable section ด้วย `FixedSizeList` หรือ `VariableSizeList`

### 9.6 เพิ่ม AI Insights จาก LLM จริง
1. สร้าง `src/app/api/insights/route.ts`
2. เรียก OpenAI API หรือ local LLM โดยส่ง `filteredProjects` เป็น context
3. แทนที่ `getAIInsights()` ใน `data.ts` ด้วย `fetch('/api/insights', { method: 'POST', body: JSON.stringify(projects) })`

---

## 10. Development & Deployment

```bash
# Local Development
cd nextjs-dashboard
npm install
npm run dev       # http://localhost:3000

# Production Build
npm run build
npm run start

# Type Check Only
npx tsc --noEmit
```

### Known Constraints
- `getMediaFiles()` ใช้ hardcoded path ไปที่ `C:/Users/Patompong.l/Documents/รายงาน ผอ.หนึ่ง/Source` → ต้องแก้เป็น environment variable สำหรับ production deployment
- Thai characters ใน path อาจมีปัญหากับบาง Shell — ใช้ terminal โดยตรงหรือ VS Code terminal

---

*System Document v2.0 — Nakhon Sawan Smart City Command Center Dashboard*
