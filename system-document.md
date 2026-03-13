# System Documentation: Nakhon Sawan Smart City Analytics

เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้เป็นคู่มือสำหรับนักพัฒนาในการทำความเข้าใจโครงสร้างระบบ สถาปัตยกรรม และแนวทางการพัฒนาต่อยอดโครงการ (Further Development) ของระบบ Dashboard วิเคราะห์โครงการนครสวรรค์สมาร์ทซิตี้

---

## 1. Project Overview (ภาพรวมโครงการ)

ระบบ Next.js Dashboard สำหรับการวิเคราะห์และนำเสนอข้อมูลโครงการ นครสวรรค์สมาร์ทซิตี้ (Nakhon Sawan Smart City) โดยเน้นไปที่:
- **Interactive Analytics:** การแสดงผลข้อมูลกราฟิกและสถิติที่ตอบสนองต่อการ Filter ทันที
- **Executive Insights:** การสรุปข้อมูลเชิงผู้บริหารที่สร้างขึ้นโดยอัตโนมัติตามชุดข้อมูลที่ถูกกรอง
- **Media Center:** ศูนย์รวมไฟล์สื่อประกอบการพิจารณา (PDF, รูปภาพ, วิดีโอ, เสียง) ซึ่งดึงข้อมูลจากโฟลเดอร์ Local โดยตรง
- **Report Generation:** การสร้างรายงานสรุปและวิเคราะห์เชิงลึกพร้อมดาวน์โหลด (CSV, Text)
- **Modern UI/UX:** การออกแบบด้วย Glassmorphism พร้อมระบบสีจำแนกส่วนต่างๆ เพื่อความชัดเจน

