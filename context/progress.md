# Project Progress Report

อัปเดตล่าสุด: 2026-06-01

---

## ภาพรวม: ~52% complete

---

## Features ตาม Development Priorities

| Priority | Feature | Status | % |
|---|---|---|---|
| 1 | TCAS Score Calculator | ✅ Done | 85% |
| 2 | Authentication | 🟡 Partial | 55% |
| 3 | Historical Score DB | ✅ Done | 90% |
| 4 | Admission Prediction | 🟡 Partial | 65% |
| 5 | Dashboard | ❌ Not started | 0% |
| 6 | MBTI System | ✅ Done | 80% |
| 7 | AI Advisor | ❌ Not started | 0% |
| 8 | SEO Pages | 🟡 Partial | 30% |
| 9 | Community Features | ❌ Not started | 0% |

---

## สิ่งที่เสร็จแล้ว

### Pages
- `/` — Homepage
- `/scores` — University list
- `/scores/[uni]` — Faculty list per university
- `/scores/[uni]/[fac]` — Faculty detail + score history chart
- `/analyze` — TCAS score analyzer + result card
- `/mbti` — MBTI quiz (with animation phases 1–3)
- `/mbti/[type]` — MBTI result page (16 types, OG image, breadcrumb)
- `/sign-in`, `/sign-up` — Clerk auth pages
- `not-found.tsx` — Custom 404
- `error.tsx` — Error boundaries ทุก route

### UX Components
- Loading skeletons (ทุก route)
- Error pages (ทุก route)
- Empty state (UniversityGrid + FacultyList)
- Toast notification system
- Mobile bottom navigation bar
- Hamburger menu บน mobile
- Page transition animation (fade-in)
- Scroll-to-top floating button
- Breadcrumb component
- Score table highlight ปีล่าสุด
- Chart no-data fallback (< 2 ปี)
- MBTI: keyboard shortcuts, slide transition, reveal animation
- MBTI: intro card, 16-types grid, dimension bar full labels
- MBTI: dynamic OG image (Edge runtime)

### Data & Database
- Schema ครบ: University, Faculty, TcasScore, FacultyRequirement, User, PredictionHistory, MBTI models
- Data import pipeline: `import-tcas.ts` + programCode-based identity + COTMES fix
- ข้อมูลสะอาด: **4,683 Faculty / 14,099 TcasScore / 0 duplicates**
- FacultyRequirement restored: 5,338 / 6,612 records
- Dedupe scripts + verification scripts

### Infrastructure
- Clerk middleware (session init)
- Prisma + PostgreSQL
- Next.js App Router, Server Components, Server Actions
- Error boundaries + loading states ทุก route
- Production build ผ่านสมบูรณ์

---

## สิ่งที่ยังขาด (ก่อน MVP)

### Critical
- **Dashboard page** — ผู้ใช้ไม่มีที่ดูประวัติการวิเคราะห์คะแนน
- **Prediction saving** — model `PredictionHistory` มีใน schema แต่ยังไม่ถูก wire กับ UI
- **FacultyRequirement ขาด 1,274 records** — การคำนวณน้ำหนักคะแนนไม่สมบูรณ์สำหรับ faculty กลุ่มนี้

### Important
- **AI Advisor** — feature หลักที่ยังไม่ได้เริ่ม (วิเคราะห์จุดแข็ง/แนะนำคณะสำรอง)
- **MBTI DB data** — ไม่ชัดเจนว่า `MBTIProfile` / `FacultyMBTIMatch` ถูก seed ใน production DB แล้วหรือยัง
- **SEO landing pages** — metadata มีแล้ว แต่ยังไม่มี static landing pages สำหรับ target keywords (คะแนนต่ำสุด TCAS, MBTI คณะ ฯลฯ)

### Nice-to-have
- Community features (reviews, discussions)
- Social sharing flow ที่สมบูรณ์
- User profile page
- Study planner / AI tutor

---

## สถานะ Data Pipeline

| CSV ที่ Import | ปี | สถานะ |
|---|---|---|
| TCAS64 | 2564 | ✅ |
| TCAS65 | 2565 | ✅ |
| TCAS66 | 2566 | ✅ |
| TCAS67 | 2567 | ✅ |
| TCAS68 | 2568 | ✅ |
| TCAS69 | 2569 | 🟡 ไฟล์มีแล้ว (`TCAS69-R3-MinMax-25May26`) ยังไม่ import |
