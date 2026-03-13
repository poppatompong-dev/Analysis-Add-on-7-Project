"use client";

import { useMemo, useState } from "react";
import { applyFilters } from "@/lib/filters";
import { buildCsv, buildDeepAnalysis, buildExecutiveReport } from "@/lib/reports";
import { formatNumber, getExecutiveInsights, getExecutiveSummary, getMetrics } from "@/lib/insights";
import { Filters, MediaFile, Project } from "@/types/project";

type DashboardAppProps = {
  initialProjects: Project[];
  mediaFiles: MediaFile[];
  options: {
    years: string[];
    pillars: string[];
    categories: string[];
    budgetRange: [number, number];
  };
  generatedAt: string;
};

type ReportView = "executive" | "analysis";

const pillarColors: Record<string, string> = {
  "Smart Governance": "#38bdf8",
  "Smart Living": "#a78bfa",
  "Smart Economy": "#34d399",
  "Smart People": "#f59e0b",
};

export default function DashboardApp({ initialProjects, mediaFiles, options, generatedAt }: DashboardAppProps) {
  const defaultFilters: Filters = {
    query: "",
    years: options.years,
    pillars: options.pillars,
    categories: options.categories,
    budgetRange: options.budgetRange,
  };

  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
  });
  const [reportView, setReportView] = useState<ReportView>("executive");

  const filteredProjects = useMemo(() => applyFilters(initialProjects, filters), [initialProjects, filters]);
  const metrics = useMemo(() => getMetrics(filteredProjects), [filteredProjects]);
  const summaryBullets = useMemo(() => getExecutiveSummary(filteredProjects, initialProjects), [filteredProjects, initialProjects]);
  const insightBullets = useMemo(() => getExecutiveInsights(initialProjects), [initialProjects]);

  const csvText = useMemo(() => `\uFEFF${buildCsv(filteredProjects)}`, [filteredProjects]);
  const executiveReport = useMemo(() => buildExecutiveReport(filteredProjects, filters, generatedAt), [filteredProjects, filters, generatedAt]);
  const deepAnalysis = useMemo(() => buildDeepAnalysis(filteredProjects, filters, generatedAt), [filteredProjects, filters, generatedAt]);
  const manualText = useMemo(() => buildManualText(generatedAt), [generatedAt]);

  const projectBars = useMemo(() => {
    const max = Math.max(...filteredProjects.map((item) => item.budget), 1);
    return [...filteredProjects].sort((a, b) => b.budget - a.budget).map((item) => ({
      ...item,
      width: (item.budget / max) * 100,
    }));
  }, [filteredProjects]);

  const pillarData = useMemo(() => {
    const grouped = new Map<string, number>();
    filteredProjects.forEach((item) => grouped.set(item.pillar, (grouped.get(item.pillar) || 0) + item.budget));
    const total = Array.from(grouped.values()).reduce((sum, value) => sum + value, 0);
    let offset = 0;

    return Array.from(grouped.entries()).map(([label, value]) => {
      const ratio = total ? value / total : 0;
      const segment = {
        label,
        value,
        ratio,
        dash: `${ratio * 282.6} ${282.6 - ratio * 282.6}`,
        offset: -offset,
        color: pillarColors[label] || "#94a3b8",
      };
      offset += ratio * 282.6;
      return segment;
    });
  }, [filteredProjects]);

  const yearPillarMatrix = useMemo(() => {
    return options.years.map((year) => ({
      year,
      values: options.pillars.map((pillar) => {
        const value = filteredProjects
          .filter((item) => item.year === year && item.pillar === pillar)
          .reduce((sum, item) => sum + item.budget, 0);
        return { pillar, value };
      }),
    }));
  }, [filteredProjects, options.years, options.pillars]);

  const categoryData = useMemo(() => {
    const max = Math.max(...filteredProjects.map((item) => item.budget), 1);
    return options.categories.map((category) => {
      const total = filteredProjects.filter((item) => item.category === category).reduce((sum, item) => sum + item.budget, 0);
      return { category, total, width: (total / max) * 100 };
    });
  }, [filteredProjects, options.categories]);

  const activeFilterChips = useMemo(() => {
    const chips: string[] = [];
    if (filters.query.trim()) chips.push(`ค้นหา: ${filters.query.trim()}`);
    if (filters.years.length !== options.years.length) chips.push(`ปีงบฯ: ${filters.years.join(", ")}`);
    if (filters.pillars.length !== options.pillars.length) chips.push(`ยุทธศาสตร์: ${filters.pillars.length} รายการ`);
    if (filters.categories.length !== options.categories.length) chips.push(`หมวดหมู่: ${filters.categories.length} รายการ`);
    if (filters.budgetRange[0] !== options.budgetRange[0] || filters.budgetRange[1] !== options.budgetRange[1]) {
      chips.push(`งบ: ${formatNumber(filters.budgetRange[0])} - ${formatNumber(filters.budgetRange[1])}`);
    }
    return chips;
  }, [filters, options]);

  const mediaCounts = useMemo(
    () => ({
      total: mediaFiles.length,
      video: mediaFiles.filter((item) => item.type === "video").length,
      audio: mediaFiles.filter((item) => item.type === "audio").length,
      image: mediaFiles.filter((item) => item.type === "image").length,
      document: mediaFiles.filter((item) => item.type === "document").length,
    }),
    [mediaFiles]
  );

  const reportText = reportView === "executive" ? executiveReport : deepAnalysis;
  const totalAll = initialProjects.reduce((sum, item) => sum + item.budget, 0);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyPreset = (preset: "all" | "cyber" | "compliance" | "consulting") => {
    if (preset === "all") {
      setFilters({ ...defaultFilters });
      return;
    }
    if (preset === "cyber") {
      setFilters({
        ...defaultFilters,
        pillars: ["Smart Governance"],
        categories: ["เครือข่ายไซเบอร์"],
      });
      return;
    }
    if (preset === "compliance") {
      setFilters({
        ...defaultFilters,
        categories: ["ความปลอดภัยข้อมูล"],
        pillars: ["Smart Governance", "Smart Living"],
      });
      return;
    }
    setFilters({
      ...defaultFilters,
      categories: ["ที่ปรึกษาและนโยบาย"],
      pillars: ["Smart Economy", "Smart People"],
    });
  };

  return (
    <div className="shell">
      <aside className="sidebar glass">
        <div className="sidebarBlock">
          <p className="eyebrow">Smart Filter</p>
          <h2 className="sidebarTitle">ตัวกรองอัจฉริยะ</h2>
          <p className="sidebarDescription">ทุกส่วนจะปรับเปลี่ยนแบบทันที และรายงานทั้งหมดจะสร้างจากมุมมองที่คุณกำลังเลือกอยู่</p>
        </div>

        <div className="sidebarBlock">
          <label className="fieldLabel">ค้นหาชื่อโครงการ</label>
          <input
            className="input"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            placeholder="พิมพ์คำค้น เช่น ไซเบอร์, PDPA"
          />
        </div>

        <FilterChecklist
          label="ปีงบประมาณ"
          options={options.years}
          selected={filters.years}
          onToggle={(value) => setFilters((prev) => ({ ...prev, years: toggleValue(prev.years, value, options.years) }))}
        />
        <FilterChecklist
          label="ยุทธศาสตร์"
          options={options.pillars}
          selected={filters.pillars}
          onToggle={(value) => setFilters((prev) => ({ ...prev, pillars: toggleValue(prev.pillars, value, options.pillars) }))}
        />
        <FilterChecklist
          label="หมวดหมู่การลงทุน"
          options={options.categories}
          selected={filters.categories}
          onToggle={(value) => setFilters((prev) => ({ ...prev, categories: toggleValue(prev.categories, value, options.categories) }))}
        />

        <div className="sidebarBlock">
          <div className="fieldRow">
            <label className="fieldLabel">ช่วงงบประมาณ</label>
            <span className="fieldMeta">{formatNumber(filters.budgetRange[0])} - {formatNumber(filters.budgetRange[1])}</span>
          </div>
          <input
            type="range"
            min={options.budgetRange[0]}
            max={options.budgetRange[1]}
            step={100000}
            value={filters.budgetRange[0]}
            onChange={(event) => {
              const value = Number(event.target.value);
              setFilters((prev) => ({ ...prev, budgetRange: [Math.min(value, prev.budgetRange[1]), prev.budgetRange[1]] }));
            }}
          />
          <input
            type="range"
            min={options.budgetRange[0]}
            max={options.budgetRange[1]}
            step={100000}
            value={filters.budgetRange[1]}
            onChange={(event) => {
              const value = Number(event.target.value);
              setFilters((prev) => ({ ...prev, budgetRange: [prev.budgetRange[0], Math.max(value, prev.budgetRange[0])] }));
            }}
          />
          <div className="budgetFields">
            <input
              className="input"
              type="number"
              value={filters.budgetRange[0]}
              onChange={(event) => {
                const value = Number(event.target.value || 0);
                setFilters((prev) => ({ ...prev, budgetRange: [Math.min(value, prev.budgetRange[1]), prev.budgetRange[1]] }));
              }}
            />
            <input
              className="input"
              type="number"
              value={filters.budgetRange[1]}
              onChange={(event) => {
                const value = Number(event.target.value || 0);
                setFilters((prev) => ({ ...prev, budgetRange: [prev.budgetRange[0], Math.max(value, prev.budgetRange[0])] }));
              }}
            />
          </div>
        </div>

        <div className="sidebarBlock resultCard">
          <div>
            <p className="eyebrow">ผลลัพธ์</p>
            <h3>{filteredProjects.length} / {initialProjects.length} โครงการ</h3>
          </div>
          <p>{formatNumber(metrics.totalBudget)} บาท</p>
        </div>

        <button
          className="button secondaryButton"
          onClick={() =>
            setFilters({
              query: "",
              years: options.years,
              pillars: options.pillars,
              categories: options.categories,
              budgetRange: options.budgetRange,
            })
          }
        >
          รีเซ็ตตัวกรองทั้งหมด
        </button>
      </aside>

      <main className="content">
        <section className="hero glass">
          <div>
            <span className="badge">Executive Analytics</span>
            <h1 className="heroTitle">Nakhon Sawan Smart City Project Intelligence</h1>
            <p className="heroSubtitle">ระบบวิเคราะห์โครงการเมืองอัจฉริยะสำหรับผู้บริหาร ใช้ตัดสินใจเรื่องงบประมาณ ความซ้ำซ้อนของโครงการ และลำดับความสำคัญของการลงทุนได้ทันที</p>
            <div className="chipRow">
              <span className="chip">ข้อมูลจริง {initialProjects.length} โครงการ</span>
              <span className="chip">งบรวม {formatNumber(totalAll)} บาท</span>
              <span className="chip">ออกรายงานได้ทันที</span>
              <span className="chip mediaChip">ศูนย์สื่อ {mediaCounts.total} รายการ</span>
            </div>
          </div>
          <div className="heroPanel glassInner">
            <p className="eyebrow">Generated</p>
            <h3>{generatedAt}</h3>
            <p>พร้อมสำหรับ large screen, touch screen และการนำเสนอผู้บริหาร</p>
            <div className="reportButtons compactButtons">
              <button type="button" className="button" onClick={() => downloadText("คู่มือการใช้งาน_ระบบวิเคราะห์โครงการเมืองอัจฉริยะ.txt", manualText, "text/plain;charset=utf-8")}>ดาวน์โหลดคู่มือ</button>
              <button type="button" className="button secondaryButton" onClick={() => downloadText("ข้อมูลโครงการ_เมืองอัจฉริยะ.csv", csvText, "text/csv;charset=utf-8")}>ดาวน์โหลด CSV</button>
              <button type="button" className="button secondaryButton" onClick={() => scrollToSection("media-center")}>ไปที่ศูนย์สื่อ</button>
            </div>
          </div>
        </section>

        {activeFilterChips.length > 0 && (
          <section className="activeFilters">
            {activeFilterChips.map((chip) => (
              <span key={chip} className="activeChip">{chip}</span>
            ))}
          </section>
        )}

        <section className="quickAccess glass">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Quick Access</p>
              <h2>เข้าถึงส่วนสำคัญและโหมดวิเคราะห์ได้ทันที</h2>
            </div>
          </div>
          <div className="quickAccessGrid">
            <div className="quickCard glassInner">
              <h3>ไปยังส่วนสำคัญ</h3>
              <div className="quickButtonGrid">
                <button type="button" className="button" onClick={() => scrollToSection("overview-section")}>สรุปภาพรวม</button>
                <button type="button" className="button secondaryButton" onClick={() => scrollToSection("reports-center")}>ศูนย์ออกรายงาน</button>
                <button type="button" className="button secondaryButton" onClick={() => scrollToSection("data-table")}>ตารางข้อมูล</button>
                <button type="button" className="button" onClick={() => scrollToSection("media-center")}>ศูนย์สื่อประกอบการพิจารณา</button>
              </div>
            </div>
            <div className="quickCard glassInner">
              <h3>Interactive Presets</h3>
              <p>กดครั้งเดียวเพื่อเปลี่ยนมุมมองการวิเคราะห์ให้เหมาะกับเรื่องที่ผู้บริหารกำลังพิจารณา</p>
              <div className="presetList">
                <button type="button" className="presetButton" onClick={() => applyPreset("all")}>มุมมองรวมทั้งหมด</button>
                <button type="button" className="presetButton" onClick={() => applyPreset("compliance")}>โหมดงานเร่งด่วนตามข้อกำหนด</button>
                <button type="button" className="presetButton" onClick={() => applyPreset("cyber")}>โหมดทบทวนโครงการไซเบอร์</button>
                <button type="button" className="presetButton" onClick={() => applyPreset("consulting")}>โหมดงานที่ปรึกษาและนโยบาย</button>
              </div>
            </div>
          </div>
        </section>

        <section id="overview-section" className="metricsGrid">
          <MetricCard label="งบประมาณรวม" value={`${formatNumber(metrics.totalBudget)}`} sub="บาท" accent="cyan" />
          <MetricCard label="จำนวนโครงการ" value={`${filteredProjects.length}`} sub={`จาก ${initialProjects.length} โครงการทั้งหมด`} accent="violet" />
          <MetricCard label="งบเฉลี่ยต่อโครงการ" value={`${formatNumber(Math.round(metrics.avgBudget))}`} sub="บาทต่อโครงการ" accent="green" />
          <MetricCard label="ยุทธศาสตร์ที่เกี่ยวข้อง" value={`${metrics.pillarCount}`} sub="ยุทธศาสตร์ในมุมมองปัจจุบัน" accent="amber" />
        </section>

        <section className="twoCol">
          <Panel title="AI Executive Summary" subtitle="สรุปอัตโนมัติจากข้อมูลที่กรองอยู่">
            <ul className="bulletList">
              {summaryBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="Executive Insight" subtitle="ประเด็นสำคัญเชิงตัดสินใจจากภาพรวมทั้งหมด">
            <ul className="bulletList warningList">
              {insightBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>
        </section>

        <section className="chartsGrid">
          <Panel title="สัดส่วนงบประมาณตามยุทธศาสตร์" subtitle="Donut view ของมุมมองปัจจุบัน">
            <div className="donutWrap">
              <svg viewBox="0 0 120 120" className="donutChart">
                <circle cx="60" cy="60" r="45" className="donutTrack" />
                {pillarData.map((segment) => (
                  <circle
                    key={segment.label}
                    cx="60"
                    cy="60"
                    r="45"
                    className="donutSegment"
                    stroke={segment.color}
                    strokeDasharray={segment.dash}
                    strokeDashoffset={segment.offset}
                  />
                ))}
              </svg>
              <div className="donutCenter">
                <strong>{formatNumber(metrics.totalBudget)}</strong>
                <span>บาท</span>
              </div>
            </div>
            <div className="legendList">
              {pillarData.map((item) => (
                <div key={item.label} className="legendRow">
                  <span className="legendDot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{Math.round(item.ratio * 100)}%</strong>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="งบประมาณรายโครงการ" subtitle="เรียงจากมากไปน้อยเพื่อมองเห็นตัวขับงบหลัก">
            <div className="barList">
              {projectBars.map((item) => (
                <div key={item.id} className="barItem">
                  <div className="barHeader">
                    <span>#{item.id} {item.name}</span>
                    <strong>{formatNumber(item.budget)} บาท</strong>
                  </div>
                  <div className="barTrack">
                    <div className="barFill" style={{ width: `${item.width}%`, background: pillarColors[item.pillar] || "#38bdf8" }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="chartsGrid lowerCharts">
          <Panel title="งบประมาณแยกตามปีและยุทธศาสตร์" subtitle="ดูการกระจายงบในแต่ละปีงบประมาณ">
            <div className="yearGroups">
              {yearPillarMatrix.map((row) => (
                <div key={row.year} className="yearGroup">
                  <h4>พ.ศ. {row.year}</h4>
                  <div className="miniBars">
                    {row.values.map((item) => {
                      const max = Math.max(...row.values.map((entry) => entry.value), 1);
                      const width = (item.value / max) * 100;
                      return (
                        <div key={item.pillar} className="miniBarRow">
                          <span>{item.pillar}</span>
                          <div className="miniBarTrack">
                            <div className="miniBarFill" style={{ width: `${width}%`, background: pillarColors[item.pillar] || "#38bdf8" }} />
                          </div>
                          <strong>{formatNumber(item.value)}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="งบประมาณตามหมวดหมู่การลงทุน" subtitle="มองเห็นสัดส่วนการใช้เงินตาม nature ของโครงการ">
            <div className="barList compact">
              {categoryData.map((item) => (
                <div key={item.category} className="barItem">
                  <div className="barHeader">
                    <span>{item.category}</span>
                    <strong>{formatNumber(item.total)} บาท</strong>
                  </div>
                  <div className="barTrack">
                    <div className="barFill gradientFill" style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mediaSpotlight glass">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Media Spotlight</p>
              <h2>ศูนย์สื่อประกอบการพิจารณา</h2>
              <p className="spotlightText">ส่วนนี้รวมวิดีโอ เสียง ภาพ และเอกสารประกอบทั้งหมดไว้ในที่เดียว เพื่อช่วยให้ผู้ใช้หาไฟล์อ้างอิงได้ง่ายขึ้นระหว่างการประชุม</p>
            </div>
            <button type="button" className="button" onClick={() => scrollToSection("media-center")}>เปิดศูนย์สื่อทันที</button>
          </div>
          <div className="spotlightStats">
            <div className="spotlightStat glassInner"><strong>{mediaCounts.video}</strong><span>วิดีโอ</span></div>
            <div className="spotlightStat glassInner"><strong>{mediaCounts.audio}</strong><span>เสียง</span></div>
            <div className="spotlightStat glassInner"><strong>{mediaCounts.image}</strong><span>ภาพ</span></div>
            <div className="spotlightStat glassInner"><strong>{mediaCounts.document}</strong><span>เอกสาร</span></div>
          </div>
        </section>

        <section id="reports-center" className="reportCenter glass">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Reporting Center</p>
              <h2>ศูนย์ออกรายงานและไฟล์ดาวน์โหลด</h2>
            </div>
            <div className="reportButtons">
              <button type="button" className="button" onClick={() => downloadText("ข้อมูลโครงการ_เมืองอัจฉริยะ.csv", csvText, "text/csv;charset=utf-8")}>ดาวน์โหลด CSV</button>
              <button type="button" className="button" onClick={() => downloadText("รายงานสรุปผู้บริหาร.txt", executiveReport, "text/plain;charset=utf-8")}>ดาวน์โหลดรายงานสรุป</button>
              <button type="button" className="button secondaryButton" onClick={() => downloadText("รายงานวิเคราะห์เชิงลึก.txt", deepAnalysis, "text/plain;charset=utf-8")}>ดาวน์โหลดรายงานวิเคราะห์</button>
            </div>
          </div>

          <div className="reportCardGrid">
            <ReportCard title="CSV ข้อมูลดิบ" description="ใช้เปิดใน Excel หรือส่งต่อให้ทีมวิเคราะห์ได้ทันที" actionLabel="ดาวน์โหลด CSV" onClick={() => downloadText("ข้อมูลโครงการ_เมืองอัจฉริยะ.csv", csvText, "text/csv;charset=utf-8")} />
            <ReportCard title="รายงานสรุปผู้บริหาร" description="สรุปภาพรวม งบประมาณ ยุทธศาสตร์ และรายชื่อโครงการในมุมมองปัจจุบัน" actionLabel="ดาวน์โหลดรายงานสรุป" onClick={() => downloadText("รายงานสรุปผู้บริหาร.txt", executiveReport, "text/plain;charset=utf-8")} />
            <ReportCard title="รายงานวิเคราะห์เชิงลึก" description="เน้นประเด็นซ้ำซ้อน งบกระจุกตัว และข้อพิจารณาสำหรับผู้บริหาร" actionLabel="ดาวน์โหลดรายงานวิเคราะห์" onClick={() => downloadText("รายงานวิเคราะห์เชิงลึก.txt", deepAnalysis, "text/plain;charset=utf-8")} />
          </div>

          <div className="previewToolbar">
            <button type="button" className={`previewTab ${reportView === "executive" ? "isActive" : ""}`} onClick={() => setReportView("executive")}>Preview รายงานสรุป</button>
            <button type="button" className={`previewTab ${reportView === "analysis" ? "isActive" : ""}`} onClick={() => setReportView("analysis")}>Preview รายงานวิเคราะห์</button>
          </div>
          <pre className="reportPreview">{reportText}</pre>
        </section>

        <section id="data-table" className="dataTableSection glass">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Project Detail</p>
              <h2>ตารางข้อมูลรายละเอียดโครงการ</h2>
            </div>
            <button type="button" className="button secondaryButton" onClick={() => downloadText("ข้อมูลโครงการ_เมืองอัจฉริยะ.csv", csvText, "text/csv;charset=utf-8")}>ดาวน์โหลดตารางนี้</button>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อโครงการ</th>
                  <th>งบประมาณ</th>
                  <th>ปีงบประมาณ</th>
                  <th>ยุทธศาสตร์</th>
                  <th>หมวดหมู่</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{formatNumber(item.budget)} บาท</td>
                    <td>{item.year}</td>
                    <td>{item.pillarTh}</td>
                    <td>{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="media-center" className="mediaSection glass">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Media Center</p>
              <h2>ศูนย์สื่อประกอบการพิจารณา</h2>
            </div>
            <span className="chip">ไฟล์ทั้งหมด {mediaFiles.length} รายการ</span>
          </div>

          <div className="mediaGrid">
            <MediaBlock title="วิดีโอ" items={mediaFiles.filter((item) => item.type === "video")}> 
              {(item) => <video className="mediaPlayer" controls src={item.url} />}
            </MediaBlock>
            <MediaBlock title="เสียง" items={mediaFiles.filter((item) => item.type === "audio")}>
              {(item) => <audio className="audioPlayer" controls src={item.url} />}
            </MediaBlock>
            <MediaBlock title="ภาพ" items={mediaFiles.filter((item) => item.type === "image")}>
              {(item) => <img className="imageCard" src={item.url} alt={item.name} loading="lazy" />}
            </MediaBlock>
            <MediaBlock title="เอกสาร" items={mediaFiles.filter((item) => item.type === "document")}>
              {(item) => (
                <div className="docCard">
                  <div className="docHeader">
                    <strong>{item.name}</strong>
                    <a href={item.url} target="_blank" rel="noreferrer">เปิดไฟล์</a>
                  </div>
                  {item.textContent ? <pre className="docPreview">{item.textContent.slice(0, 1800)}</pre> : <p className="docPlaceholder">ไฟล์ชนิดนี้เปิดอ่านได้จากลิงก์ด้านบน</p>}
                </div>
              )}
            </MediaBlock>
          </div>
        </section>

        <button type="button" className="floatingMediaButton" onClick={() => scrollToSection("media-center")}>
          🎬 ศูนย์สื่อประกอบการพิจารณา
          <span>{mediaCounts.total} รายการ</span>
        </button>
      </main>
    </div>
  );
}

function FilterChecklist({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="sidebarBlock">
      <div className="fieldRow">
        <label className="fieldLabel">{label}</label>
        <span className="fieldMeta">{selected.length}/{options.length}</span>
      </div>
      <div className="checkList">
        {options.map((item) => (
          <button type="button" key={item} className={`checkItem ${selected.includes(item) ? "isSelected" : ""}`} onClick={() => onToggle(item)}>
            <span className="checkDot" />
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className={`metricCard glass accent-${accent}`}>
      <p>{label}</p>
      <h3>{value}</h3>
      <span>{sub}</span>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="panel glass">
      <div className="panelHeader">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function ReportCard({ title, description, actionLabel, onClick }: { title: string; description: string; actionLabel: string; onClick: () => void }) {
  return (
    <div className="reportCard glassInner">
      <h4>{title}</h4>
      <p>{description}</p>
      <button type="button" className="button" onClick={onClick}>{actionLabel}</button>
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
      {items.length === 0 ? (
        <div className="emptyState">ไม่พบไฟล์ในหมวดนี้</div>
      ) : (
        <div className="mediaItems">
          {items.map((item) => (
            <div key={item.name} className="mediaItem">
              {children(item)}
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function toggleValue(current: string[], value: string, all: string[]) {
  if (current.includes(value)) {
    const next = current.filter((item) => item !== value);
    return next.length ? next : all;
  }
  return [...current, value];
}

function downloadText(fileName: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
}

function buildManualText(generatedAt: string) {
  return [
    "คู่มือการใช้งาน — ระบบวิเคราะห์โครงการเมืองอัจฉริยะ",
    "เทศบาลนครนครสวรรค์",
    `จัดทำเมื่อ: ${generatedAt}`,
    "",
    "1. ใช้ตัวกรองด้านซ้ายเพื่อกำหนดมุมมองข้อมูล",
    "2. ตรวจสอบ KPI, สรุปผู้บริหาร, และ insight เพื่อประกอบการตัดสินใจ",
    "3. ใช้ศูนย์ออกรายงานเพื่อดาวน์โหลด CSV หรือรายงานข้อความ",
    "4. ใช้ศูนย์สื่อเพื่อดูวิดีโอ รูปภาพ เสียง และเอกสารประกอบ",
  ].join("\n");
}