## 2. Technology Stack (เทคโนโลยีที่ใช้)

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library:** [React 18](https://react.dev/)
- **Language:** TypeScript (Strict Type Checking)
- **Styling:** CSS3 (Custom Glassmorphism ใน `globals.css`)
- **Icons:** `lucide-react`
- **Data Visualization:** Custom React Components & SVG / HTML5 (ลด Dependency ภายนอกเพื่อให้ระบบเบาและเร็วที่สุด)
- **File System/API:** Node.js `fs`, `path` และ Next.js Route Handlers

---

## 3. Directory Structure (โครงสร้างโฟลเดอร์)

```text
nextjs-dashboard/
├── src/
│   ├── app/                    # Next.js App Router (เส้นทางและ Layout หลัก)
│   │   ├── api/media/[name]/   # API Route สำหรับเสิร์ฟไฟล์สื่อจากโฟลเดอร์ Local
│   │   ├── globals.css         # ไฟล์ Style หลัก (กำหนดตัวแปรสี, Layout, Glassmorphism)
│   │   ├── layout.tsx          # Root Layout ของหน้าเว็บ
│   │   └── page.tsx            # หน้า Entry Point หลัก (เรียกใช้ DashboardApp)
│   │
│   ├── components/             # React Components
│   │   └── dashboard/
│   │       └── dashboard-app.tsx # Component หลัก (รวบรวม State, UI, Filter, Charts)
│   │
│   ├── lib/                    # Core Logic & Business Logic (ไม่เกี่ยวกับ UI โดยตรง)
│   │   ├── data.ts             # จัดการ Data Source (Mock Data โครงการ และระบบอ่านไฟล์ Media)
│   │   ├── filters.ts          # Logic การกรองข้อมูล (Filter Data)
│   │   ├── insights.ts         # Logic การคำนวณและสร้างข้อความ Executive Summary
│   │   └── reports.ts          # Logic การสร้าง Report/CSV สำหรับดาวน์โหลด
│   │
│   └── types/                  # TypeScript Interfaces/Types
│       └── project.ts          # Type Definitions (Project, MediaFile, FilterState)
│
├── Source/                     # โฟลเดอร์จัดเก็บไฟล์สื่อ (ออฟไลน์/Local) เช่น PDF, MP4, PNG
├── package.json                # Dependencies และ Scripts
└── tsconfig.json               # การตั้งค่า TypeScript
```

---

## 4. Core Modules & Architecture (โมดูลและสถาปัตยกรรมหลัก)

### 4.1 State Management (การจัดการสถานะ)
ศูนย์กลางของ State อยู่ที่ `src/components/dashboard/dashboard-app.tsx` โดยใช้ React Hooks:
- `useState`: จัดการตัวกรอง (`filters`), โหมดของศูนย์สื่อ (`mediaView`), สถานะ UI
- `useMemo`: คำนวณข้อมูลที่ Derived จาก State หลัก เช่น ข้อมูลที่ถูกกรอง (`filteredData`), สถิติ (`metrics`), ข้อความสรุปผู้บริหาร (`insights`) เพื่อป้องกันการ Re-render และคำนวณซ้ำโดยไม่จำเป็น

### 4.2 Data Fetching & Media Processing (`src/lib/data.ts`)
- **Project Data:** ปัจจุบันใช้ Static Data (Mock) ซึ่งสามารถปรับเปลี่ยนเป็นการดึงจาก Database/API จริงได้ในอนาคต
- **Media Files:** ใช้ Node.js `fs` อ่านไฟล์จากโฟลเดอร์ `Source/` แบบ Real-time จำแนกประเภทจากนามสกุลไฟล์ และสร้าง URL รูปแบบ `/api/media/[ชื่อไฟล์]`

### 4.3 Next.js Route Handlers (`src/app/api/media/[name]/route.ts`)
API สำหรับเสิร์ฟไฟล์สื่อจากเซิร์ฟเวอร์ไปยัง Client:
- รองรับการตั้งค่า `Content-Type` ให้ตรงกับนามสกุลไฟล์
- รองรับภาษาไทยด้วยการตั้ง Encoding เป็น `utf-8` สำหรับไฟล์ Text/CSV

### 4.4 Styling System (`src/app/globals.css`)
- **Glassmorphism:** ใช้ `backdrop-filter: blur()`, พื้นหลังแบบโปร่งแสง (`rgba()`), และเส้นขอบจางๆ
- **Color Coding Components:** ใช้สีขอบซ้าย (`border-left`) เพื่อจำแนกหมวดหมู่ของ UI:
  - สีฟ้าอ่อน (`#38bdf8`): Hero / Overview
  - สีม่วง (`#a78bfa`): Metrics & Charts
  - สีเขียว (`#34d399`): Report Center
  - สีเหลือง (`#f59e0b`): Data Table
  - สีชมพู (`#f472b6`): Media Center

---

## 5. Guide สำหรับการพัฒนาต่อยอด (How to Extend)

### 5.1 การเพิ่ม Filter ใหม่
1. ไปที่ `src/types/project.ts` เพื่อเพิ่มฟิลด์ใน `FilterState`
2. ไปที่ `src/components/dashboard/dashboard-app.tsx` เพื่อเพิ่ม UI (Select/Dropdown) ผูกกับ State
3. ไปที่ `src/lib/filters.ts` ปรับฟังก์ชัน `filterData()` เพื่อเพิ่มเงื่อนไขการตรวจสอบตาม Filter ใหม่

### 5.2 การเพิ่มกราฟ (Charts) ใหม่
1. ศึกษาโครงสร้างข้อมูลที่ส่งไปสร้างกราฟใน `dashboard-app.tsx` (ฟังก์ชันคำนวณหมวดหมู่, งบประมาณ)
2. สร้าง Component กราฟแบบ Custom (ปัจจุบันใช้ HTML/CSS ผสมผสาน SVG) หรือติดตั้ง Library เช่น `recharts` หรือ `chart.js` เพิ่มเติม
3. นำ Component ไปวางในโครงสร้าง `.chartsGrid`

### 5.3 การเชื่อมต่อ Database/API จริง
1. ลบข้อมูล Mock ใน `src/lib/data.ts`
2. สร้าง Data Fetching แบบ Server Components (RSC) ใน `page.tsx` แล้วส่ง Props เข้าไปใน `DashboardApp` หรือดึงผ่าน `fetch` API ใน Hook (เช่น SWR หรือ React Query)

### 5.4 การเพิ่มประเภทของเอกสารใน Media Center
1. ไปที่ `src/lib/data.ts` ในฟังก์ชัน `getMediaFiles()`
2. เพิ่มเงื่อนไข `ext` (นามสกุลไฟล์) ในการจัดหมวดหมู่ `type` (เช่น 'video', 'audio', 'image', 'document')

---

## 6. Development & Deployment

### การรันโปรเจกต์ในเครื่อง (Local Development)
เปิด Terminal ในโฟลเดอร์ `nextjs-dashboard`
```bash
npm install     # ติดตั้ง Dependencies ครั้งแรก
npm run dev     # รัน Development Server (http://localhost:3000)
```

### การ Build สำหรับ Production
```bash
npm run build   # ตรวจสอบ Type, Lint และสร้าง Optimized Production Build
npm run start   # รัน Production Server
```

### ปัญหาที่พบบ่อย (Troubleshooting)
- **ภาษาไทยในไฟล์ Media อ่านไม่ได้ (ตัวยึกยือ):** 
  - *วิธีแก้:* ตรวจสอบว่าไฟล์ต้นฉบับถูก Save เป็น UTF-8 และในไฟล์ `api/media/[name]/route.ts` ได้กำหนด Header `charset=utf-8` แล้ว
- **`fs` หรือ `path` Error:** 
  - *วิธีแก้:* ฟังก์ชันพวกนี้ใช้ได้เฉพาะฝั่ง Server (Node.js) อย่าเผลอ `import` ไปใช้ใน Client Components แบบตรงๆ ให้เรียกผ่าน API Route แทน

---
*Created automatically for future reference & seamless handover.*
