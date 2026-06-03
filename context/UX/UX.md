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

### MBTI UX Phase 1-3 (2026-05-30)
**Phase 1 — High Impact:**
- Option A/B clickable → tap card = เลือก "ตรงมาก" ลดขั้นตอน
- ปุ่มย้อนกลับข้อ → undo answer + reverse progress
- `/mbti/[type]` เพิ่ม role badge, weaknesses, studyStyle, breadcrumb component
- Skip reveal button → ข้ามไปดูผลได้ทันที

**Phase 2 — Medium Impact:**
- DimBar full labels → "Extraversion 72%" / "28% Introversion" ทั้ง 2 ฝั่ง
- Intro card ก่อนเริ่ม quiz → "พร้อมค้นหาตัวเอง?" + tags + ปุ่มเริ่ม
- 16 types grid ท้ายหน้า /mbti/[type] → highlight type ปัจจุบัน เพิ่ม engagement

**Phase 3 — Polish:**
- Keyboard shortcuts → 1-5 เลือก scale, Enter กด "ถัดไป" (desktop)
- Slide + fade transition ตอนเปลี่ยนข้อ → translate-x + scale
- Reveal nickname preview → แสดง "คุณคือ… INTJ · สถาปนิก" ตอน merge

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


# UX.md

# User Experience Principles

JKnowledge ไม่ได้มีหน้าที่แสดงข้อมูล

JKnowledge มีหน้าที่ช่วยนักเรียนตัดสินใจ

ทุก UX Decision ต้องตอบคำถามนี้ก่อนเสมอ

> สิ่งนี้ช่วยให้นักเรียนตัดสินใจได้เร็วขึ้นหรือไม่

หากไม่ช่วย

ให้ลบออก

---

# Core UX Philosophy

## Reduce Anxiety

นักเรียนที่เข้ามาใช้งาน

ไม่ได้กำลังมองหาความบันเทิง

พวกเขากำลังหาคำตอบ

ทุกหน้าต้องลดความกังวล

ไม่เพิ่มความกังวล

---

## Progress Over Perfection

ผู้ใช้ไม่ต้องการคำตอบที่สมบูรณ์แบบ

ผู้ใช้ต้องการคำตอบที่ช่วยให้เดินหน้าต่อได้

ดังนั้น

แสดงข้อมูลที่มีประโยชน์ก่อน

รายละเอียดค่อยตามมา

---

## Action Before Exploration

ผู้ใช้ส่วนใหญ่ไม่ได้เข้ามาเพื่อสำรวจเว็บ

พวกเขาเข้ามาเพื่อทำงานบางอย่าง

เช่น

* วิเคราะห์คะแนน
* ดูโอกาสสอบติด
* หาแนวทางเลือกคณะ

UI ต้องพาไปสู่เป้าหมายโดยตรง

---

# User Mental Model

เมื่อผู้ใช้เข้ามา

พวกเขากำลังถามคำถามนี้

## Stage 1

"คะแนนของฉันเป็นอย่างไร"

---

## Stage 2

"มีโอกาสติดที่ไหน"

---

## Stage 3

"ควรสมัครอะไร"

---

## Stage 4

"ถ้าไม่ติดควรทำอย่างไร"

---

ทุกหน้าต้องตอบคำถามตามลำดับนี้

ห้ามข้ามขั้น

---

# Navigation Philosophy

## Navigation Is Secondary

Navigation มีหน้าที่ช่วย

ไม่ใช่นำ

Content คือพระเอก

Navigation คือผู้ช่วย

---

## Mobile First

ผู้ใช้ส่วนใหญ่มาจากมือถือ

ห้ามออกแบบจาก Desktop ก่อน

ทุก Flow ต้องเริ่มจาก Mobile

---

## One Primary Action

หนึ่งหน้ามี Primary Action ได้เพียงหนึ่งเดียว

ตัวอย่าง

หน้า Analyze Score

Primary

* วิเคราะห์คะแนน

Secondary

* ดูข้อมูลย้อนหลัง

ไม่ใช่

* วิเคราะห์คะแนน
* ดู MBTI
* ดูบทความ
* สมัครสมาชิก

พร้อมกัน

---

# Information Hierarchy

ทุกหน้าต้องจัดลำดับความสำคัญแบบนี้

## Level 1

สิ่งที่ผู้ใช้มาหา

---

## Level 2

Insight ที่ช่วยตัดสินใจ

---

## Level 3

Supporting Data

---

## Level 4

Educational Content

---

