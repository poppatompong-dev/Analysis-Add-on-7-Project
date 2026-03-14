"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { applyFilters } from "@/lib/filters";
import { buildCsv, buildDeepAnalysis, buildExecutiveReport } from "@/lib/reports";
import { formatNumber, getExecutiveSummary } from "@/lib/insights";
import { getKPIData, getRadarData, getAIInsights, getTreemapData, getScenarioSimulation } from "@/lib/data";
import type { AIInsight, DisplayMode, Filters, KPICard, MediaFile, Project, RadarDimension, ScenarioResult, TreemapNode } from "@/types/project";

type DashboardAppProps = {
  initialProjects: Project[];
  mediaFiles: MediaFile[];
  options: {
    years: string[];
    pillars: string[];
    categories: string[];
    statuses: string[];
    budgetRange: [number, number];
  };
  generatedAt: string;
};

type ReportView = "executive" | "analysis";
type ActiveTab = "overview" | "analytics" | "intelligence" | "media" | "reports" | "import" | "faq" | "guide";

const PILLAR_COLORS: Record<string, string> = {
  "Smart Governance": "#38bdf8",
  "Smart Living": "#a78bfa",
  "Smart Economy": "#34d399",
  "Smart People": "#f59e0b",
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
    budgetRange: options.budgetRange,
  };

  const [allProjects, setAllProjects] = useState<Project[]>(initialProjects);
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
  const modeClass = displayMode === "presentation" ? "modePresentation" : "";
  const totalBudget = filteredProjects.reduce((s, p) => s + p.budget, 0);
  const mediaCounts = {
    total: mediaFiles.length,
    video: mediaFiles.filter((m) => m.type === "video").length,
    audio: mediaFiles.filter((m) => m.type === "audio").length,
    image: mediaFiles.filter((m) => m.type === "image").length,
    document: mediaFiles.filter((m) => m.type === "document").length,
  };
  const TAB_LABELS: Record<ActiveTab, string> = {
    overview: "📊 ภาพรวม", analytics: "📈 วิเคราะห์", intelligence: "🧠 วิเคราะห์เชิงลึก",
    media: "🎥 ศูนย์สื่อ", reports: "📄 รายงาน", import: "📥 นำเข้าข้อมูล",
    faq: "❓ คำถามที่พบบ่อย", guide: "📖 คู่มือการใช้งาน",
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
      <aside className="sidebar glass" aria-label="แผงควบคุมและตัวกรอง">
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
          onClick={() => setFilters({query:"",years:options.years,pillars:options.pillars,categories:options.categories,statuses:[],budgetRange:options.budgetRange})}>  
          รีเซ็ตตัวกรอง
        </button>

        <div className="sidebarSection">
          <p className="sidebarSectionTitle">โหมดการแสดงผล</p>
          <div className="modeButtons">
            <button type="button" className={`modeBtn ${displayMode==="default"?"modeBtnActive":""}`} onClick={() => setDisplayMode("default")}>
              🖥️ ปกติ
            </button>
            <button type="button" className={`modeBtn ${displayMode==="presentation"?"modeBtnActive":""}`} onClick={() => setDisplayMode("presentation")}>
              📽️ Presentation
            </button>
            <button type="button" className="modeBtn" style={{gridColumn:"1/-1"}} onClick={toggleFullscreen}>
              {isFullscreen ? "⊠ ออกจาก Fullscreen" : "⛶ Fullscreen"}
            </button>
          </div>
        </div>

        <div className="sidebarSection">
          <p className="sidebarSectionTitle" style={{marginBottom:"4px"}}>สร้างเมื่อ</p>
          <span style={{fontSize:"0.8rem",color:"var(--muted)"}}>{generatedAt}</span>
        </div>
      </aside>

      <main id="main-content" className="content">
        {/* ── Dashboard Header ── */}
        <header className="dashHeader glass">
          <div className="dashHeaderLeft">
            <p className="eyebrow">กองยุทธศาสตร์และงบประมาณ — เทศบาลนครนครสวรรค์</p>
            <h1 className="dashTitle">ระบบสารสนเทศเมืองอัจฉริยะ นครสวรรค์</h1>
            <p className="dashSubtitle">ระบบสนับสนุนข้อมูลเชิงสถิติสำหรับผู้บริหาร — ข้อมูลจากโครงการจริง วิเคราะห์ตามมิติที่เกี่ยวข้อง พร้อมส่งออกรายงาน</p>
          </div>
          <div className="dashHeaderRight">
            <span className="chip chipCyan">{allProjects.length} โครงการ</span>
            <span className="chip chipAmber">สื่อ {mediaCounts.total} รายการ</span>
            <button type="button" className="button" aria-label="ส่งออกข้อมูลโครงการเป็นไฟล์ CSV"
              onClick={() => downloadText("ข้อมูลโครงการ.csv", csvText, "text/csv;charset=utf-8")}>
              ↓ ส่งออก CSV (ไฟล์ตาราง)
            </button>
          </div>
        </header>

        {/* ── Active Filter Banner ── */}
        {(filters.query.trim() || filters.years.length < options.years.length || filters.pillars.length < options.pillars.length || filters.categories.length < options.categories.length || filters.budgetRange[0] > options.budgetRange[0] || filters.budgetRange[1] < options.budgetRange[1]) && (
          <div className="filterBanner">
            <div className="filterBannerLeft">
              <span className="filterBannerIcon">🔍</span>
              <span className="filterBannerLabel">กำลังกรองข้อมูล:</span>
              {filters.query.trim() && <span className="filterTag">คำค้นหา: "{filters.query.trim()}"</span>}
              {filters.years.length < options.years.length && <span className="filterTag">ปี: {filters.years.join(", ")}</span>}
              {filters.pillars.length < options.pillars.length && <span className="filterTag">ยุทธศาสตร์: {filters.pillars.length} จาก {options.pillars.length}</span>}
              {filters.categories.length < options.categories.length && <span className="filterTag">หมวดหมู่: {filters.categories.length} จาก {options.categories.length}</span>}
              {(filters.budgetRange[0] > options.budgetRange[0] || filters.budgetRange[1] < options.budgetRange[1]) && <span className="filterTag">งบ: {formatNumber(filters.budgetRange[0])}–{formatNumber(filters.budgetRange[1])}</span>}
            </div>
            <div className="filterBannerRight">
              <strong style={{color:"var(--cyan)"}}>{filteredProjects.length}</strong><span style={{color:"var(--muted)"}}> / {allProjects.length} โครงการ</span>
              <span style={{margin:"0 6px",color:"var(--border)"}}>|</span>
              <strong>{formatNumber(totalBudget)}</strong> <span style={{color:"var(--muted)"}}>บาท</span>
            </div>
          </div>
        )}

        {/* ── KPI Cards (always visible) ── */}
        <section className="kpiGrid">
          <div className="kpiHint">
            💡 ตัวชี้วัดหลัก (KPI หรือ Key Performance Indicator คือตัวชี้วัดผลการดำเนินงาน) ด้านล่างคำนวณจากโครงการที่กรองอยู่ — ลองปรับตัวกรองด้านซ้ายเพื่อเปรียบเทียบ
          </div>
          {kpiData.map((kpi) => <KPICardComponent key={kpi.id} kpi={kpi as KPICard} />)}
        </section>

        {/* ── Tab Navigation ── */}
        <nav className="tabBar glass" role="tablist" aria-label="เมนูแท็บหลัก">
          {(Object.keys(TAB_LABELS) as ActiveTab[]).map((tab) => (
            <button key={tab} type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab}`}
              className={`tabBtn ${activeTab===tab?"tabActive":""}`}
              onClick={() => setActiveTab(tab)}>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        {/* ── TAB: Overview ── */}
        {activeTab === "overview" && (<div id="tabpanel-overview" role="tabpanel" aria-label="ภาพรวม"><>
          <section style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <SectionPanel title="สรุปภาพรวมผู้บริหาร" subtitle="จากข้อมูลที่กรองอยู่" accent="#a78bfa">
              <ul className="execSummaryList">{summaryBullets.map((b)=><li key={b}>{b}</li>)}</ul>
            </SectionPanel>
            <SectionPanel title="แผนภูมิเรดาร์เมืองอัจฉริยะ" subtitle="ดัชนีความสมดุล 6 มิติ (Smart City Radar)" accent="#38bdf8">
              <div className="sectionHint">
                💡 <strong>แผนภูมิเรดาร์</strong> (หรือ Radar Chart) แสดงคะแนนความสมดุลของโครงการใน 6 ด้าน — ยิ่งพื้นที่กว้างและสมมาตร ยิ่งแสดงถึงการกระจายงบที่สมดุล
              </div>
              <RadarChart data={radarData} />
            </SectionPanel>
          </section>
          {/* ── ตารางสรุปโครงการ (ข้อมูลที่กรองอยู่) ── */}
          <SectionPanel title="ตารางสรุปโครงการ" subtitle={`แสดง ${filteredProjects.length} โครงการจากทั้งหมด ${allProjects.length} โครงการ — คลิกแถวเพื่อดูรายละเอียด`} accent="#0369a1">
            <div className="sectionHint">
              💡 ตารางนี้แสดงเฉพาะโครงการที่ตรงกับตัวกรองด้านซ้าย — ปรับตัวกรองเพื่อเปลี่ยนรายการ
            </div>
            <div style={{overflowX:"auto"}}>
              <table className="projectTable" role="table" aria-label="ตารางสรุปโครงการ">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">ชื่อโครงการ</th>
                    <th scope="col">งบประมาณ <span className="thHint">(บาท)</span></th>
                    <th scope="col">ปี</th>
                    <th scope="col" title="ยุทธศาสตร์เมืองอัจฉริยะ (Smart City Pillar)">ยุทธศาสตร์</th>
                    <th scope="col">หมวดหมู่</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedProject(p)} style={{cursor:"pointer"}} tabIndex={0} onKeyDown={(e)=>{if(e.key==="Enter"||e.key==" ")setSelectedProject(p)}} aria-label={`โครงการ ${p.name}`}>
                      <td style={{color:"var(--cyan)",fontWeight:700}}>{p.id}</td>
                      <td>
                        <div style={{fontWeight:600}}>{p.name}</div>
                        {p.description && <div style={{fontSize:"0.78rem",color:"var(--muted)",marginTop:"2px",maxWidth:"340px",lineHeight:1.4}}>{p.description.slice(0, 80)}{p.description.length > 80 ? "…" : ""}</div>}
                      </td>
                      <td style={{fontWeight:700,whiteSpace:"nowrap"}}>{formatNumber(p.budget)}</td>
                      <td>{p.year}</td>
                      <td><span style={{color:PILLAR_COLORS[p.pillar] ?? "#94a3b8",fontWeight:600}}>{p.pillarTh || p.pillar}</span></td>
                      <td>{p.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionPanel>

          <SectionPanel title="ศูนย์สื่อ — ภาพรวม" aria-label="ศูนย์สื่อ" subtitle={`สื่อประกอบการพิจารณา ทั้งหมด ${mediaCounts.total} รายการ`} accent="#f472b6">
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginTop:"4px"}}>
              {([["วิดีโอ",mediaCounts.video,"#38bdf8"],["บทสรุปเสียง",mediaCounts.audio,"#a78bfa"],["ภาพประกอบ",mediaCounts.image,"#34d399"],["เอกสาร",mediaCounts.document,"#f59e0b"]] as [string,number,string][]).map(([label,count,color])=>(
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
        </></div>)}

        {/* ── TAB: Analytics ── */}
        {activeTab === "analytics" && (<div id="tabpanel-analytics" role="tabpanel" aria-label="วิเคราะห์"><>
          <section style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <SectionPanel title="สัดส่วนงบตามยุทธศาสตร์" subtitle="แผนภูมิวงกลม — สัดส่วนงบแต่ละด้าน" accent="#a78bfa">
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
              <div className="sectionHint" style={{margin:"10px 0"}}>
                💡 <strong>แผนภูมิวงกลม</strong> (หรือ Donut Chart) แสดงว่างบรวมกระจายไปในยุทธศาสตร์ใดมากที่สุด — ถ้าสีใดครอบงำเกินครึ่ง แสดงว่างบอาจกระจุกตัว
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
            <SectionPanel title="งบประมาณรายโครงการ" subtitle="10 อันดับแรก เรียงจากมากไปน้อย — คลิกเพื่อดูรายละเอียด" accent="#38bdf8">
              <div className="barList">
                {projectBars.slice(0,10).map((p)=>(
                  <div key={p.id} className="barItem" style={{cursor:"pointer"}} onClick={()=>setSelectedProject(p)}>
                    <div className="barHeader">
                      <span style={{color:"var(--cyan)",fontWeight:600}}>#{p.id}</span>
                      <span style={{flex:1,margin:"0 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name.length>28?p.name.slice(0,28)+"…":p.name}</span>
                      <strong>{formatNumber(p.budget)}</strong>
                    </div>
                    <div className="barTrack">
                      <div className="barFill" style={{width:`${p.width}%`,background:PILLAR_COLORS[p.pillar]||"#0369a1"}} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionPanel>
          </section>
          <SectionPanel title="แผนที่งบประมาณ (Treemap)" subtitle="แสดงสัดส่วนงบของแต่ละยุทธศาสตร์และโครงการภายใต้ — คลิกเพื่อดูรายละเอียด" accent="#0369a1">
            <div className="sectionHint">
              💡 <strong>Treemap</strong> (แผนที่สัดส่วน) แสดงว่างบแต่ละยุทธศาสตร์กระจายตัวอย่างไร — <strong>พื้นที่ยิ่งกว้าง = งบยิ่งมาก</strong> คลิกที่ชื่อโครงการเพื่อดูรายละเอียด
            </div>
            <TreemapChart nodes={treemapData} onCellClick={(name)=>{
              const found = filteredProjects.find((p)=>p.name===name || p.category===name);
              if(found) setSelectedProject(found);
            }} />
          </SectionPanel>
          <SectionPanel title={`จำลองสถานการณ์ — งบเพิ่ม ${scenarioPct}%`} subtitle="จำลองผลลัพธ์หากปรับเพิ่มงบในแต่ละยุทธศาสตร์ (Scenario Simulation)" accent="#34d399">
            <div className="sectionHint">
              💡 <strong>การจำลองสถานการณ์</strong> (Scenario Simulation) ช่วยให้ผู้บริหารเห็นภาพว่า หากเพิ่มงบในแต่ละยุทธศาสตร์ คะแนนประโยชน์คาดการณ์ (หรือ Benefit Score) จะเปลี่ยนแปลงอย่างไร — ใช้สไลด์ด้านล่างเพื่อปรับเปอร์เซ็นต์งบที่เพิ่ม
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"16px"}}>
              <span style={{fontSize:"0.86rem",fontWeight:600}}>เพิ่มงบ:</span>
              <input type="range" min={5} max={50} step={5} value={scenarioPct}
                onChange={(e)=>setScenarioPct(Number(e.target.value))} style={{width:"160px"}} />
              <span className="chip chipGreen">{scenarioPct}%</span>
            </div>
            <ScenarioChart results={scenarioData} />
          </SectionPanel>
        </></div>)}

        {/* ── TAB: AI Intelligence ── */}
        {activeTab === "intelligence" && (<div id="tabpanel-intelligence" role="tabpanel" aria-label="วิเคราะห์เชิงลึก">
          <SectionPanel title="สรุปข้อมูลเชิงวิเคราะห์"
            subtitle={`วิเคราะห์เชิงลึก (Data Intelligence) จากโครงการที่กรองอยู่ · ${aiInsights.length} ประเด็น`}
            accent="#6d28d9">
            <div className="insightGrid">
              {aiInsights.map((ins,idx)=>(
                <AIInsightCard key={idx} insight={ins}
                  onProjectClick={(pid)=>{
                    const found = filteredProjects.find((p)=>p.id===pid);
                    if(found) setSelectedProject(found);
                  }} />
              ))}
            </div>
          </SectionPanel>
        </div>)}

        {/* ── TAB: Media ── */}
        {activeTab === "media" && (
          <div id="tabpanel-media" role="tabpanel" aria-label="ศูนย์สื่อ">
          <SectionPanel title="ศูนย์สื่อประกอบการพิจารณา" subtitle={`${mediaFiles.length} รายการ`} accent="#f472b6">
            <div className="mediaFilterBar">
              <input className="input" placeholder="ค้นหาชื่อไฟล์..." value={mediaSearch} onChange={(e)=>setMediaSearch(e.target.value)} aria-label="ค้นหาชื่อสื่อ" />
              <div className="mediaTypeFilters">
                {(["all","video","audio","image","document"] as const).map((t)=>(
                  <button key={t} type="button"
                    aria-pressed={mediaTypeFilter === t}
                    className={`mediaTypeBtn ${mediaTypeFilter===t?"mediaTypeBtnActive":""}`}
                    onClick={()=>setMediaTypeFilter(t)}>
                    {t==="all"?"ทั้งหมด":t==="video"?"วิดีโอ":t==="audio"?"บทสรุปเสียง":t==="image"?"ภาพ":"เอกสาร"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mediaGrid">
              <MediaBlock title="วิดีโอ" items={filteredMedia.filter((m)=>m.type==="video")}>
                {(m)=><video className="mediaPlayer" controls src={m.url} />}
              </MediaBlock>
              <MediaBlock title="บทสรุปเสียง (Podcast Brief)" items={filteredMedia.filter((m)=>m.type==="audio")}>
                {(m)=><audio className="audioPlayer" controls src={m.url} />}
              </MediaBlock>
              <MediaBlock title="ภาพ" items={filteredMedia.filter((m)=>m.type==="image")}>
                {(m)=><img className="imageCard" src={m.url} alt={m.name} loading="lazy" />}
              </MediaBlock>
              <MediaBlock title="เอกสาร" items={filteredMedia.filter((m)=>m.type==="document")}>
                {(m)=>(
                  m.textContent ? (
                    <div className="txtDocCard">
                      <div className="txtDocHeader">
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <span style={{fontSize:"1.4rem"}}>📄</span>
                          <div>
                            <strong style={{fontSize:"0.92rem",display:"block"}}>{m.name.replace(/\.[^.]+$/, "")}</strong>
                            <span style={{fontSize:"0.78rem",color:"var(--muted)"}}>{m.ext.toUpperCase()} · {m.textContent.length.toLocaleString()} ตัวอักษร</span>
                          </div>
                        </div>
                        <a href={m.url} target="_blank" rel="noreferrer" className="button buttonSecondary" style={{fontSize:"0.8rem",padding:"6px 14px"}}>↓ ดาวน์โหลด</a>
                      </div>
                      <div className="txtDocBody">
                        {m.textContent.split("\n").map((line, i) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={i} style={{height:"8px"}} />;
                          if (/^[═=─-]{3,}/.test(trimmed)) return <hr key={i} className="txtDocDivider" />;
                          if (/^\d+\.\s/.test(trimmed) || (/^[A-Z]/.test(trimmed) && trimmed.length < 60))
                            return <h4 key={i} className="txtDocHeading">{trimmed}</h4>;
                          if (/^\s{2,}[\-•·]/.test(line) || /^\s{2,}-/.test(line))
                            return <div key={i} className="txtDocBullet">{trimmed}</div>;
                          return <p key={i} className="txtDocPara">{trimmed}</p>;
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="docCard">
                      <div className="docHeader">
                        <strong style={{fontSize:"0.86rem"}}>{m.name}</strong>
                        <a href={m.url} target="_blank" rel="noreferrer">เปิดไฟล์</a>
                      </div>
                      <p className="docPlaceholder">เปิดได้จากลิงก์ด้านบน</p>
                    </div>
                  )
                )}
              </MediaBlock>
            </div>
          </SectionPanel>
          </div>
        )}

        {/* ── TAB: Reports ── */}
        {activeTab === "reports" && (<div id="tabpanel-reports" role="tabpanel" aria-label="รายงาน"><>
          <SectionPanel title="ศูนย์รายงาน" subtitle="ดาวน์โหลดรายงานสำหรับผู้บริหาร" accent="#34d399">
            <div className="reportCards">
              <div className="reportCard glassInner" style={{borderLeftColor:"#38bdf8"}}>
                <h4>ไฟล์ตาราง (CSV)</h4>
                <p>CSV คือไฟล์ข้อมูลแบบตาราง — ส่งต่อทีมวิเคราะห์หรือเปิดใน Excel</p>
                <button type="button" className="button buttonSuccess"
                  onClick={()=>downloadText("ข้อมูลโครงการ.csv",csvText,"text/csv;charset=utf-8")}>↓ ดาวน์โหลดไฟล์ตาราง</button>
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
                </tr></thead>
                <tbody>
                  {filteredProjects.map((p)=>(
                    <tr key={p.id} onClick={()=>setSelectedProject(p)}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{formatNumber(p.budget)}</td>
                      <td>{p.year}</td>
                      <td><span style={{color:PILLAR_COLORS[p.pillar] ?? "#94a3b8",fontSize:"0.82rem"}}>{p.pillarTh||p.pillar}</span></td>
                      <td>{p.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionPanel>
        </></div>)}

        {/* ── TAB: Import ── */}
        {activeTab === "import" && (<div id="tabpanel-import" role="tabpanel" aria-label="นำเข้าข้อมูล">
          <SectionPanel title="นำเข้าข้อมูลโครงการ (CSV คือไฟล์ตารางข้อมูล)" subtitle="รองรับหัวคอลัมน์ภาษาไทยและอังกฤษ" accent="#34d399">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{display:"none"}}
              onChange={(e)=>{const f=e.target.files?.[0];if(f)handleFileImport(f);}} />
            <div className={`dropZone ${isDragging?"dropZoneActive":""}`}
              onClick={()=>fileInputRef.current?.click()}
              onDragOver={(e)=>{e.preventDefault();setIsDragging(true);}}
              onDragLeave={()=>setIsDragging(false)}
              onDrop={(e)=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files[0];if(f)handleFileImport(f);}}>
              <div className="dropZoneIcon">📂</div>
              <p className="dropZoneText">คลิกหรือลากไฟล์ CSV มาวางที่นี่</p>
              <p className="dropZoneSubtext">id · ชื่อโครงการ · งบประมาณ · ปีงบประมาณ · ยุทธศาสตร์ · หมวดหมู่</p>
            </div>
            {importStatus&&(
              <div className="importResult">
                <p className="importResultTitle">✅ นำเข้าสำเร็จ {importStatus.imported} โครงการ (รวม {allProjects.length} โครงการ)</p>
                {importStatus.warnings.map((w,i)=><p key={i} className="importWarning">⚠️ {w}</p>)}
              </div>
            )}
            <div style={{marginTop:"20px"}}>
              <p className="sidebarSectionTitle" style={{marginBottom:"8px"}}>ตัวอย่างรูปแบบ CSV</p>
              <pre className="reportPreviewBox" style={{maxHeight:"140px"}}>{`id,ชื่อโครงการ,งบประมาณ (บาท),ปีงบประมาณ,ยุทธศาสตร์ (en),หมวดหมู่
1,โครงการระบบไซเบอร์,5000000,2567,Smart Governance,เครือข่ายไซเบอร์
2,โครงการ PDPA,3200000,2567,Smart Governance,ความปลอดภัยข้อมูล`}</pre>
            </div>
          </SectionPanel>
        </div>)}

        {/* ── TAB: FAQ ── */}
        {activeTab === "faq" && (<div id="tabpanel-faq" role="tabpanel" aria-label="คำถามที่พบบ่อย">
          <SectionPanel title="คำถามที่ผู้บริหารพบบ่อย" subtitle="คำถาม-คำตอบเกี่ยวกับข้อมูลและการใช้งานระบบ" accent="#6d28d9">
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {([
                {q:"ข้อมูลในระบบนี้มาจากแหล่งใด?", a:"ข้อมูลโครงการทั้งหมดถูกนำเข้าจากฐานข้อมูลโครงการของกองยุทธศาสตร์และงบประมาณ เทศบาลนครนครสวรรค์ โดยสามารถนำเข้าเพิ่มเติมผ่าน CSV ได้ที่แท็บ 'นำเข้าข้อมูล'"},
                {q:"งบประมาณที่แสดงเป็นงบอนุมัติหรืองบเบิกจ่ายจริง?", a:"ตัวเลขงบประมาณเป็น งบตั้งไว้ (Planned Budget) ตามแผนที่ได้รับอนุมัติ ยังไม่ใช่ตัวเลขเบิกจ่ายจริง"},
                {q:"ยุทธศาสตร์เมืองอัจฉริยะ (Smart City) แบ่งเป็นกี่ด้าน?", a:"แบ่งเป็น 4 ด้านหลัก ได้แก่ Smart Governance (การบริหารจัดการอัจฉริยะ), Smart Living (การดำรงชีวิตอัจฉริยะ), Smart Economy (เศรษฐกิจอัจฉริยะ) และ Smart People (พลเมืองอัจฉริยะ) โดยสามารถดูสัดส่วนงบได้ในแท็บ 'วิเคราะห์'"},
                {q:"วิเคราะห์เชิงลึก (Data Intelligence) วิเคราะห์อย่างไร?", a:"ระบบวิเคราะห์จากข้อมูลโครงการที่นำเข้า เช่น งบที่กระจุกตัว หมวดหมู่ซ้ำซ้อน และความสมดุลระหว่างยุทธศาสตร์ โดย ไม่มีการชี้นำ แต่นำเสนอข้อมูลเชิงสถิติเพื่อประกอบการพิจารณา"},
                {q:"สถานะ 'ต้องทบทวน' หมายความว่าอย่างไร?", a:"หมายถึงโครงการที่มีข้อมูลบ่งชี้ว่าควรพิจารณาทบทวนรายละเอียด เช่น งบประมาณสูงกว่าค่าเฉลี่ยของหมวดเดียวกัน หรือเป้าหมายอาจทับซ้อนกับโครงการอื่น ไม่ได้หมายความว่ามีปัญหา"},
                {q:"สามารถส่งออกข้อมูลในรูปแบบใดได้บ้าง?", a:"รองรับ 3 รูปแบบ: CSV (สำหรับ Excel), รายงานสรุปผู้บริหาร (.txt) และรายงานวิเคราะห์เชิงลึก (.txt) ดูได้ที่แท็บ 'รายงาน'"},
                {q:"ข้อมูลสื่อ (วิดีโอ, บทสรุปเสียง, รูปภาพ) คืออะไร?", a:"เป็นสื่อประกอบการพิจารณาที่ทีมงานจัดทำขึ้น เช่น บทสรุปเสียง (Podcast Brief คือสรุปข้อมูลด้วยเสียง), วิดีโอนำเสนอ และภาพประกอบโครงการ สามารถเปิดดูได้ที่แท็บ 'ศูนย์สื่อ'"},
                {q:"ระบบนี้มีการชี้นำการตัดสินใจหรือไม่?", a:"ไม่มี — ระบบนี้ออกแบบมาเพื่อนำเสนอข้อมูลเชิงสถิติในหลายมิติประกอบการพิจารณาของผู้บริหารเท่านั้น ไม่มีการให้คำแนะนำเชิงนโยบายหรือชี้นำทิศทางการตัดสินใจ"},
              ]).map((item, idx) => (
                <details key={idx} style={{
                  borderRadius:"12px", border:"1px solid var(--border)",
                  background:"rgba(248,252,255,0.90)", overflow:"hidden"
                }}>
                  <summary style={{
                    padding:"14px 18px", cursor:"pointer", fontWeight:700, fontSize:"0.93rem",
                    color:"var(--text)", display:"flex", alignItems:"center", gap:"10px",
                    listStyle:"none",
                  }}>
                    <span style={{color:"var(--cyan)",fontSize:"1.1rem",flexShrink:0}}>Q</span>
                    {item.q}
                  </summary>
                  <div style={{
                    padding:"0 18px 16px", color:"var(--text-2)", fontSize:"0.88rem", lineHeight:1.7,
                    borderTop:"1px solid var(--border)", marginTop:"0", paddingTop:"14px"
                  }}>
                    <span style={{color:"var(--violet)",fontWeight:700,marginRight:"6px"}}>A</span>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </SectionPanel>
        </div>)}

        {/* ── TAB: Guide ── */}
        {activeTab === "guide" && (<div id="tabpanel-guide" role="tabpanel" aria-label="คู่มือการใช้งาน">
          <GuideTab onNavigate={(tab: ActiveTab) => setActiveTab(tab)} />
        </div>)}

        {/* ── Footer ── */}
        <footer className="dashFooter">
          <p className="dashFooterCredit">
            🏙️ <strong>Smart City Intelligence Dashboard</strong> — พัฒนาโดย <strong>นักวิชาการคอมพิวเตอร์</strong> กองยุทธศาสตร์และงบประมาณ เทศบาลนครนครสวรรค์
          </p>
          <p className="dashFooterSlogan">
            "Data drives decisions — ข้อมูลนำการตัดสินใจ เมืองอัจฉริยะเริ่มต้นที่ข้อมูลที่ดี"
          </p>
        </footer>

      </main>

      {/* ── Project Detail Modal ── */}
      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={()=>setSelectedProject(null)} />
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function GuideTab({ onNavigate }: { onNavigate: (tab: ActiveTab) => void }) {
  const steps = [
    {
      no: "1",
      icon: "🔍",
      title: "เลือกตัวกรองที่ต้องการ",
      color: "#0369a1",
      desc: "แผงด้านซ้ายมือคือ 'แผงควบคุมและตัวกรอง' — ใช้เลือกปีงบประมาณ ยุทธศาสตร์ หมวดหมู่ หรือพิมพ์ค้นหาชื่อโครงการ",
      tips: [
        "คลิกที่รายการเพื่อเปิด/ปิดการกรอง — รายการที่มีจุดสีน้ำเงินคือ 'เลือกอยู่'",
        "ปรับแถบ 'งบประมาณ' เพื่อกรองเฉพาะโครงการที่มีงบในช่วงที่ต้องการ",
        "แถบสีน้ำเงินด้านบนเนื้อหาจะแสดงว่ากำลังกรองอะไรอยู่",
      ],
    },
    {
      no: "2",
      icon: "📊",
      title: "ดูภาพรวมที่แท็บ 'ภาพรวม'",
      color: "#6d28d9",
      desc: "แท็บ 'ภาพรวม' แสดงตัวชี้วัดหลัก (KPI) สรุปสำหรับผู้บริหาร แผนภูมิเรดาร์ และตารางโครงการทั้งหมด",
      tips: [
        "KPI (Key Performance Indicator) คือตัวชี้วัดผลการดำเนินงาน — ดูได้ตลอดเวลาไม่ว่าจะอยู่แท็บไหน",
        "คลิกแถวในตารางเพื่อดูรายละเอียดโครงการแบบ Popup",
        "แผนภูมิเรดาร์ยิ่งสมมาตรและกว้าง = งบกระจายสมดุลใน 6 มิติ",
      ],
    },
    {
      no: "3",
      icon: "📈",
      title: "วิเคราะห์เชิงลึกที่แท็บ 'วิเคราะห์'",
      color: "#0369a1",
      desc: "แท็บ 'วิเคราะห์' มีแผนภูมิวงกลม กราฟแท่งงบรายโครงการ แผนที่งบประมาณ (Treemap) และการจำลองสถานการณ์",
      tips: [
        "Donut Chart (วงกลม) — ดูว่างบกระจายไปยุทธศาสตร์ใดมากที่สุด",
        "Treemap — คลิกที่ชื่อโครงการเพื่อดูรายละเอียด พื้นที่ยิ่งกว้าง = งบยิ่งมาก",
        "ลากสไลด์ 'Scenario' เพื่อจำลองว่าถ้าเพิ่มงบ X% ผลลัพธ์จะเปลี่ยนอย่างไร",
      ],
    },
    {
      no: "4",
      icon: "🧠",
      title: "อ่านข้อมูลเชิงวิเคราะห์",
      color: "#6d28d9",
      desc: "แท็บ 'วิเคราะห์เชิงลึก' แสดงประเด็นที่ระบบตรวจพบ เช่น งบกระจุกตัว หมวดหมู่ซ้ำซ้อน หรือโอกาสในการปรับปรุง",
      tips: [
        "ป้าย 'ด่วนสูง' (สีแดง) = ประเด็นที่ควรพิจารณาก่อน",
        "คลิกรหัสโครงการ (เช่น #3) เพื่อเปิดรายละเอียดโครงการนั้น",
        "ระบบ ไม่ชี้นำ — นำเสนอข้อมูลเชิงสถิติให้ผู้บริหารพิจารณาเท่านั้น",
      ],
    },
    {
      no: "5",
      icon: "🎥",
      title: "ดูสื่อประกอบที่แท็บ 'ศูนย์สื่อ'",
      color: "#db2777",
      desc: "ศูนย์สื่อรวบรวมวิดีโอนำเสนอ บทสรุปเสียง (Podcast Brief) รูปภาพ และเอกสารประกอบการพิจารณา",
      tips: [
        "กดปุ่ม ▶ เพื่อเล่นวิดีโอหรือเสียงได้โดยตรงในหน้าเว็บ",
        "เอกสาร .txt จะแสดงเนื้อหาให้อ่านได้ทันที — .pdf กดลิงก์เพื่อเปิด",
        "ใช้ช่องค้นหาหรือปุ่มกรองประเภทเพื่อหาสื่อที่ต้องการเร็วขึ้น",
      ],
    },
    {
      no: "6",
      icon: "📄",
      title: "ดาวน์โหลดรายงานที่แท็บ 'รายงาน'",
      color: "#059669",
      desc: "ระบบสร้างรายงานอัตโนมัติจากข้อมูลที่กรองอยู่ — พร้อมส่งออกเป็น CSV (Excel) และไฟล์รายงาน .txt",
      tips: [
        "CSV คือไฟล์ตารางข้อมูล — เปิดได้ใน Microsoft Excel หรือ Google Sheets",
        "รายงานสรุปผู้บริหาร — ภาพรวมงบ ยุทธศาสตร์ รายชื่อโครงการ",
        "รายงานวิเคราะห์เชิงลึก — ประเด็นซ้ำซ้อน งบกระจุกตัว ข้อเสนอแนะ",
      ],
    },
  ];

  const glossary = [
    { term: "KPI", full: "Key Performance Indicator", th: "ตัวชี้วัดผลการดำเนินงาน" },
    { term: "Treemap", full: "Treemap Chart", th: "แผนที่สัดส่วนงบประมาณ — พื้นที่กว้าง = งบมาก" },
    { term: "Radar Chart", full: "Radar / Spider Chart", th: "แผนภูมิแมงมุม — ดูความสมดุล 6 มิติ" },
    { term: "Smart Governance", full: "Smart Governance", th: "การบริหารจัดการอัจฉริยะ" },
    { term: "Smart Living", full: "Smart Living", th: "การดำรงชีวิตอัจฉริยะ" },
    { term: "Smart Economy", full: "Smart Economy", th: "เศรษฐกิจอัจฉริยะ" },
    { term: "Smart People", full: "Smart People", th: "พลเมืองอัจฉริยะ" },
    { term: "Scenario Simulation", full: "Scenario Simulation", th: "การจำลองสถานการณ์ — ดูผลลัพธ์สมมติเมื่อเพิ่มงบ" },
    { term: "CSV", full: "Comma-Separated Values", th: "ไฟล์ตารางข้อมูล เปิดได้ใน Excel" },
    { term: "SDG", full: "Sustainable Development Goals", th: "เป้าหมายการพัฒนาที่ยั่งยืน (UN)" },
    { term: "Podcast Brief", full: "Audio Summary", th: "บทสรุปในรูปแบบเสียง" },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      {/* Hero */}
      <article className="panel glass" style={{borderLeft:"4px solid #0369a1",padding:"28px 30px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:"18px",flexWrap:"wrap"}}>
          <span style={{fontSize:"3rem",lineHeight:1}}>📖</span>
          <div style={{flex:1,minWidth:"200px"}}>
            <h2 style={{margin:"0 0 6px",fontSize:"1.4rem",fontWeight:900,color:"var(--text)"}}>คู่มือการใช้งานระบบ Smart City Intelligence</h2>
            <p style={{margin:0,color:"var(--muted)",fontSize:"0.92rem",lineHeight:1.6}}>สำหรับผู้บริหารและเจ้าหน้าที่ที่ใช้งานครั้งแรก — อ่านครั้งเดียวเพื่อใช้งานได้ทันที</p>
          </div>
          <button type="button" className="button" style={{flexShrink:0}} onClick={()=>onNavigate("overview")}>เริ่มใช้งาน →</button>
        </div>
        <div style={{marginTop:"20px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"10px"}}>
          {[
            ["📊","7 แท็บหลัก","ครอบคลุมทุกมิติการวิเคราะห์"],
            ["🔍","กรองข้อมูลได้","ตามปี ยุทธศาสตร์ งบประมาณ"],
            ["📄","ส่งออกรายงาน","CSV, TXT พร้อมใช้งาน"],
            ["🎥","สื่อประกอบ","วิดีโอ เสียง รูปภาพ เอกสาร"],
          ].map(([icon,title,sub])=>(
            <div key={title as string} className="glassInner" style={{borderRadius:"var(--radius-sm)",padding:"14px",display:"flex",flexDirection:"column",gap:"4px"}}>
              <span style={{fontSize:"1.5rem"}}>{icon}</span>
              <strong style={{fontSize:"0.9rem",color:"var(--text)"}}>{title}</strong>
              <span style={{fontSize:"0.78rem",color:"var(--muted)"}}>{sub}</span>
            </div>
          ))}
        </div>
      </article>

      {/* Step-by-step */}
      <article className="panel glass" style={{borderLeft:"4px solid #6d28d9"}}>
        <div className="sectionHead"><div>
          <h2 className="sectionTitle">วิธีใช้งานทีละขั้นตอน</h2>
          <p className="sectionSubtitle">แนะนำลำดับการใช้งานที่เหมาะสมที่สุด</p>
        </div></div>
        <div style={{display:"grid",gap:"14px"}}>
          {steps.map((s) => (
            <div key={s.no} className="glassInner" style={{borderRadius:"var(--radius)",padding:"18px 20px",borderLeft:`3px solid ${s.color}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"14px"}}>
                <div style={{flexShrink:0,width:"36px",height:"36px",borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"0.95rem"}}>{s.no}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                    <span style={{fontSize:"1.2rem"}}>{s.icon}</span>
                    <strong style={{fontSize:"1rem",color:"var(--text)"}}>{s.title}</strong>
                  </div>
                  <p style={{margin:"0 0 10px",color:"var(--text-2)",fontSize:"0.88rem",lineHeight:1.65}}>{s.desc}</p>
                  <ul style={{margin:0,paddingLeft:"18px",display:"flex",flexDirection:"column",gap:"4px"}}>
                    {s.tips.map((tip,i) => (
                      <li key={i} style={{color:"var(--muted)",fontSize:"0.84rem",lineHeight:1.55}}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Quick Nav */}
      <article className="panel glass" style={{borderLeft:"4px solid #059669"}}>
        <div className="sectionHead"><div>
          <h2 className="sectionTitle">ไปยังส่วนต่างๆ ได้เลย</h2>
          <p className="sectionSubtitle">คลิกปุ่มด้านล่างเพื่อเปิดแท็บที่ต้องการ</p>
        </div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"10px"}}>
          {([
            ["overview","📊 ภาพรวม","#0369a1","ดูตัวชี้วัดและตารางโครงการ"],
            ["analytics","📈 วิเคราะห์","#6d28d9","กราฟวงกลม Treemap Scenario"],
            ["intelligence","🧠 เชิงลึก","#6d28d9","ประเด็นที่ระบบตรวจพบ"],
            ["media","🎥 ศูนย์สื่อ","#db2777","วิดีโอ เสียง รูปภาพ เอกสาร"],
            ["reports","📄 รายงาน","#059669","ส่งออก CSV และรายงาน .txt"],
            ["import","📥 นำเข้า","#d97706","นำเข้าข้อมูลจากไฟล์ CSV"],
            ["faq","❓ คำถาม","#0369a1","คำถามที่ผู้บริหารพบบ่อย"],
          ] as [ActiveTab,string,string,string][]).map(([tab,label,color,desc])=>(
            <button key={tab} type="button"
              onClick={()=>onNavigate(tab)}
              style={{textAlign:"left",padding:"14px 16px",borderRadius:"var(--radius-sm)",border:`1px solid ${color}33`,background:`${color}08`,cursor:"pointer",transition:"150ms ease"}}
              onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background=`${color}14`;}}
              onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background=`${color}08`;}}>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--text)",marginBottom:"3px"}}>{label}</div>
              <div style={{fontSize:"0.78rem",color:"var(--muted)"}}>{desc}</div>
            </button>
          ))}
        </div>
      </article>

      {/* Glossary */}
      <article className="panel glass" style={{borderLeft:"4px solid #d97706"}}>
        <div className="sectionHead"><div>
          <h2 className="sectionTitle">คำศัพท์ที่ควรรู้ (Glossary)</h2>
          <p className="sectionSubtitle">คำอธิบายศัพท์เทคนิคและภาษาอังกฤษในระบบ</p>
        </div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"10px"}}>
          {glossary.map((g) => (
            <div key={g.term} className="glassInner" style={{borderRadius:"var(--radius-sm)",padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"baseline",gap:"8px",flexWrap:"wrap",marginBottom:"4px"}}>
                <strong style={{fontSize:"0.95rem",color:"var(--cyan)"}}>{g.term}</strong>
                <span style={{fontSize:"0.75rem",color:"var(--muted)"}}>{g.full}</span>
              </div>
              <p style={{margin:0,fontSize:"0.86rem",color:"var(--text-2)",lineHeight:1.5}}>{g.th}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

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

function AIInsightCard({ insight, onProjectClick }: { insight: AIInsight; onProjectClick?: (id: number) => void }) {
  const color = INSIGHT_COLORS[insight.type] ?? "#94a3b8";
  const typeLabel: Record<string,string> = {warning:"⚠️ คำเตือน",risk:"🔴 ความเสี่ยง",opportunity:"✅ โอกาส",info:"ℹ️ ข้อมูล"};
  const urgencyClass = insight.urgency==="high"?"urgencyHigh":insight.urgency==="medium"?"urgencyMed":"urgencyLow";
  return (
    <div className="insightCard glassInner" style={{borderLeft:`3px solid ${color}33`,background:`${color}06`}}>
      <div className="insightTop">
        <span className="insightTypeLabel" style={{color}}>{typeLabel[insight.type]}</span>
        <span className={`urgencyBadge ${urgencyClass}`}>{insight.urgency==="high"?"ด่วน":insight.urgency==="medium"?"ติดตาม":"ข้อมูล"}</span>
      </div>
      <h4 className="insightTitle">{insight.title}</h4>
      <p className="insightDesc">{insight.description}</p>
      {insight.affectedProjects && insight.affectedProjects.length > 0 && (
        <div className="insightRefs">
          {insight.affectedProjects.map((id)=>(
            <button key={id} type="button"
              className="chip chipCyan"
              style={{fontSize:"0.76rem",padding:"3px 8px",cursor:onProjectClick?"pointer":"default",border:"none"}}
              onClick={()=>onProjectClick?.(id)}>
              โครงการ #{id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TreemapChart({ nodes, onCellClick }: { nodes: TreemapNode[]; onCellClick?: (label: string) => void }) {
  if (!nodes.length) return <div className="emptyState">ไม่มีข้อมูล</div>;
  return (
    <div className="treemapWrap">
      {nodes.map((node)=>(
        <div key={node.label} className="treemapPillar" style={{width:`${node.width}%`,borderColor:node.color}}>
          <div className="treemapPillarLabel" style={{color:node.color}}>{node.label}</div>
          <div className="treemapChildren">
            {(node.children??[]).map((child)=>(
              <div key={child.label} className="treemapCell"
                style={{background:`${node.color}1e`,borderColor:`${node.color}3a`,height:`${child.height??20}px`,cursor:onCellClick?"pointer":"default"}}
                onClick={()=>onCellClick?.(child.label)}
                title={onCellClick ? `คลิกดูรายละเอียด: ${child.label}` : undefined}>
                <span className="treemapCellName">{child.label.length > 22 ? child.label.slice(0, 22) + "…" : child.label}</span>
                <span className="treemapCellVal">{((child.value??0)/1_000_000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
      ))}
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
            <div className="barFill" style={{width:`${(r.benefitScore/max)*100}%`,background:PILLAR_COLORS[r.pillar]??"#0369a1"}} />
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

function ProjectDetailModal({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const pillarColor = PILLAR_COLORS[p.pillar] ?? "#0369a1";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modalOverlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modalPanel" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        <div className="modalHeader">
          <h2 className="modalTitle" id="modal-title">{p.name}</h2>
          <button type="button" className="modalClose" onClick={onClose} aria-label="ปิด">✕</button>
        </div>

        {p.description && (
          <div className="modalDescBox">
            <p style={{margin:0,lineHeight:1.7}}>{p.description}</p>
          </div>
        )}

        <div className="modalBudgetBig">
          <p className="modalBudgetLabel">งบประมาณ</p>
          <p className="modalBudgetValue">{formatNumber(p.budget)}</p>
          <p className="modalBudgetUnit">บาท · {(p.budget / 1_000_000).toFixed(2)} ล้านบาท</p>
        </div>

        <div className="modalSection">
          <p className="modalSectionTitle">ข้อมูลทั่วไป</p>
          <div className="modalGrid">
            <div className="modalKV">
              <p className="modalKVLabel">รหัสโครงการ</p>
              <p className="modalKVValue">#{p.id}</p>
            </div>
            <div className="modalKV">
              <p className="modalKVLabel">ปีงบประมาณ</p>
              <p className="modalKVValue">{p.year}</p>
            </div>
            <div className="modalKV">
              <p className="modalKVLabel">ยุทธศาสตร์</p>
              <p className="modalKVValue" style={{color: pillarColor}}>{p.pillarTh || p.pillar}</p>
            </div>
            <div className="modalKV">
              <p className="modalKVLabel">หมวดหมู่</p>
              <p className="modalKVValue">{p.category}</p>
            </div>
          </div>
        </div>

        {p.sdgGoals && p.sdgGoals.length > 0 && (
          <div className="modalSection">
            <p className="modalSectionTitle">เป้าหมายการพัฒนาที่ยั่งยืน (SDG Goals)</p>
            <div className="modalTags">
              {p.sdgGoals.map((g) => <span key={g} className="modalTag">SDG {g}</span>)}
            </div>
          </div>
        )}

        {p.tags && p.tags.length > 0 && (
          <div className="modalSection">
            <p className="modalSectionTitle">แท็ก</p>
            <div className="modalTags">
              {p.tags.map((t) => <span key={t} className="modalTag">{t}</span>)}
            </div>
          </div>
        )}

        <div className="modalActions">
          <button type="button" className="button buttonSecondary" onClick={onClose}>ปิด</button>
        </div>

      </div>
    </div>
  );
}

