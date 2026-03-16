'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, BubbleController } from 'chart.js';
import { Bar, Bubble } from 'react-chartjs-2';
import './styles.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, BubbleController, Title, Tooltip, Legend);

interface FilterState {
  cat: string;
  risk: string | null;
  year: string | null;
}

interface Project {
  id: number;
  label: string;
  budget: number;
  urgency: number;
  impact: number;
  cat: string;
  risk: string;
  year: string;
  color: string;
}

const projectData: Project[] = [
  { id: 1, label: 'PDPA', budget: 1000000, urgency: 9, impact: 8, cat: 'pdpa', risk: 'high', year: '2569', color: '#1A5FA8' },
  { id: 2, label: 'Website', budget: 500000, urgency: 8, impact: 6, cat: 'digital', risk: 'high', year: '2569', color: '#00B4CC' },
  { id: 3, label: 'Cyber ระยะ1', budget: 1500000, urgency: 10, impact: 9, cat: 'cyber', risk: 'high', year: '2569', color: '#DC2626' },
  { id: 4, label: 'Cyber ระยะ2', budget: 1800000, urgency: 6, impact: 7, cat: 'cyber', risk: 'med', year: '2570', color: '#9D174D' },
  { id: 5, label: 'Cyber รวม', budget: 3000000, urgency: 10, impact: 10, cat: 'cyber', risk: 'high', year: '2569', color: '#B91C1C' },
  { id: 6, label: 'Digital Platform', budget: 500000, urgency: 5, impact: 6, cat: 'digital', risk: 'med', year: '2569', color: '#7C3AED' },
  { id: 7, label: 'Smart City', budget: 500000, urgency: 4, impact: 5, cat: 'smart', risk: 'low', year: '2569', color: '#00A86B' },
];

