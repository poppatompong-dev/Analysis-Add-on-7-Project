"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { applyFilters } from "@/lib/filters";
import { buildCsv, buildDeepAnalysis, buildExecutiveReport } from "@/lib/reports";
import { formatNumber, getExecutiveSummary } from "@/lib/insights";
import { getKPIData, getRadarData, getAIInsights, getTreemapData, getGanttData, getScenarioSimulation } from "@/lib/data";
import type { AIInsight, DisplayMode, Filters, GanttRow, KPICard, MediaFile, Project, RadarDimension, ScenarioResult, TreemapNode } from "@/types/project";

type DashboardAppProps = {
  initialProjects: Project[];
  mediaFiles: MediaFile[];
  options: {
    years: string[];
    pillars: string[];
    categories: string[];
    statuses: string[];
    districts: string[];
    budgetRange: [number, number];
  };
  generatedAt: string;
};

type ReportView = "executive" | "analysis";
type ActiveTab = "overview" | "analytics" | "intelligence" | "media" | "reports" | "import";

const PILLAR_COLORS: Record<string, string> = {
  "Smart Governance": "#38bdf8",
  "Smart Living": "#a78bfa",
  "Smart Economy": "#34d399",
  "Smart People": "#f59e0b",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#34d399",
  completed: "#38bdf8",
  delayed: "#f87171",
  "at-risk": "#f59e0b",
};

const INSIGHT_COLORS: Record<string, string> = {
  warning: "#f59e0b",
  risk: "#f87171",
  opportunity: "#34d399",
  info: "#38bdf8",
};