## Level 5

Marketing

---

หากพื้นที่ไม่พอ

Level ต่ำสุดต้องหายไปก่อน

---

# Score Analysis Experience

## Primary Goal

ทำให้ผู้ใช้เข้าใจสถานะของตัวเอง

ภายใน 10 วินาที

---

## Analysis Page Order

1. User Score
2. Chance Assessment
3. Historical Comparison
4. Recommended Programs
5. Detailed Data

ห้ามสลับลำดับ

---

## User Score

ผู้ใช้ต้องเห็นคะแนนตัวเองก่อนเสมอ

ไม่ต้องเลื่อน

ไม่ต้องกด

ไม่ต้องค้นหา

---

## Chance Assessment

ใช้ภาษาที่เข้าใจง่าย

Good

* โอกาสสูง
* แข่งขันได้
* ท้าทาย

Avoid

* ผ่าน
* ตก
* ติดแน่นอน
* ไม่มีทางติด

---

## Historical Data

ข้อมูลย้อนหลังมีหน้าที่สร้างบริบท

ไม่ใช่สร้างความกลัว

หากคะแนนปีนี้ต่ำกว่าปีก่อน

อธิบายอย่างเป็นกลาง

---

# Empty States

Empty State ต้องมีทางไปต่อเสมอ

---

## Bad

ไม่มีข้อมูล

---

## Good

ยังไม่มีคะแนนของคุณ

กรอกคะแนนเพื่อดูการวิเคราะห์

---

## Bad

ไม่พบคณะ

---

## Good

ยังไม่พบคณะที่ตรงเงื่อนไข

ลองปรับช่วงคะแนนหรือสาขาที่สนใจ

---

# Error Handling

Errors ไม่ควรทำให้ผู้ใช้หยุด

---

## Validation Errors

บอก

* เกิดอะไรขึ้น
* ต้องทำอะไรต่อ

---

## Bad

ข้อมูลไม่ถูกต้อง

---

## Good

กรุณากรอกคะแนนตั้งแต่ 0 ถึง 100

---

# Loading Experience

Loading ต้องสร้างความมั่นใจ

ไม่ใช่สร้างความสงสัย

---

## Under 300ms

ไม่ต้องแสดง Loading

---

## 300ms - 1000ms

Skeleton

---

## Over 1000ms

Skeleton + Progress Message

ตัวอย่าง

กำลังวิเคราะห์คะแนน...

กำลังเปรียบเทียบข้อมูลย้อนหลัง...

กำลังคำนวณโอกาสรับ...

---

# Forms

## Minimize Input

ยิ่งกรอกน้อยยิ่งดี

---

## Smart Defaults

ใช้ค่าเริ่มต้นเสมอ

หากสามารถเดาได้อย่างปลอดภัย

---

## Inline Validation

แจ้งปัญหาทันที

ไม่รอ Submit

---

# Charts & Data

Charts มีหน้าที่อธิบาย

ไม่ใช่ตกแต่ง

---

## Rules

* User Score เด่นที่สุด
* Historical Data รองลงมา
* Label สำคัญต้องมองเห็น
* หลีกเลี่ยง Tooltip-only Information

---

## Avoid

* Pie Charts
* 3D Charts
* Decorative Charts

---

# Recommendation Experience

คำแนะนำต้องช่วยตัดสินใจ

ไม่ใช่บอกเฉยๆ

---

## Bad

แนะนำคณะวิศวกรรมศาสตร์

---

## Good

คะแนนของคุณใกล้เคียงกับข้อมูลย้อนหลังของคณะนี้มากที่สุด

---

# Share Experience

การแชร์คือผลลัพธ์

ไม่ใช่เป้าหมาย

---

## Rule

ห้ามแสดง Share CTA

ก่อนผู้ใช้ได้รับคุณค่าจากข้อมูล

---

# Microcopy Principles

## Friendly

เหมือนรุ่นพี่

---

## Clear

พูดตรง

---

## Honest

ไม่สัญญาสิ่งที่พิสูจน์ไม่ได้

---

## Never

* ติดแน่นอน
* ไม่มีทางติด
* รีบสมัครด่วน
* พลาดแล้วจะเสียใจ

---

# Definition Of Good UX

Good UX คือ

ผู้ใช้สามารถ

1. กรอกคะแนน
2. เข้าใจสถานะตัวเอง
3. เห็นทางเลือก
4. ตัดสินใจขั้นต่อไป

ได้โดยไม่ต้องอ่านคู่มือ