export default function DecisionDashboard() {
  const [filterState, setFilterState] = useState<FilterState>({ cat: 'all', risk: null, year: null });
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [animatedValues, setAnimatedValues] = useState({ val1: 0, val2: 0, val3: 0, val4: 0, val5: 0 });

  useEffect(() => {
    const targets = [3201, 21.5, 130, 7, 37];
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        val1: Math.floor(ease * targets[0]),
        val2: parseFloat((ease * targets[1]).toFixed(1)),
        val3: Math.floor(ease * targets[2]),
        val4: Math.floor(ease * targets[3]),
        val5: Math.floor(ease * targets[4]),
      });

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const toggleFilter = (type: 'cat' | 'risk' | 'year', value: string) => {
    setFilterState(prev => {
      if (type === 'cat') {
        return { ...prev, cat: prev.cat === value ? 'all' : value };
      } else if (type === 'risk') {
        return { ...prev, risk: prev.risk === value ? null : value };
      } else {
        return { ...prev, year: prev.year === value ? null : value };
      }
    });
  };

  const clearFilters = () => {
    setFilterState({ cat: 'all', risk: null, year: null });
  };

  const toggleProjectDetail = (id: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredProjects = projectData.filter(p => {
    const catOk = filterState.cat === 'all' || p.cat === filterState.cat;
    const riskOk = !filterState.risk || p.risk === filterState.risk;
    const yearOk = !filterState.year || p.year === filterState.year;
    return catOk && riskOk && yearOk;
  });

  const bubbleChartData = {
    datasets: projectData.map(p => {
      const isVisible = filteredProjects.includes(p);
      return {
        label: `โครงการ ${p.id}: ${p.label}`,
        data: [{ x: p.urgency, y: p.budget / 1000000, r: p.impact * 2.5 }],
        backgroundColor: isVisible ? p.color + 'CC' : p.color + '22',
        borderColor: isVisible ? p.color : p.color + '44',
        borderWidth: 2,
      };
    })
  };

  const threatChartData = {
    labels: ['จำนวนเซิร์ฟเวอร์ถูกโจมตี\n(หน่วย:พัน, 2024 vs 2023)', 'การโจมตี/สัปดาห์\n(ไทย vs โลก)', 'ข้อมูลรั่วไหล\nในไทย (พัน ชุด)'],
    datasets: [
      { label: 'ปี/ค่าก่อนหน้า/ค่าเฉลี่ยโลก', data: [324, 1946, 80], backgroundColor: '#93C5FD', borderRadius: 5 },
      { label: 'ปี/ค่าปัจจุบัน/ค่าไทย', data: [733, 3201, 5000], backgroundColor: '#DC2626', borderRadius: 5 },
    ]
  };

  const roiBarData = {
    labels: ['ลงทุน 8.8M', 'ต้นทุน Breach', 'ค่าปรับ PDPA (max)', 'ค่าปรับสะสม 5 คดี'],
    datasets: [{
      data: [8.8, 130, 5, 21.5],
      backgroundColor: ['#00A86B', '#DC2626', '#F59E0B', '#EA580C'],
      borderRadius: 6
    }]
  };

  return (
    <div>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            <div className="logo-icon">🏛️</div>
            <div>
              <div className="logo-text">Decision Intelligence Dashboard</div>
              <div className="logo-sub">เทศบาลนครนครสวรรค์ | มิติผู้อำนวยการ</div>
            </div>
          </div>
          <div className="topbar-right">
            <a href="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,.8)', fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,.1)', borderRadius: '6px', transition: 'all .2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
              ← กลับหน้าหลัก
            </a>
            <a href="/decision_dashboard_CCF000068.html" style={{ textDecoration: 'none', color: 'rgba(255,255,255,.8)', fontSize: '11px', padding: '4px 10px', background: 'rgba(255,255,255,.1)', borderRadius: '6px', transition: 'all .2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
              📄 HTML Version
            </a>
            <div className="live-badge"><span className="live-dot"></span> Live Analysis</div>
            <div className="doc-tag">📄 CCF_000068</div>
            <div className="doc-tag">มีนาคม ๒๕๖๙</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <span className="filter-label">🔍 Filter</span>
        <div className="filter-group">
          <button className={`filter-btn ${filterState.cat === 'all' ? 'active all' : ''}`} onClick={() => toggleFilter('cat', 'all')}>ทั้งหมด</button>
          <button className={`filter-btn cat-cyber ${filterState.cat === 'cyber' ? 'active' : ''}`} onClick={() => toggleFilter('cat', 'cyber')}>🛡️ Cyber Security</button>
          <button className={`filter-btn cat-pdpa ${filterState.cat === 'pdpa' ? 'active' : ''}`} onClick={() => toggleFilter('cat', 'pdpa')}>🔒 PDPA</button>
          <button className={`filter-btn cat-digital ${filterState.cat === 'digital' ? 'active' : ''}`} onClick={() => toggleFilter('cat', 'digital')}>🌐 Digital Service</button>
          <button className={`filter-btn cat-smart ${filterState.cat === 'smart' ? 'active' : ''}`} onClick={() => toggleFilter('cat', 'smart')}>🏙️ Smart City</button>
        </div>
        <div className="f-divider"></div>
        <div className="filter-group">
          <button className={`filter-btn risk-high ${filterState.risk === 'high' ? 'active' : ''}`} onClick={() => toggleFilter('risk', 'high')}>🔴 เร่งด่วนสูง</button>
          <button className={`filter-btn risk-med ${filterState.risk === 'med' ? 'active' : ''}`} onClick={() => toggleFilter('risk', 'med')}>🟡 เร่งด่วนปานกลาง</button>
          <button className={`filter-btn risk-low ${filterState.risk === 'low' ? 'active' : ''}`} onClick={() => toggleFilter('risk', 'low')}>🟢 ต่ำ</button>
        </div>
        <div className="f-divider"></div>
        <div className="filter-group">
          <button className={`filter-btn yr-69 ${filterState.year === '2569' ? 'active' : ''}`} onClick={() => toggleFilter('year', '2569')}>ปี ๒๕๖๙</button>
          <button className={`filter-btn yr-70 ${filterState.year === '2570' ? 'active' : ''}`} onClick={() => toggleFilter('year', '2570')}>ปี ๒๕๗๐</button>
        </div>
        <button className="clear-btn" onClick={clearFilters}>✕ ล้าง Filter</button>
        <span className="result-count">แสดง {filteredProjects.length}/7 โครงการ</span>
      </div>

      <div className="main">
        <div className="alert-banner">
          <div className="alert-icon">⚠️</div>
          <div className="alert-text">
            <h3>ข้อมูลเชิงนโยบาย: ภัยคุกคามไซเบอร์ในไทยสูงกว่าค่าเฉลี่ยโลก 164% — กฎหมาย PDPA บังคับใช้เข้มข้นปี ๒๕๖๙</h3>
            <p>Thailand GCI Rank #7 โลก แต่องค์กรในไทยถูกโจมตี 3,201 ครั้ง/สัปดาห์ | ค่าปรับ PDPA สะสม ๒๑.๕ ล้านบาท (ส.ค.๒๕๖๘) | มาตรฐานเว็บไซต์ NCSA บังคับ ก.ย.๒๕๖๙</p>
          </div>
          <div className="alert-pills">
            <span className="alert-pill urgent">⏰ Deadline ก.ย.๒๕๖๙</span>
            <span className="alert-pill">🔴 ความเสี่ยงสูง</span>
            <span className="alert-pill">💰 ปรับสูงสุด ๕ ล้าน</span>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card kpi-red">
            <div className="kpi-top">
              <div className="kpi-icon-wrap" style={{ background: '#FEE2E2' }}>⚔️</div>
              <span className="kpi-trend trend-up">+164% vs โลก</span>
            </div>
            <div className="kpi-val" style={{ color: '#DC2626' }}>{animatedValues.val1.toLocaleString()}</div>
            <div className="kpi-label">การโจมตีไซเบอร์<br />ต่อองค์กร/สัปดาห์</div>
            <div className="kpi-sub">ค่าเฉลี่ยโลก: 1,946 ครั้ง | ไทยสูงกว่า 164%</div>
          </div>
          <div className="kpi-card kpi-amber">
            <div className="kpi-top">
              <div className="kpi-icon-wrap" style={{ background: '#FEF3C7' }}>⚖️</div>
              <span className="kpi-trend trend-up">บังคับเพิ่มขึ้น</span>
            </div>
            <div className="kpi-val" style={{ color: '#F59E0B' }}>{animatedValues.val2}M</div>
            <div className="kpi-label">ค่าปรับ PDPA สะสม<br />(บาท, ส.ค.๒๕๖๘)</div>
            <div className="kpi-sub">ปรับสูงสุดได้ ๕ ล้านบาท/กรณี | ๕ คดี ๘ คำสั่ง</div>
          </div>
          <div className="kpi-card kpi-blue">
            <div className="kpi-top">
              <div className="kpi-icon-wrap" style={{ background: '#DBEAFE' }}>💸</div>
              <span className="kpi-trend trend-up">ความเสี่ยงสูง</span>
            </div>
            <div className="kpi-val" style={{ color: '#1A5FA8' }}>{animatedValues.val3}M+</div>
            <div className="kpi-label">ต้นทุนเฉลี่ยต่อ<br />Breach (บาท)</div>
            <div className="kpi-sub">AsiaPac avg USD 3.65M/incident | IBM 2025</div>
          </div>
          <div className="kpi-card kpi-teal">
            <div className="kpi-top">
              <div className="kpi-icon-wrap" style={{ background: '#CFFAFE' }}>🏆</div>
              <span className="kpi-trend trend-ok">#7 โลก</span>
            </div>
            <div className="kpi-val" style={{ color: '#00B4CC' }}>#{animatedValues.val4}</div>
            <div className="kpi-label">อันดับ Global<br />Cybersecurity Index</div>
            <div className="kpi-sub">ITU GCI 2024 | คะแนน 99.22/100 | แต่ช่องว่างการปฏิบัติยังสูง</div>
          </div>
          <div className="kpi-card kpi-purple">
            <div className="kpi-top">
              <div className="kpi-icon-wrap" style={{ background: '#EDE9FE' }}>🏙️</div>
              <span className="kpi-trend trend-ok">37→105 เมือง</span>
            </div>
            <div className="kpi-val" style={{ color: '#7C3AED' }}>{animatedValues.val5}</div>
            <div className="kpi-label">Smart City เปิดดำเนินการ<br />(เป้าหมาย 105 เมือง/ปี ๒๕๗๐)</div>
            <div className="kpi-sub">depa ลงทุน &gt;๑๑.๙ พันล้านบาท | นครสวรรค์ต้องเร่ง</div>
          </div>
        </div>

        <div className="row-3">
          <div className="card">
            <div className="card-head">
              <div className="card-title"><div className="card-dot" style={{ background: '#1A5FA8' }}></div><h3>วิเคราะห์งบประมาณเทียบความเสี่ยง</h3></div>
              <span className="card-tag" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>Interactive</span>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '220px' }}>
                <Bubble data={bubbleChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx: any) => {
                          const p = projectData[ctx.datasetIndex];
                          return [`${p.label}`, `งบ: ${(p.budget / 1000000).toFixed(1)}M บาท`, `ความเร่งด่วน: ${p.urgency}/10`, `ผลกระทบ: ${p.impact}/10`];
                        }
                      }
                    }
                  },
                  scales: {
                    x: { min: 0, max: 11, title: { display: true, text: 'ความเร่งด่วน (1-10)', font: { size: 10 } }, grid: { color: '#F0F4F9' } },
                    y: { min: 0, max: 4, title: { display: true, text: 'งบประมาณ (ล้านบาท)', font: { size: 10 } }, grid: { color: '#F0F4F9' } }
                  }
                }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', marginTop: '6px' }}>
                แกน X = ระดับความเร่งด่วน | แกน Y = งบประมาณ | ขนาดวงกลม = ผลกระทบหากไม่ดำเนินการ
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title"><div className="card-dot" style={{ background: '#DC2626' }}></div><h3>สภาพการณ์ภัยคุกคาม ไทย vs โลก</h3></div>
              <span className="card-tag" style={{ background: '#FEE2E2', color: '#DC2626' }}>ข้อมูลจริง</span>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '220px' }}>
                <Bar data={threatChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8, usePointStyle: true } },
                    tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString()}` } }
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                    y: { grid: { color: '#F0F4F9' }, ticks: { font: { size: 10 }, callback: (v: any) => v.toLocaleString() } }
                  }
                }} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title"><div className="card-dot" style={{ background: '#00A86B' }}></div><h3>ลงทุน 8.8M vs ความเสี่ยง</h3></div>
              <span className="card-tag" style={{ background: '#D1FAE5', color: '#065F46' }}>ROI Analysis</span>
            </div>
            <div className="card-body">
              <div className="threat-meter">
                <div className="threat-number">8.8M</div>
                <div className="threat-label-main">งบลงทุนทั้งหมด (บาท)</div>
                <div className="threat-label-sub">vs. ต้นทุนหากเกิด Breach เพียง 1 ครั้ง ~130 ล้านบาท</div>
                <div className="chart-container" style={{ height: '100px', margin: '10px 0' }}>
                  <Bar data={roiBarData} options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}M บาท` } }
                    },
                    scales: {
                      x: { grid: { color: '#F0F4F9' }, ticks: { font: { size: 9 }, callback: (v: any) => v + 'M' } },
                      y: { grid: { display: false }, ticks: { font: { size: 9 } } }
                    }
                  }} />
                </div>
                <div className="stat-row">
                  <div className="stat-mini">
                    <div className="stat-mini-val" style={{ color: '#DC2626' }}>130M</div>
                    <div className="stat-mini-lab">ต้นทุนเฉลี่ย Breach</div>
                  </div>
                  <div className="stat-mini">
                    <div className="stat-mini-val" style={{ color: '#00A86B' }}>14.7x</div>
                    <div className="stat-mini-lab">อัตราส่วน Risk/Invest</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue with more sections... Due to length, I'll create a separate component file for project cards */}
        <ProjectCardsSection 
          projects={projectData}
          filteredProjects={filteredProjects}
          expandedProjects={expandedProjects}
          toggleProjectDetail={toggleProjectDetail}
        />

        <ComplianceSection />
        <RiskMatrixSection />
        <InsightsSection />
        <RecommendationsSection />
        <DecisionBoxSection />
      </div>

      <div className="dash-footer">
        <span>📊 Dashboard สร้างจากข้อมูลจริง: PDPC, NCSA, ITU GCI 2024, IBM Data Breach Report 2025, depa Smart City, Bangkok Post, Nation Thailand</span>
        <span>เทศบาลนครนครสวรรค์ | CCF_000068 | มีนาคม ๒๕๖๙</span>
      </div>
    </div>
  );
}

