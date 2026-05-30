# UX Improvement List

รายการ UX ที่ควรทำ เรียงตาม impact — อัปเดตเมื่อ 2026-05-29

---

## 🔴 High Impact

### 1. `error.tsx` — Graceful error pages
ตอนนี้ถ้า DB fail หรือ fetch error → หน้าขาวหรือ Next.js default error ดูน่ากลัว
ควรมีหน้า error สวยๆ บอกผู้ใช้ พร้อมปุ่ม "ลองใหม่"
- `src/app/error.tsx`
- `src/app/scores/error.tsx`
- `src/app/scores/[universitySlug]/error.tsx`
- `src/app/scores/[universitySlug]/[facultySlug]/error.tsx`
- `src/app/mbti/error.tsx`
- `src/app/analyze/error.tsx`

### 2. Empty state — ผลการค้นหาว่าง
ตอนนี้ถ้า search university/faculty แล้วไม่เจอ → รายการหายไปเฉยๆ ไม่บอกว่าเกิดอะไร
ควรแสดง "ไม่พบ '{keyword}'" พร้อมแนะนำให้ลองใหม่
- `UniversityGrid` — search ไม่เจอ
- `FacultyList` — search ไม่เจอ

### 3. Toast notification
ยังไม่มี feedback ว่า action สำเร็จหรือไม่
- บันทึกผล MBTI → "บันทึกผลแล้ว"
- copy share link → "คัดลอกลิงก์แล้ว"
- form error → แจ้งเตือนชัดเจน

### 4. Scroll-to-top button
หน้า `/scores/[uni]/[fac]` มีตารางและกราฟยาวมาก บน mobile ต้อง scroll กลับขึ้นด้วยตัวเอง

---

## 🟡 Medium Impact

### 5. Mobile bottom navigation bar
ตอนนี้ mobile ต้องเปิด hamburger ทุกครั้ง
bottom nav (วิเคราะห์ / คะแนน / MBTI / หน้าหลัก) เข้าถึงได้เร็วกว่า เหมาะกับ thumb zone

### 6. Analyze form — step indicator
Form วิเคราะห์คะแนนมีหลาย field ดูซับซ้อน
แบ่งเป็น step "กรอกคะแนน → เลือกคณะ → ดูผล" จะรู้สึกสั้นกว่า

### 7. Page transition animation
ตอนเปลี่ยนหน้าไม่มี animation เลย
ใส่ fade-in เบาๆ ด้วย `tw-animate-css` ที่ติดตั้งอยู่แล้ว

### 8. Score table — highlight แถวปีล่าสุด
ตารางคะแนนย้อนหลังไม่ได้ highlight ว่าปีไหนเป็นข้อมูลล่าสุด
ผู้ใช้ต้องอ่านเองทุกแถว

---

## 🟢 Low Impact (แต่ polish มาก)

### 9. `not-found.tsx` — Custom 404 page
ตอนนี้ใช้ Next.js default 404
ควรมีหน้า 404 ที่ match theme และมีลิงก์กลับหน้าหลัก

### 10. Breadcrumb บน mobile
หน้า `/scores/[uni]/[fac]` บน mobile ไม่รู้ว่าตัวเองอยู่ที่ไหน
breadcrumb เล็กๆ ช่วยได้

### 11. กราฟ — no data state
ถ้า faculty มีข้อมูลแค่ 1 ปี กราฟ LineChart เส้นเดียวดูแปลก
ควรแสดง fallback message แทน

### 12. Share MBTI ด้วย OG image
`/mbti/[type]` มี metadata openGraph แล้ว แต่ยังไม่มี OG image จริง
ถ้ามี → share บน social สวยกว่ามาก

---

## ✅ Done

### Phase 3 — Low Impact (2026-05-30)
- Custom 404 page — `not-found.tsx` มีปุ่มกลับหน้าหลัก + ค้นหาคะแนน + ย้อนกลับ
- Breadcrumb component — `breadcrumb.tsx` reusable, wire ใน faculty score page
- Chart no-data state — ScoreHistoryChart + ScoreTrendChart แสดง fallback ถ้า < 2 ปี
- MBTI OG image — `opengraph-image.tsx` สร้าง dynamic OG image ตาม type (Edge runtime)

### Phase 2 — Medium Impact (2026-05-30)
- Mobile bottom navigation bar (Home / วิเคราะห์ / คะแนน / MBTI) — `bottom-nav.tsx` + padding ใน layout
- Analyze form step indicator — progress bar 3 ขั้น (เลือกคณะ → กรอกคะแนน → ผลวิเคราะห์)
- Page transition animation — `page-transition.tsx` fade-in 200ms ทุก route
- Score table highlight ปีล่าสุด — ✅ มีอยู่แล้ว (bg-green-50 + badge "ล่าสุด")

### Phase 1 — High Impact (2026-05-30)
- `error.tsx` ทุก route (global, scores, university, faculty, mbti, analyze) — shared `ErrorPage` component
- Empty state: ปุ่ม "ล้างการค้นหา" + แสดงคำที่ค้นหา — UniversityGrid + FacultyList
- Toast notification system (`Toaster` + `useToast`) — wire กับ MBTI share/copy link
- Scroll-to-top floating button — แสดงเมื่อ scroll เกิน 400px

### Before Phase 1
- Loading animation + skeleton (loading.tsx ทุก route) — 2026-05-29
- Lazy load Recharts charts — 2026-05-29
- Hamburger menu บน mobile — 2026-05-29
- Live personality preview ใน MBTI quiz — 2026-05-29
- Cinematic result reveal — 2026-05-29
- Dimension celebration toast ใน MBTI quiz — 2026-05-29
- Neutral spam warning — 2026-05-29