export default function DashboardApp({ initialProjects, mediaFiles, options, generatedAt }: DashboardAppProps) {
  const defaultFilters: Filters = {
    query: "",
    years: options.years,
    pillars: options.pillars,
    categories: options.categories,
    statuses: [],
    districts: [],
    budgetRange: options.budgetRange,
  };

  const [allProjects, setAllProjects] = useState<Project[]>(initialProjects);
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const [reportView, setReportView] = useState<ReportView>("executive");
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("default");
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [scenarioPct, setScenarioPct] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ imported: number; warnings: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const filteredProjects = useMemo(() => applyFilters(allProjects, filters), [allProjects, filters]);
  const summaryBullets = useMemo(() => getExecutiveSummary(filteredProjects, allProjects), [filteredProjects, allProjects]);
  const csvText = useMemo(() => `\uFEFF${buildCsv(filteredProjects)}`, [filteredProjects]);
  const executiveReport = useMemo(() => buildExecutiveReport(filteredProjects, filters, generatedAt), [filteredProjects, filters, generatedAt]);
  const deepAnalysis = useMemo(() => buildDeepAnalysis(filteredProjects, filters, generatedAt), [filteredProjects, filters, generatedAt]);
  const kpiData = useMemo(() => getKPIData(allProjects, filteredProjects), [allProjects, filteredProjects]);
  const radarData = useMemo(() => getRadarData(filteredProjects), [filteredProjects]);
  const aiInsights = useMemo(() => getAIInsights(filteredProjects), [filteredProjects]);
  const treemapData = useMemo(() => getTreemapData(filteredProjects), [filteredProjects]);
  const ganttData = useMemo(() => getGanttData(filteredProjects), [filteredProjects]);
  const scenarioData = useMemo(() => getScenarioSimulation(filteredProjects, scenarioPct), [filteredProjects, scenarioPct]);

  const pillarData = useMemo(() => {
    const grouped = new Map<string, number>();
    filteredProjects.forEach((p) => grouped.set(p.pillar, (grouped.get(p.pillar) || 0) + p.budget));
    const total = Array.from(grouped.values()).reduce((s, v) => s + v, 0);
    let offset = 0;
    return Array.from(grouped.entries()).map(([label, value]) => {
      const ratio = total ? value / total : 0;
      const seg = { label, value, ratio, dash: `${ratio * 282.6} ${282.6 - ratio * 282.6}`, offset: -offset, color: PILLAR_COLORS[label] || "#94a3b8" };
      offset += ratio * 282.6;
      return seg;
    });
  }, [filteredProjects]);

  const projectBars = useMemo(() => {
    const max = Math.max(...filteredProjects.map((p) => p.budget), 1);
    return [...filteredProjects].sort((a, b) => b.budget - a.budget).map((p) => ({ ...p, width: (p.budget / max) * 100 }));
  }, [filteredProjects]);

  const filteredMedia = useMemo(() => mediaFiles.filter((m) => {
    const matchSearch = mediaSearch ? m.name.toLowerCase().includes(mediaSearch.toLowerCase()) : true;
    const matchType = mediaTypeFilter === "all" ? true : m.type === mediaTypeFilter;
    return matchSearch && matchType;
  }), [mediaFiles, mediaSearch, mediaTypeFilter]);

  const reportText = reportView === "executive" ? executiveReport : deepAnalysis;
  const modeClass = displayMode === "dark" ? "modeDark" : displayMode === "presentation" ? "modePresentation" : "";
  const totalBudget = filteredProjects.reduce((s, p) => s + p.budget, 0);
  const mediaCounts = {
    total: mediaFiles.length,
    video: mediaFiles.filter((m) => m.type === "video").length,
    audio: mediaFiles.filter((m) => m.type === "audio").length,
    image: mediaFiles.filter((m) => m.type === "image").length,
    document: mediaFiles.filter((m) => m.type === "document").length,
  };
  const TAB_LABELS: Record<ActiveTab, string> = {
    overview: "ภาพรวม", analytics: "วิเคราะห์", intelligence: "AI Insights",
    media: "ศูนย์สื่อ", reports: "รายงาน", import: "นำเข้าข้อมูล",
  };

  const handleFileImport = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/import", { method: "POST", body: form });
      const json = await res.json();
      if (json.success && json.projects) {
        setAllProjects((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newOnes = (json.projects as Project[]).filter((p) => !existingIds.has(p.id));
          return [...prev, ...newOnes];
        });
        setImportStatus({ imported: json.imported, warnings: json.warnings ?? [] });
      }
    } catch { /* silent */ }
  };

  return (
    <div className={`shell ${modeClass} ${isFullscreen ? "fullscreenMode" : ""}`}>
      <aside className="sidebar glass">
        <div className="sidebarLogo">
          <span className="sidebarLogoIcon">🏙️</span>
          <div className="sidebarLogoText">
            <strong>Smart City Dashboard</strong>
            <span>นครสวรรค์ Smart City</span>
          </div>
        </div>

        <div className="sidebarSection">
          <p className="sidebarSectionTitle">ค้นหา</p>
          <input className="input" value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="ชื่อโครงการ, คำสำคัญ..." />
        </div>

        <FilterChecklist label="ปีงบประมาณ" options={options.years} selected={filters.years}
          onToggle={(v) => setFilters((prev) => ({ ...prev, years: toggleValue(prev.years, v, options.years) }))} />
        <FilterChecklist label="ยุทธศาสตร์" options={options.pillars} selected={filters.pillars}
          onToggle={(v) => setFilters((prev) => ({ ...prev, pillars: toggleValue(prev.pillars, v, options.pillars) }))} />
        <FilterChecklist label="หมวดหมู่" options={options.categories} selected={filters.categories}
          onToggle={(v) => setFilters((prev) => ({ ...prev, categories: toggleValue(prev.categories, v, options.categories) }))} />

        {options.statuses.length > 0 && (
          <FilterChecklist label="สถานะโครงการ" options={options.statuses} selected={filters.statuses}
            onToggle={(v) => setFilters((prev) => ({ ...prev, statuses: toggleValue(prev.statuses, v, options.statuses) }))} />
        )}

        {options.districts.length > 0 && (
          <FilterChecklist label="อำเภอ" options={options.districts} selected={filters.districts}
            onToggle={(v) => setFilters((prev) => ({ ...prev, districts: toggleValue(prev.districts, v, options.districts) }))} />
        )}

        <div className="sidebarSection">
          <div className="fieldRow">
            <p className="sidebarSectionTitle">ช่วงงบประมาณ</p>
            <span className="fieldMeta">{formatNumber(filters.budgetRange[0])}–{formatNumber(filters.budgetRange[1])}</span>
          </div>
          <input type="range" min={options.budgetRange[0]} max={options.budgetRange[1]} step={100000}
            value={filters.budgetRange[0]}
            onChange={(e) => { const v=Number(e.target.value); setFilters((prev)=>({...prev,budgetRange:[Math.min(v,prev.budgetRange[1]),prev.budgetRange[1]]})); }} />
          <input type="range" min={options.budgetRange[0]} max={options.budgetRange[1]} step={100000}
            value={filters.budgetRange[1]}
            onChange={(e) => { const v=Number(e.target.value); setFilters((prev)=>({...prev,budgetRange:[prev.budgetRange[0],Math.max(v,prev.budgetRange[0])]})); }} />
          <div className="budgetFields">
            <input className="input" type="number" value={filters.budgetRange[0]}
              onChange={(e) => { const v=Number(e.target.value||0); setFilters((prev)=>({...prev,budgetRange:[Math.min(v,prev.budgetRange[1]),prev.budgetRange[1]]})); }} />
            <input className="input" type="number" value={filters.budgetRange[1]}
              onChange={(e) => { const v=Number(e.target.value||0); setFilters((prev)=>({...prev,budgetRange:[prev.budgetRange[0],Math.max(v,prev.budgetRange[0])]})); }} />
          </div>
        </div>

        <div className="resultSummary">
          <strong style={{color:"#7dd3fc"}}>{filteredProjects.length} / {allProjects.length} โครงการ</strong>
          <span>{formatNumber(totalBudget)} บาท</span>
        </div>

        <button type="button" className="button buttonSecondary"
          onClick={() => setFilters({query:"",years:options.years,pillars:options.pillars,categories:options.categories,statuses:[],districts:[],budgetRange:options.budgetRange})}>  
          รีเซ็ตตัวกรอง
        </button>

        <div className="sidebarSection">
          <p className="sidebarSectionTitle">โหมดการแสดงผล</p>
          <div className="modeButtons">
            {(["default","dark","presentation"] as DisplayMode[]).map((m) => (
              <button key={m} type="button" className={`modeBtn ${displayMode===m?"modeBtnActive":""}`} onClick={() => setDisplayMode(m)}>
                {m==="default"?"ปกติ":m==="dark"?"Dark":"Presentation"}
              </button>
            ))}
            <button type="button" className="modeBtn" onClick={toggleFullscreen}>{isFullscreen?"Exit FS":"Fullscreen"}</button>
          </div>
        </div>

        <div className="sidebarSection">
          <p className="sidebarSectionTitle" style={{marginBottom:"4px"}}>สร้างเมื่อ</p>
          <span style={{fontSize:"0.8rem",color:"var(--muted)"}}>{generatedAt}</span>
        </div>
      </aside>

      <main className="content">
        {/* ── Dashboard Header ── */}
        <header className="dashHeader glass">
          <div className="dashHeaderLeft">
            <p className="eyebrow">Executive Command Center</p>
            <h1 className="dashTitle">Nakhon Sawan Smart City Intelligence</h1>
            <p className="dashSubtitle">ระบบสนับสนุนการตัดสินใจผู้บริหาร — ข้อมูลจริง วิเคราะห์จริง พร้อมส่งออกรายงาน</p>
          </div>
          <div className="dashHeaderRight">
            <span className="chip chipCyan">{allProjects.length} โครงการ</span>
            <span className="chip chipAmber">สื่อ {mediaCounts.total} รายการ</span>
            <span className="chip chipRose">{kpiData.find((k)=>k.id==="risk")?.value ?? 0} ความเสี่ยงสูง</span>
            <button type="button" className="button"
              onClick={() => downloadText("ข้อมูลโครงการ.csv", csvText, "text/csv;charset=utf-8")}>
              ↓ CSV
            </button>
          </div>
        </header>

        {/* ── KPI Cards (always visible) ── */}
        <section className="kpiGrid">
          {kpiData.map((kpi) => <KPICardComponent key={kpi.id} kpi={kpi as KPICard} />)}
        </section>

        {/* ── Tab Navigation ── */}
        <nav className="tabBar glass">
          {(Object.keys(TAB_LABELS) as ActiveTab[]).map((tab) => (
            <button key={tab} type="button"
              className={`tabBtn ${activeTab===tab?"tabActive":""}`}
              onClick={() => setActiveTab(tab)}>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        {/* ── TAB: Overview ── */}
        {activeTab === "overview" && (<>
          <section style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <SectionPanel title="สรุปภาพรวมผู้บริหาร" subtitle="จากข้อมูลที่กรองอยู่" accent="#a78bfa">
              <ul className="execSummaryList">{summaryBullets.map((b)=><li key={b}>{b}</li>)}</ul>
            </SectionPanel>
            <SectionPanel title="Smart City Radar" subtitle="ดัชนีความสมดุล 6 มิติ" accent="#38bdf8">
              <RadarChart data={radarData} />
            </SectionPanel>
          </section>
          <SectionPanel title="ศูนย์สื่อ — ภาพรวม" subtitle={`ไฟล์ทั้งหมด ${mediaCounts.total} รายการ`} accent="#f472b6">
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginTop:"4px"}}>
              {([["วิดีโอ",mediaCounts.video,"#38bdf8"],["เสียง",mediaCounts.audio,"#a78bfa"],["ภาพ",mediaCounts.image,"#34d399"],["เอกสาร",mediaCounts.document,"#f59e0b"]] as [string,number,string][]).map(([label,count,color])=>(
                <div key={label} className="glassInner" style={{borderRadius:"var(--radius-sm)",padding:"16px",display:"flex",flexDirection:"column",gap:"4px"}}>
                  <strong style={{fontSize:"1.8rem",color}}>{count}</strong>
                  <span style={{color:"var(--muted)",fontSize:"0.85rem"}}>{label}</span>
                </div>
              ))}
            </div>
            <div className="buttonRow" style={{marginTop:"14px"}}>
              <button type="button" className="button" onClick={()=>setActiveTab("media")}>เปิดศูนย์สื่อ →</button>
            </div>
          </SectionPanel>
        </>)}

        {/* ── TAB: Analytics ── */}
        {activeTab === "analytics" && (<>
          <section style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <SectionPanel title="สัดส่วนงบตามยุทธศาสตร์" subtitle="Donut chart" accent="#a78bfa">
              <div className="donutWrap">
                <svg viewBox="0 0 120 120" className="donutChart">
                  <circle cx="60" cy="60" r="45" className="donutTrack" />
                  {pillarData.map((seg)=>(
                    <circle key={seg.label} cx="60" cy="60" r="45" className="donutSegment"
                      stroke={seg.color} strokeDasharray={seg.dash} strokeDashoffset={seg.offset} />
                  ))}
                </svg>
                <div className="donutCenter"><strong>{formatNumber(totalBudget)}</strong><span>บาท</span></div>
              </div>
              <div className="legendList">
                {pillarData.map((s)=>(
                  <div key={s.label} className="legendRow">
                    <span className="legendDot" style={{background:s.color}} />
                    <span>{s.label}</span>
                    <strong>{Math.round(s.ratio*100)}%</strong>
                  </div>
                ))}
              </div>
            </SectionPanel>
            <SectionPanel title="งบประมาณรายโครงการ" subtitle="Top 10 เรียงจากมากไปน้อย" accent="#38bdf8">
              <div className="barList">
                {projectBars.slice(0,10).map((p)=>(
                  <div key={p.id} className="barItem">
                    <div className="barHeader">
                      <span>#{p.id} {p.name.length>28?p.name.slice(0,28)+"…":p.name}</span>
                      <strong>{formatNumber(p.budget)}</strong>
                    </div>
                    <div className="barTrack">
                      <div className="barFill" style={{width:`${p.width}%`,background:PILLAR_COLORS[p.pillar]||"#38bdf8"}} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionPanel>
          </section>
          <SectionPanel title="Budget Treemap" subtitle="การกระจายงบตามยุทธศาสตร์และโครงการ" accent="#38bdf8">
            <TreemapChart nodes={treemapData} />
          </SectionPanel>
          <SectionPanel title="แผนภูมิ Gantt" subtitle="ความคืบหน้าตามแผนงาน" accent="#f59e0b" >
            <GanttChart rows={ganttData} />
          </SectionPanel>
          <SectionPanel title={`Scenario Simulation — งบเพิ่ม ${scenarioPct}%`} subtitle="คาดการณ์ผลลัพธ์" accent="#34d399">
            <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"16px"}}>
              <span style={{fontSize:"0.86rem",fontWeight:600}}>เพิ่มงบ:</span>
              <input type="range" min={5} max={50} step={5} value={scenarioPct}
                onChange={(e)=>setScenarioPct(Number(e.target.value))} style={{width:"160px"}} />
              <span className="chip chipGreen">{scenarioPct}%</span>
            </div>
            <ScenarioChart results={scenarioData} />
          </SectionPanel>
        </>)}

        {/* ── TAB: AI Intelligence ── */}
        {activeTab === "intelligence" && (
          <SectionPanel title="AI Decision Intelligence"
            subtitle={`${aiInsights.filter((i)=>i.urgency==="high").length} ประเด็นด่วน · ${aiInsights.length} ประเด็นทั้งหมด`}
            accent="#f87171">
            <div className="insightGrid">
              {aiInsights.map((ins,idx)=><AIInsightCard key={idx} insight={ins} />)}
            </div>
          </SectionPanel>
        )}

        {/* ── TAB: Media ── */}
        {activeTab === "media" && (
          <SectionPanel title="ศูนย์สื่อประกอบการพิจารณา" subtitle={`${mediaFiles.length} รายการ`} accent="#f472b6">
            <div className="mediaFilterBar">
              <input className="input" placeholder="ค้นหาชื่อไฟล์..." value={mediaSearch} onChange={(e)=>setMediaSearch(e.target.value)} />
              <div className="mediaTypeFilters">
                {(["all","video","audio","image","document"] as const).map((t)=>(
                  <button key={t} type="button"
                    className={`mediaTypeBtn ${mediaTypeFilter===t?"mediaTypeBtnActive":""}`}
                    onClick={()=>setMediaTypeFilter(t)}>
                    {t==="all"?"ทั้งหมด":t==="video"?"วิดีโอ":t==="audio"?"เสียง":t==="image"?"ภาพ":"เอกสาร"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mediaGrid">
              <MediaBlock title="วิดีโอ" items={filteredMedia.filter((m)=>m.type==="video")}>
                {(m)=><video className="mediaPlayer" controls src={m.url} />}
              </MediaBlock>
              <MediaBlock title="เสียง" items={filteredMedia.filter((m)=>m.type==="audio")}>
                {(m)=><audio className="audioPlayer" controls src={m.url} />}
              </MediaBlock>
              <MediaBlock title="ภาพ" items={filteredMedia.filter((m)=>m.type==="image")}>
                {(m)=><img className="imageCard" src={m.url} alt={m.name} loading="lazy" />}
              </MediaBlock>
              <MediaBlock title="เอกสาร" items={filteredMedia.filter((m)=>m.type==="document")}>
                {(m)=>(
                  <div className="docCard">
                    <div className="docHeader">
                      <strong style={{fontSize:"0.86rem"}}>{m.name}</strong>
                      <a href={m.url} target="_blank" rel="noreferrer">เปิดไฟล์</a>
                    </div>
                    {m.textContent?<pre className="docPreview">{m.textContent.slice(0,1600)}</pre>:<p className="docPlaceholder">เปิดได้จากลิงก์ด้านบน</p>}
                  </div>
                )}
              </MediaBlock>
            </div>
          </SectionPanel>
        )}

        {/* ── TAB: Reports ── */}
        {activeTab === "reports" && (<>
          <SectionPanel title="ศูนย์รายงาน" subtitle="ดาวน์โหลดรายงานสำหรับผู้บริหาร" accent="#34d399">
            <div className="reportCards">
              <div className="reportCard glassInner" style={{borderLeftColor:"#38bdf8"}}>
                <h4>CSV ข้อมูลดิบ</h4>
                <p>ส่งต่อทีมวิเคราะห์หรือเปิดใน Excel</p>
                <button type="button" className="button buttonSuccess"
                  onClick={()=>downloadText("ข้อมูลโครงการ.csv",csvText,"text/csv;charset=utf-8")}>↓ ดาวน์โหลด CSV</button>
              </div>
              <div className="reportCard glassInner" style={{borderLeftColor:"#a78bfa"}}>
                <h4>รายงานสรุปผู้บริหาร</h4>
                <p>ภาพรวม งบประมาณ ยุทธศาสตร์ รายชื่อโครงการ</p>
                <button type="button" className="button"
                  onClick={()=>downloadText("รายงานสรุปผู้บริหาร.txt",executiveReport,"text/plain;charset=utf-8")}>↓ ดาวน์โหลด</button>
              </div>
              <div className="reportCard glassInner" style={{borderLeftColor:"#f59e0b"}}>
                <h4>รายงานวิเคราะห์เชิงลึก</h4>
                <p>ประเด็นซ้ำซ้อน งบกระจุกตัว ข้อเสนอแนะ</p>
                <button type="button" className="button buttonSecondary"
                  onClick={()=>downloadText("รายงานวิเคราะห์เชิงลึก.txt",deepAnalysis,"text/plain;charset=utf-8")}>↓ ดาวน์โหลด</button>
              </div>
            </div>
            <div className="previewTabs" style={{marginTop:"20px"}}>
              <button type="button" className={`previewTab ${reportView==="executive"?"previewTabActive":""}`} onClick={()=>setReportView("executive")}>รายงานสรุป</button>
              <button type="button" className={`previewTab ${reportView==="analysis"?"previewTabActive":""}`} onClick={()=>setReportView("analysis")}>รายงานวิเคราะห์</button>
            </div>
            <pre className="reportPreviewBox">{reportText}</pre>
          </SectionPanel>

          <SectionPanel title="ตารางรายละเอียดโครงการ" subtitle={`${filteredProjects.length} โครงการ`} accent="#f59e0b">
            <div className="buttonRow" style={{marginBottom:"12px"}}>
              <button type="button" className="button buttonSecondary"
                onClick={()=>downloadText("ข้อมูลโครงการ.csv",csvText,"text/csv;charset=utf-8")}>↓ ดาวน์โหลดตารางนี้</button>
            </div>
            <div className="tableWrap">
              <table>
                <thead><tr>
                  <th>รหัส</th><th>ชื่อโครงการ</th><th>งบประมาณ</th>
                  <th>ปีงบฯ</th><th>ยุทธศาสตร์</th><th>หมวดหมู่</th>
                  <th>สถานะ</th><th>ความคืบหน้า</th>
                </tr></thead>
                <tbody>
                  {filteredProjects.map((p)=>(
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{formatNumber(p.budget)}</td>
                      <td>{p.year}</td>
                      <td><span style={{color:PILLAR_COLORS[p.pillar]||"#94a3b8",fontSize:"0.82rem"}}>{p.pillarTh||p.pillar}</span></td>
                      <td>{p.category}</td>
                      <td>{p.status&&<span className={`statusBadge ${p.status==="active"?"statusActive":p.status==="completed"?"statusCompleted":p.status==="delayed"?"statusDelayed":"statusAtRisk"}`}>
                        {p.status==="active"?"ดำเนินการ":p.status==="completed"?"เสร็จแล้ว":p.status==="delayed"?"ล่าช้า":"เสี่ยง"}
                      </span>}</td>
                      <td>{p.completionPct!=null?`${p.completionPct}%`:"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionPanel>
        </>)}

        {/* ── TAB: Import ── */}
        {activeTab === "import" && (
          <SectionPanel title="นำเข้าข้อมูลโครงการ (CSV)" subtitle="รองรับหัวคอลัมน์ภาษาไทยและอังกฤษ" accent="#34d399">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{display:"none"}}
              onChange={(e)=>{const f=e.target.files?.[0];if(f)handleFileImport(f);}} />
            <div className={`dropZone ${isDragging?"dropZoneActive":""}`}
              onClick={()=>fileInputRef.current?.click()}
              onDragOver={(e)=>{e.preventDefault();setIsDragging(true);}}
              onDragLeave={()=>setIsDragging(false)}
              onDrop={(e)=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files[0];if(f)handleFileImport(f);}}>
              <div className="dropZoneIcon">📂</div>
              <p className="dropZoneText">คลิกหรือลากไฟล์ CSV มาวางที่นี่</p>
              <p className="dropZoneSubtext">id · ชื่อโครงการ · งบประมาณ · ปีงบประมาณ · ยุทธศาสตร์ · สถานะ · ความคืบหน้า · อำเภอ</p>
            </div>
            {importStatus&&(
              <div className="importResult">
                <p className="importResultTitle">✅ นำเข้าสำเร็จ {importStatus.imported} โครงการ (รวม {allProjects.length} โครงการ)</p>
                {importStatus.warnings.map((w,i)=><p key={i} className="importWarning">⚠️ {w}</p>)}
              </div>
            )}
            <div style={{marginTop:"20px"}}>
              <p className="sidebarSectionTitle" style={{marginBottom:"8px"}}>ตัวอย่างรูปแบบ CSV</p>
              <pre className="reportPreviewBox" style={{maxHeight:"140px"}}>{`id,ชื่อโครงการ,งบประมาณ (บาท),ปีงบประมาณ,ยุทธศาสตร์ (en),หมวดหมู่,สถานะ,ความคืบหน้า,อำเภอ
1,โครงการระบบไซเบอร์,5000000,2567,Smart Governance,เครือข่ายไซเบอร์,active,60,เมือง
2,โครงการ PDPA,3200000,2567,Smart Governance,ความปลอดภัยข้อมูล,at-risk,40,เมือง`}</pre>
            </div>
          </SectionPanel>
        )}

      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function SectionPanel({ title, subtitle, accent, children }: { title: string; subtitle: string; accent?: string; children: React.ReactNode }) {
  return (
    <article className="panel glass" style={{ borderLeft: `4px solid ${accent||"transparent"}` }}>
      <div className="sectionHead">
        <div>
          <h2 className="sectionTitle">{title}</h2>
          <p className="sectionSubtitle">{subtitle}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function FilterChecklist({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="sidebarSection">
      <div className="fieldRow">
        <p className="sidebarSectionTitle">{label}</p>
        <span className="fieldMeta">{selected.length}/{options.length}</span>
      </div>
      <div className="checkList">
        {options.map((item) => (
          <button type="button" key={item} className={`checkItem ${selected.includes(item)?"isSelected":""}`} onClick={()=>onToggle(item)}>
            <span className="checkDot" />{item}
          </button>
        ))}
      </div>
    </div>
  );
}

function KPICardComponent({ kpi }: { kpi: KPICard }) {
  const isRisk = kpi.id === "risk";
  const trendColor = kpi.trend === "up" ? (isRisk ? "#f87171" : "#34d399") : kpi.trend === "down" ? (isRisk ? "#34d399" : "#f87171") : "#94a3b8";
  const trendArrow = kpi.trend === "up" ? "▲" : kpi.trend === "down" ? "▼" : "—";
  const trendClass = kpi.trend === "up" ? (isRisk ? "kpiTrendDown" : "kpiTrendUp") : kpi.trend === "down" ? (isRisk ? "kpiTrendUp" : "kpiTrendDown") : "kpiTrendFlat";
  const maxSpark = Math.max(...kpi.sparkline, 1);
  return (
    <div className={`kpiCard glass accent-${kpi.accent}`}>
      <div className="kpiTop">
        <span className="kpiIcon">{kpi.icon}</span>
        <span className={`kpiTrend ${trendClass}`}>{trendArrow} {Math.abs(kpi.change)}%</span>
      </div>
      <p className="kpiLabel">{kpi.label}</p>
      <h3 className="kpiValue" style={{color:trendColor}}>{kpi.value}</h3>
      <span className="kpiUnit">{kpi.unit}</span>
      <svg className="sparkline" viewBox={`0 0 ${kpi.sparkline.length*10} 26`} preserveAspectRatio="none">
        <polyline
          points={kpi.sparkline.map((v,i)=>`${i*10},${26-(v/maxSpark)*24}`).join(" ")}
          fill="none" stroke={trendColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function RadarChart({ data }: { data: RadarDimension[] }) {
  const cx=160, cy=160, r=120, n=data.length;
  const pt = (i: number, rad: number) => {
    const a = (Math.PI*2*i)/n - Math.PI/2;
    return {x: cx+rad*Math.cos(a), y: cy+rad*Math.sin(a)};
  };
  const gridLevels = [0.25,0.5,0.75,1].map((lv) =>
    data.map((_,i)=>pt(i,r*lv)).map((p,i)=>(i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`)).join(" ")+"Z");
  const dataPath = data.map((d,i)=>{ const p=pt(i,r*(d.score/100)); return i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`; }).join(" ")+"Z";
  return (
    <div className="radarWrap">
      <svg viewBox="0 0 320 320" className="radarSvg">
        {gridLevels.map((d,i)=><path key={i} d={d} fill="none" stroke="rgba(125,211,252,0.09)" strokeWidth="1"/>)}
        {data.map((_,i)=>{ const p=pt(i,r); return <path key={i} d={`M${cx},${cy} L${p.x},${p.y}`} stroke="rgba(125,211,252,0.14)" strokeWidth="1"/>; })}
        <path d={dataPath} fill="rgba(56,189,248,0.13)" stroke="#38bdf8" strokeWidth="2"/>
        {data.map((d,i)=>{ const p=pt(i,r*(d.score/100)); return <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#38bdf8"/>; })}
        {data.map((d,i)=>{ const p=pt(i,r+22); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#8aabbf">{d.labelTh}</text>; })}
        {data.map((d,i)=>{ const p=pt(i,r*(d.score/100)-13); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#38bdf8" fontWeight="700">{d.score}</text>; })}
      </svg>
    </div>
  );
}

function AIInsightCard({ insight }: { insight: AIInsight }) {
  const color = INSIGHT_COLORS[insight.type] ?? "#94a3b8";
  const typeLabel: Record<string,string> = {warning:"⚠️ คำเตือน",risk:"🔴 ความเสี่ยง",opportunity:"✅ โอกาส",info:"ℹ️ ข้อมูล"};
  const urgencyClass = insight.urgency==="high"?"urgencyHigh":insight.urgency==="medium"?"urgencyMed":"urgencyLow";
  return (
    <div className="insightCard glassInner" style={{borderLeft:`4px solid ${color}`}}>
      <div className="insightTop">
        <span className="insightTypeLabel" style={{color}}>{typeLabel[insight.type]}</span>
        <span className={`urgencyBadge ${urgencyClass}`}>{insight.urgency==="high"?"ด่วน":insight.urgency==="medium"?"ติดตาม":"ข้อมูล"}</span>
      </div>
      <h4 className="insightTitle">{insight.title}</h4>
      <p className="insightDesc">{insight.description}</p>
      {insight.affectedProjects&&(
        <div className="insightRefs">{insight.affectedProjects.map((id)=><span key={id} className="chip" style={{fontSize:"0.76rem",padding:"3px 7px"}}>#{id}</span>)}</div>
      )}
    </div>
  );
}

function TreemapChart({ nodes }: { nodes: TreemapNode[] }) {
  if (!nodes.length) return <div className="emptyState">ไม่มีข้อมูล</div>;
  return (
    <div className="treemapWrap">
      {nodes.map((node)=>(
        <div key={node.label} className="treemapPillar" style={{width:`${node.width}%`,borderColor:node.color}}>
          <div className="treemapPillarLabel" style={{color:node.color}}>{node.label}</div>
          <div className="treemapChildren">
            {(node.children??[]).map((child)=>(
              <div key={child.label} className="treemapCell" style={{background:`${node.color}1e`,borderColor:`${node.color}3a`,height:`${child.height??20}px`}}>
                <span className="treemapCellName">{child.label}</span>
                <span className="treemapCellVal">{((child.value??0)/1_000_000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GanttChart({ rows }: { rows: GanttRow[] }) {
  const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return (
    <div className="ganttWrap">
      <div className="ganttHeader">
        <div className="ganttLabel" style={{fontSize:"0.75rem",color:"var(--muted)"}}>โครงการ</div>
        <div className="ganttHeaderMonths">{MONTHS.map((m,i)=><div key={i} className="ganttMonth">{m}</div>)}</div>
      </div>
      {rows.map((row)=>{
        const sColor = STATUS_COLORS[row.status]??"#94a3b8";
        const pColor = PILLAR_COLORS[row.pillar]??"#94a3b8";
        const startPct = ((row.start-1)/12)*100;
        const widthPct = ((row.end-row.start+1)/12)*100;
        return (
          <div key={row.id} className="ganttRow">
            <div className="ganttLabel" title={row.name}>#{row.id} {row.name.slice(0,20)}{row.name.length>20?"…":""}</div>
            <div className="ganttBarTrack">
              <div className="ganttBar" style={{left:`${startPct}%`,width:`${widthPct}%`,background:`${pColor}33`,borderColor:pColor}}>
                <div className="ganttProgress" style={{width:`${row.progress}%`,background:sColor}} />
                <span className="ganttPct">{row.progress}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScenarioChart({ results }: { results: ScenarioResult[] }) {
  if (!results.length) return <div className="emptyState">ไม่มีข้อมูล</div>;
  const max = Math.max(...results.map((r)=>r.benefitScore),1);
  return (
    <div className="barList">
      {results.map((r)=>(
        <div key={r.pillar} className="barItem">
          <div className="barHeader">
            <span>{r.pillar}</span>
            <strong style={{color:PILLAR_COLORS[r.pillar]??"#94a3b8"}}>
              คะแนน {r.benefitScore} · งบเพิ่ม {((r.simulatedBudget-r.currentBudget)/1_000_000).toFixed(2)}M
            </strong>
          </div>
          <div className="barTrack">
            <div className="barFill" style={{width:`${(r.benefitScore/max)*100}%`,background:PILLAR_COLORS[r.pillar]??"#38bdf8"}} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MediaBlock({ title, items, children }: { title: string; items: MediaFile[]; children: (item: MediaFile) => React.ReactNode }) {
  return (
    <div className="mediaBlock glassInner">
      <div className="mediaBlockHeader">
        <h3>{title}</h3>
        <span>{items.length} รายการ</span>
      </div>
      {items.length===0 ? (
        <div className="emptyState">ไม่พบไฟล์ในหมวดนี้</div>
      ) : (
        <div className="mediaItems">
          {items.map((item)=>(
            <div key={item.name} className="mediaItem">
              {children(item)}
              <p className="mediaItemName">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function toggleValue(current: string[], value: string, all: string[]) {
  if (current.includes(value)) {
    const next = current.filter((x)=>x!==value);
    return next.length ? next : all;
  }
  return [...current, value];
}

function downloadText(fileName: string, content: string, mime: string) {
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url), 100);
}