function ProjectCardsSection({ projects, filteredProjects, expandedProjects, toggleProjectDetail }: any) {
  const projectDetails = [
    {
      id: 1,
      laws: ['พ.ร.บ.PDPA ๒๕๖๒'],
      penalty: 'ปรับสูงสุด ๕ ล้านบาท + จำคุก ๑ ปี',
      situation: 'PDPC ออก ๘ คำสั่งปรับ รวม ๒๑.๕ ล้านบาท (ส.ค.๒๕๖๘) มีหน่วยงานรัฐโดนด้วย',
      insights: ['⚠️ ต้องแต่งตั้ง DPO', '📋 กำหนดนโยบายข้อมูล'],
      kpi: 'ผู้ใช้บริการทุกคนได้รับการคุ้มครองข้อมูลตามกฎหมาย'
    },
    {
      id: 2,
      laws: ['มาตรฐานเว็บไซต์ NCSA ๒๕๖๘'],
      deadline: 'บังคับ ๑๖ กันยายน ๒๕๖๙ (ประกาศราชกิจจาฯ)',
      requirements: 'MFA สำหรับ admin, Incident Response, รายงาน NCSA',
      insights: ['⏰ 6 เดือนสุดท้าย', '🌐 ประตูสู่ E-Service'],
      kpi: 'เว็บไซต์มีมาตรฐาน ป้องกันการโจมตีได้มาตรฐาน'
    },
  ];

  return (
    <div className="row-3-2">
      <div className="card">
        <div className="card-head">
          <div className="card-title"><div className="card-dot" style={{ background: '#7C3AED' }}></div><h3>รายละเอียด ๗ โครงการ (คลิกเพื่อดูข้อมูลเชิงลึก)</h3></div>
          <span className="card-tag" style={{ background: '#EDE9FE', color: '#6D28D9' }}>คลิกขยาย</span>
        </div>
        <div className="card-body" style={{ padding: '12px' }}>
          <div className="proj-grid">
            {projects.map((p: Project) => {
              const isFiltered = !filteredProjects.includes(p);
              const isExpanded = expandedProjects.has(p.id);
              return (
                <div 
                  key={p.id}
                  className={`proj-card anim-in ${isFiltered ? 'filtered-out' : ''} ${isExpanded ? 'selected' : ''}`}
                  onClick={() => toggleProjectDetail(p.id)}
                >
                  <div className="proj-top">
                    <div className="proj-num" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}DD)` }}>{p.id}</div>
                    <div className="proj-badges">
                      <span className={`risk-badge risk-${p.risk}`}>
                        {p.risk === 'high' ? '🔴 เร่งด่วนสูง' : p.risk === 'med' ? '🟡 เร่งด่วนปานกลาง' : '🟢 ต่ำ'}
                      </span>
                      <span className={`yr-badge yr-${p.year === '2569' ? '69' : '70'}`}>ปี ๒๕{p.year.slice(2)}</span>
                    </div>
                  </div>
                  <div className="proj-body">
                    <div className="proj-name">{getProjectName(p.id)}</div>
                    <div className="proj-desc">{getProjectDesc(p.id)}</div>
                    <div className="budget-bar-wrap">
                      <div className="proj-budget-wrap">
                        <span className="proj-budget" style={{ color: p.color }}>{p.budget.toLocaleString()}</span>
                        <span className="proj-unit">บาท</span>
                      </div>
                      <div className="budget-bar-track">
                        <div className="budget-bar-fill" style={{ width: `${(p.budget / 8800000) * 100}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}DD)` }}></div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && <ProjectDetailExpanded id={p.id} />}
                  <div className="proj-footer">
                    <span>{getCategoryIcon(p.cat)} หมวด: {getCategoryName(p.cat)}</span>
                    <span className="proj-expand">{isExpanded ? '▲ ซ่อน' : '▼ ดูเพิ่มเติม'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ComplianceTimeline />
    </div>
  );
}

function ProjectDetailExpanded({ id }: { id: number }) {
  const details: any = {
    1: {
      laws: ['พ.ร.บ.PDPA ๒๕๖๒'],
      penalty: 'ปรับสูงสุด ๕ ล้านบาท + จำคุก ๑ ปี',
      situation: 'PDPC ออก ๘ คำสั่งปรับ รวม ๒๑.๕ ล้านบาท (ส.ค.๒๕๖๘) มีหน่วยงานรัฐโดนด้วย',
      insights: ['⚠️ ต้องแต่งตั้ง DPO', '📋 กำหนดนโยบายข้อมูล'],
      kpi: 'ผู้ใช้บริการทุกคนได้รับการคุ้มครองข้อมูลตามกฎหมาย'
    },
    2: {
      laws: ['มาตรฐานเว็บไซต์ NCSA ๒๕๖๘'],
      deadline: 'บังคับ ๑๖ กันยายน ๒๕๖๙ (ประกาศราชกิจจาฯ)',
      requirements: 'MFA สำหรับ admin, Incident Response, รายงาน NCSA',
      insights: ['⏰ 6 เดือนสุดท้าย', '🌐 ประตูสู่ E-Service'],
      kpi: 'เว็บไซต์มีมาตรฐาน ป้องกันการโจมตีได้มาตรฐาน'
    },
  };

  const detail = details[id] || {};

  return (
    <div className="proj-detail open">
      {detail.laws && (
        <div className="detail-row">
          <span className="detail-key">กฎหมาย</span>
          <span className="detail-val">
            {detail.laws.map((law: string, i: number) => <span key={i} className="law-chip">{law}</span>)}
          </span>
        </div>
      )}
      {detail.penalty && (
        <div className="detail-row">
          <span className="detail-key">โทษไม่ทำ</span>
          <span className="detail-val" style={{ color: '#DC2626', fontWeight: 700 }}>{detail.penalty}</span>
        </div>
      )}
      {detail.situation && (
        <div className="detail-row">
          <span className="detail-key">สถานการณ์</span>
          <span className="detail-val">{detail.situation}</span>
        </div>
      )}
      {detail.insights && (
        <div className="detail-row">
          <span className="detail-key">Insight</span>
          <span className="detail-val">
            {detail.insights.map((ins: string, i: number) => <span key={i} className="insight-chip">{ins}</span>)}
          </span>
        </div>
      )}
      {detail.kpi && (
        <div className="detail-row">
          <span className="detail-key">KPI</span>
          <span className="detail-val">{detail.kpi}</span>
        </div>
      )}
    </div>
  );
}

function ComplianceTimeline() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><div className="card-dot" style={{ background: '#F59E0B' }}></div><h3>Compliance Deadline</h3></div>
        <span className="card-tag" style={{ background: '#FEF3C7', color: '#92400E' }}>Critical</span>
      </div>
      <div className="card-body" style={{ padding: '12px 16px' }}>
        <div className="comp-timeline">
          <div className="comp-item">
            <div className="comp-dot-wrap">
              <div className="comp-dot" style={{ background: '#DC2626' }}>!</div>
              <div className="comp-line"></div>
            </div>
            <div className="comp-info">
              <div className="comp-title">พ.ร.บ.PDPA บังคับเต็มรูปแบบ</div>
              <div className="comp-date">มิถุนายน ๒๕๖๕ (มีผลแล้ว)</div>
              <div className="comp-status status-overdue">🔴 ยังไม่มีระบบ = เสี่ยงทุกวัน</div>
              <div className="comp-penalty">ปรับสูงสุด ๕ ล้านบาท | จำคุก ๑ ปี</div>
            </div>
          </div>
          <div className="comp-item">
            <div className="comp-dot-wrap">
              <div className="comp-dot" style={{ background: '#DC2626' }}>!</div>
              <div className="comp-line"></div>
            </div>
            <div className="comp-info">
              <div className="comp-title">พ.ร.บ.ไซเบอร์ฯ Baseline บังคับ</div>
              <div className="comp-date">๑๘ มกราคม ๒๕๖๘ (มีผลแล้ว)</div>
              <div className="comp-status status-overdue">🔴 ต้องดำเนินการทันที</div>
              <div className="comp-penalty">คำสั่งปรับ + อาจต้องรับผิดทางอาญา</div>
            </div>
          </div>
          <div className="comp-item">
            <div className="comp-dot-wrap">
              <div className="comp-dot" style={{ background: '#F59E0B' }}>⏰</div>
              <div className="comp-line"></div>
            </div>
            <div className="comp-info">
              <div className="comp-title">มาตรฐานเว็บไซต์ NCSA พ.ศ.๒๕๖๘</div>
              <div className="comp-date">บังคับ ๑๖ กันยายน ๒๕๖๙</div>
              <div className="comp-status status-urgent">🟡 เหลือเวลา ~6 เดือน</div>
              <div className="comp-penalty">ต้องมี MFA + Incident Response</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceSection() {
  return null;
}

function RiskMatrixSection() {
  return (
    <div className="row-2">
      <div className="card">
        <div className="card-head">
          <div className="card-title"><div className="card-dot" style={{ background: '#DC2626' }}></div><h3>Risk Matrix: ความน่าจะเป็น × ผลกระทบ</h3></div>
          <span className="card-tag" style={{ background: '#FEE2E2', color: '#DC2626' }}>Hover ดูรายละเอียด</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr', gridTemplateRows: 'auto auto auto auto 28px', gap: '5px', height: '240px' }}>
            <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', fontSize: '9px', color: 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: 1, gridRow: '1/5' }}>ความน่าจะเป็น ↑</div>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: 1, gridRow: 1 }}>สูง</div>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: 1, gridRow: 2 }}>กลาง</div>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: 1, gridRow: 3 }}>ต่ำ</div>
            
            <div style={{ background: '#FEE2E2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', padding: '6px', gridColumn: 2, gridRow: 1 }}>
              <div className="rm-proj" style={{ background: 'linear-gradient(135deg,#1A5FA8,#2E8FD4)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} title="โครงการ 1: PDPA">1</div>
              <div className="rm-proj" style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} title="โครงการ 3: Cyber P1">3</div>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', padding: '6px', gridColumn: 3, gridRow: 1 }}>
              <div className="rm-proj" style={{ background: 'linear-gradient(135deg,#B91C1C,#DC2626)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} title="โครงการ 5: Cyber รวม">5</div>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: '8px', gridColumn: 4, gridRow: 1 }}></div>
            
            <div style={{ background: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', padding: '6px', gridColumn: 2, gridRow: 2 }}>
              <div className="rm-proj" style={{ background: 'linear-gradient(135deg,#00B4CC,#0EA5E9)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} title="โครงการ 2: Website">2</div>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', padding: '6px', gridColumn: 3, gridRow: 2 }}>
              <div className="rm-proj" style={{ background: 'linear-gradient(135deg,#9D174D,#DB2777)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} title="โครงการ 4: Cyber P2">4</div>
            </div>
            <div style={{ background: '#D1FAE5', borderRadius: '8px', gridColumn: 4, gridRow: 2 }}></div>
            
            <div style={{ background: '#D1FAE5', borderRadius: '8px', gridColumn: 2, gridRow: 3 }}></div>
            <div style={{ background: '#D1FAE5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', padding: '6px', gridColumn: 3, gridRow: 3 }}>
              <div className="rm-proj" style={{ background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} title="โครงการ 6: Digital">6</div>
            </div>
            <div style={{ background: '#D1FAE5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', padding: '6px', gridColumn: 4, gridRow: 3 }}>
              <div className="rm-proj" style={{ background: 'linear-gradient(135deg,#00A86B,#34D399)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} title="โครงการ 7: Smart City">7</div>
            </div>
            
            <div style={{ gridColumn: 2, gridRow: 4, fontSize: '9px', color: 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>ผลกระทบต่ำ</div>
            <div style={{ gridColumn: 3, gridRow: 4, fontSize: '9px', color: 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>ผลกระทบกลาง</div>
            <div style={{ gridColumn: 4, gridRow: 4, fontSize: '9px', color: 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>ผลกระทบสูง →</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--muted)' }}>
              <div style={{ width: '12px', height: '12px', background: '#FEE2E2', borderRadius: '3px' }}></div>ความเสี่ยงสูง
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--muted)' }}>
              <div style={{ width: '12px', height: '12px', background: '#FEF3C7', borderRadius: '3px' }}></div>ความเสี่ยงปานกลาง
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--muted)' }}>
              <div style={{ width: '12px', height: '12px', background: '#D1FAE5', borderRadius: '3px' }}></div>ความเสี่ยงต่ำ
            </div>
          </div>
        </div>
      </div>

      <BenchmarkTable />
    </div>
  );
}

function BenchmarkTable() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><div className="card-dot" style={{ background: '#00A86B' }}></div><h3>Benchmark: ความคุ้มค่าของงบประมาณ</h3></div>
        <span className="card-tag" style={{ background: '#D1FAE5', color: '#065F46' }}>เทียบอ้างอิง</span>
      </div>
      <div className="card-body">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ background: 'var(--navy)', color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 600 }}>สถานการณ์</th>
                <th style={{ background: 'var(--navy)', color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 600 }}>มูลค่า (บาท)</th>
                <th style={{ background: 'var(--navy)', color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 600 }}>เทียบกับงบฯ ๘.๘M</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>💸 ต้นทุนเฉลี่ย Data Breach 1 ครั้ง (IBM 2025, AsiaPac)</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>~130,000,000</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', color: '#DC2626', fontWeight: 700 }}>สูงกว่า 14.7 เท่า</td>
              </tr>
              <tr style={{ background: '#F8FAFD' }}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>⚖️ ค่าปรับ PDPA สูงสุดต่อกรณี</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>5,000,000</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', color: '#DC2626', fontWeight: 700 }}>เพียงกรณีเดียว = 57% ของงบ</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>📊 ค่าปรับ PDPA ทั้งหมดที่ออกไปแล้ว (ส.ค.๒๕๖๘)</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>21,500,000</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', color: '#DC2626', fontWeight: 700 }}>สูงกว่างบทั้งหมด 2.4 เท่า</td>
              </tr>
              <tr style={{ background: '#F8FAFD' }}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>🏗️ งบ Smart City ทั่วประเทศ (depa ลงทุนสะสม)</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>11,900,000,000</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', color: '#00A86B', fontWeight: 700 }}>นครสวรรค์ลงทุน 0.07% เท่านั้น</td>
              </tr>
              <tr style={{ background: 'var(--light)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 700 }}><strong>✅ งบที่ขออนุมัติทั้งหมด</strong></td>
                <td style={{ padding: '8px 10px', fontWeight: 700 }}><strong>8,800,000</strong></td>
                <td style={{ padding: '8px 10px', color: '#00A86B', fontWeight: 700 }}><strong>ลงทุนน้อยมากเมื่อเทียบความเสี่ยง</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InsightsSection() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><div className="card-dot" style={{ background: '#7C3AED' }}></div><h3>💡 Key Insights สำหรับผู้อำนวยการ — ข้อมูลจากแหล่งอ้างอิงภายนอก</h3></div>
        <span className="card-tag" style={{ background: '#EDE9FE', color: '#6D28D9' }}>Evidence-Based</span>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: '#FEF2F2', borderLeft: '4px solid #DC2626', borderRadius: '12px', padding: '14px', transition: 'all .25s' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🚨</div>
            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: '#DC2626' }}>ไทยอยู่ในภาวะวิกฤติไซเบอร์</div>
            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--muted)' }}>ถูกโจมตี <strong>3,201 ครั้ง/สัปดาห์</strong> สูงกว่าค่าเฉลี่ยโลก 164% มีแฮกเกอร์จีน-รัสเซียเป็นหลัก โดเมนรัฐบาล ๑๖ แห่งถูกเจาะในปี ๒๕๖๗ นครสวรรค์ไม่ใช่ข้อยกเว้น</div>
          </div>
          <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', borderRadius: '12px', padding: '14px', transition: 'all .25s' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚖️</div>
            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: '#92400E' }}>กฎหมายบังคับใช้จริงแล้ว ไม่ใช่แค่นโยบาย</div>
            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--muted)' }}>PDPC ออกคำสั่งปรับรวม <strong>๒๑.๕ ล้านบาทใน ๕ คดี</strong> มีหน่วยงานรัฐโดนด้วย พ.ร.บ.ไซเบอร์ Baseline บังคับแล้วตั้งแต่ ม.ค.๒๕๖๘ เว็บไซต์ต้องได้มาตรฐาน ก.ย.๒๕๖๙</div>
          </div>
          <div style={{ background: '#F0FDF4', borderLeft: '4px solid #00A86B', borderRadius: '12px', padding: '14px', transition: 'all .25s' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>💡</div>
            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: '#065F46' }}>ลงทุน ๘.๘M ป้องกันความเสียหาย ๑๓๐M+</div>
            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--muted)' }}>อัตราส่วน ROI สูงมาก: <strong>ลงทุน 1 บาท ป้องกันความเสี่ยง 14.7 บาท</strong> หากเกิด Breach เพียงครั้งเดียว ค่าเสียหายเฉลี่ย AsiaPac = ₿130 ล้านบาท ยังไม่นับค่าปรับตามกฎหมาย</div>
          </div>
          <div style={{ background: '#EFF6FF', borderLeft: '4px solid #1A5FA8', borderRadius: '12px', padding: '14px', transition: 'all .25s' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏆</div>
            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: '#1D4ED8' }}>ไทยอันดับ #7 โลก GCI แต่ติดกับดัก "Policy-Practice Gap"</div>
            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--muted)' }}>ไทยมีนโยบายดีระดับโลก (GCI #7) แต่ <strong>ยังขาดการปฏิบัติจริงในระดับท้องถิ่น</strong> นครสวรรค์มีโอกาสเป็น Best Practice ของประเทศ และอาจได้รับการสนับสนุนงบประมาณเพิ่มเติม</div>
          </div>
          <div style={{ background: '#F5F3FF', borderLeft: '4px solid #7C3AED', borderRadius: '12px', padding: '14px', transition: 'all .25s' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏙️</div>
            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: '#6D28D9' }}>Smart City เป็น "ทางรอด" ไม่ใช่ "ทางเลือก"</div>
            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--muted)' }}>รัฐบาลตั้งเป้า <strong>๑๐๕ Smart City ปี ๒๕๗๐</strong> | ๑,๐๐๐ E-Service | งบ DGA ๗.๙๖ พันล้าน ท้องถิ่นที่ไม่เริ่มตอนนี้จะตามไม่ทัน โครงการ 6-7 คือ "ก้าวแรก" ที่จำเป็น</div>
          </div>
          <div style={{ background: '#FFF1F2', borderLeft: '4px solid #DB2777', borderRadius: '12px', padding: '14px', transition: 'all .25s' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>📊</div>
            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: '#9D174D' }}>ข้อมูลส่วนบุคคล = ความเสี่ยงทุกวัน</div>
            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--muted)' }}>PDPC พบ <strong>๕,๒๗๓ กรณีข้อมูลรั่วไหล</strong> ใน 3 เดือน (พ.ย.๖๖–ม.ค.๖๗) | รหัสผ่านรั่วไหล ๕ ล้านชุด เพิ่ม ๖,๒๕๐% เทศบาลที่ไม่มีระบบ PDPA เสี่ยงทุกวันที่ผ่านไป</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationsSection() {
  return (
    <div className="row-2-3">
      <div className="card">
        <div className="card-head">
          <div className="card-title"><div className="card-dot" style={{ background: '#00A86B' }}></div><h3>📋 ข้อเสนอแนะเชิงลำดับความสำคัญ</h3></div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', alignItems: 'flex-start', border: '1.5px solid #DC2626', background: '#FEF2F2' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0, background: '#DC2626' }}>1</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '3px', color: '#DC2626' }}>อนุมัติ "ด่วนที่สุด" — Cyber Security ระยะ 1 + PDPA</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>พ.ร.บ.ไซเบอร์ Baseline บังคับแล้วตั้งแต่ ม.ค.๒๕๖๘ เป็นเวลากว่า 1 ปีที่ยังไม่มีระบบ โครงการ 1 และ 3 ควรดำเนินการภายใน Q1-Q2 ของปีงบประมาณ ๒๕๖๙</div>
                <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', marginTop: '4px', background: '#FEE2E2', color: '#DC2626' }}>🔴 ดำเนินการทันที</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', alignItems: 'flex-start', border: '1.5px solid #F59E0B', background: '#FFFBEB' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0, background: '#F59E0B' }}>2</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '3px', color: '#92400E' }}>อนุมัติก่อน ก.ย.๒๕๖๙ — Website + Cyber รวม</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>มาตรฐานเว็บไซต์ NCSA บังคับ ก.ย.๒๕๖๙ — เหลือเวลา ~6 เดือน โครงการ 2 และ 5 ต้องเริ่มดำเนินการไม่เกิน Q2 เพื่อให้ทันกำหนด</div>
                <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', marginTop: '4px', background: '#FEF3C7', color: '#92400E' }}>🟡 ตาม Deadline กฎหมาย</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', alignItems: 'flex-start', border: '1.5px solid #00A86B', background: '#F0FDF4' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0, background: '#00A86B' }}>3</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '3px', color: '#065F46' }}>อนุมัติ — Digital Platform + Smart City (Q3-Q4)</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>โครงการ 6, 7 ควรดำเนินการในครึ่งปีหลัง เป็นการวางรากฐานระยะยาวสู่ Smart City ใช้ผลลัพธ์เพื่อขอสนับสนุนงบประมาณจาก depa และ DGA ต่อไป</div>
                <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', marginTop: '4px', background: '#D1FAE5', color: '#065F46' }}>🟢 วางรากฐาน Smart City</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', alignItems: 'flex-start', border: '1.5px solid #7C3AED', background: '#F5F3FF' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0, background: '#7C3AED' }}>4</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '3px', color: '#6D28D9' }}>วางแผน — Cyber ระยะ 2 (ปี ๒๕๗๐)</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>โครงการ 4 ต้องอนุมัติงบปี ๒๕๗๐ ให้เริ่มดำเนินการในช่วง Q1 ๒๕๗๐ ต่อเนื่องจากระยะ 1 ที่สร้างไว้แล้ว</div>
                <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', marginTop: '4px', background: '#EDE9FE', color: '#6D28D9' }}>🟣 แผนปีถัดไป</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DecisionBoxSection />
    </div>
  );
}

function DecisionBoxSection() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#0D2137,#1A5FA8)', borderRadius: '16px', padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ content: '', position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M20 20c0 5.52-4.48 10-10 10S0 25.52 0 20 4.48 10 10 10s10 4.48 10 10zm10 0c0 5.52 4.48 10 10 10s10-4.48 10-10-4.48-10-10-10-10 4.48-10 10z\'/%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none' }}></div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏛️</div>
        <div style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>สรุปเพื่อการตัดสินใจ</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.75)', marginBottom: '16px', lineHeight: 1.6 }}>
          เอกสาร CCF_000068 ขออนุมัติเพิ่มเติมแผนพัฒนาท้องถิ่น (พ.ศ.๒๕๖๖–๒๕๗๐)<br />
          ทบทวนครั้งที่ ๑/๒๕๖๖ เพิ่มเติมครั้งที่ ๒/๒๕๖๙ จำนวน ๗ โครงการ<br />
          <strong>เสนอโดย: นายณัฏฐวุฒิ จีนมหันต์ | หัวหน้ากลุ่มงานสถิติข้อมูลและสารสนเทศ</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,.15)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>7</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.7)' }}>โครงการทั้งหมด</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,.15)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>8.8M</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.7)' }}>งบรวม (บาท)</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,.15)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>3/7</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.7)' }}>โครงการเร่งด่วนสูง</div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: '10px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ padding: '8px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.6)', marginBottom: '4px' }}>ความเสี่ยงหากไม่อนุมัติ</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FCA5A5' }}>≥130 ล้าน/ครั้ง</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.6)', marginTop: '2px' }}>ต้นทุน Breach + ค่าปรับกฎหมาย</div>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', fontWeight: 700 }}>VS</div>
          <div style={{ padding: '8px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.6)', marginBottom: '4px' }}>งบที่ขออนุมัติ</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#86EFAC' }}>8.8 ล้านบาท</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.6)', marginTop: '2px' }}>ลงทุนน้อยกว่า 14.7 เท่า</div>
          </div>
        </div>
        <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(255,255,255,.08)', borderRadius: '10px', border: '1px solid rgba(255,255,255,.15)', fontSize: '11px', color: 'rgba(255,255,255,.85)', lineHeight: 1.6, textAlign: 'left' }}>
          ✅ โครงการ 1, 2, 3, 5 มีกฎหมายบังคับรองรับชัดเจน<br />
          ✅ โครงการ 4 สอดคล้องแผนต่อเนื่องปีงบประมาณ ๒๕๗๐<br />
          ✅ โครงการ 6, 7 รองรับเป้าหมาย Smart City และ E-Government<br />
          ⚠️ ความล่าช้าทุกเดือน = เพิ่มความเสี่ยงทางกฎหมายและความมั่นคง
        </div>
      </div>
    </div>
  );
}

function getProjectName(id: number): string {
  const names: { [key: number]: string } = {
    1: 'ระบบบริหารจัดการข้อมูลส่วนบุคคล (PDPA)',
    2: 'Website Interactive ของเทศบาล',
    3: 'Cyber Security ระยะที่ ๑ (สำนักงานเทศบาล)',
    4: 'Cyber Security ระยะที่ ๒ (หน่วยงาน+โรงเรียน)',
    5: 'Cyber Security รวม (ทุกองค์กรในสังกัด)',
    6: 'ที่ปรึกษาพัฒนาแพลตฟอร์มดิจิทัล & บุคลากร',
    7: 'ที่ปรึกษาสื่อสารนโยบายเมืองน่าอยู่อัจฉริยะ',
  };
  return names[id] || '';
}

function getProjectDesc(id: number): string {
  const descs: { [key: number]: string } = {
    1: 'จัดการข้อมูลส่วนบุคคลให้ปลอดภัยตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒',
    2: 'พัฒนาเว็บไซต์ทันสมัยตามมาตรฐานความปลอดภัย NCSA พ.ศ.๒๕๖๘',
    3: 'ระบบป้องกันภัยไซเบอร์สำนักงานเทศบาลครบวงจร สอดคล้อง พ.ร.บ.ไซเบอร์ฯ',
    4: 'ขยายการปกป้องไซเบอร์ครอบคลุมหน่วยงานและโรงเรียนในสังกัดทั้งหมด',
    5: 'ระบบ Cyber Security แบบครบวงจรสำหรับสำนักงาน+หน่วยงาน+โรงเรียน',
    6: 'ออกแบบ E-Service ด้าน Smart Governance, Smart Environment, Smart Living',
    7: 'พัฒนาการสื่อสาร 2 ทาง สร้างการมีส่วนร่วมประชาชนอย่างยั่งยืน',
  };
  return descs[id] || '';
}

function getCategoryIcon(cat: string): string {
  const icons: { [key: string]: string } = {
    pdpa: '🔒',
    digital: '🌐',
    cyber: '🛡️',
    smart: '🏙️',
  };
  return icons[cat] || '';
}

function getCategoryName(cat: string): string {
  const names: { [key: string]: string } = {
    pdpa: 'PDPA',
    digital: 'Digital',
    cyber: 'Cyber',
    smart: 'Smart City',
  };
  return names[cat] || '';
}
