# Project Planning — Jknowledge

อัปเดต: 2026-06-01  
สถานะปัจจุบัน: ~52% complete  
ดูรายละเอียดสิ่งที่เสร็จแล้วได้ที่ [progress.md](./progress.md)

---

## เป้าหมายของแต่ละ Phase

| Phase | ชื่อ | เป้าหมาย | ประมาณเวลา |
|---|---|---|---|
| Phase 0 | Data Completion | ข้อมูลครบและสะอาด | 1–2 วัน |
| Phase 1 | Core Loop Complete | ผู้ใช้ sign in → วิเคราะห์คะแนน → ดูประวัติ | 3–5 วัน |
| Phase 2 | AI Advisor | AI แนะนำคณะ + วิเคราะห์จุดแข็ง | 3–4 วัน |
| Phase 3 | SEO & Growth | หน้า landing page + keyword targeting | 2–3 วัน |
| Phase 4 | Polish & Launch | Performance, sharing, social-ready | 2–3 วัน |
| Phase 5 | Community | Reviews, discussions, study planner | TBD |

---

## Phase 0 — Data Completion
**เป้าหมาย:** ข้อมูล TCAS ครบทุกปีและน้ำหนักคะแนนถูกต้อง

### งานที่ต้องทำ

#### 0.1 Import TCAS69
- ไฟล์พร้อมแล้ว: `src/data/tcas64-69/TCAS69-R3-MinMax-25May26 - Sheet1.csv`
- รัน `scripts/import-tcas.ts` สำหรับ TCAS69
- ตรวจสอบด้วย `scripts/check-db-state.ts`
- เป้าหมาย: TcasScore เพิ่มจาก 14,099 → ~16,000+

#### 0.2 Fix FacultyRequirement ที่หายไป 1,274 records
- หลัง re-import Phase 4 restore ได้ 5,338/6,612
- วิเคราะห์ว่า 1,274 records หายไปเพราะอะไร (faculty ถูก merge → id เปลี่ยน?)
- Re-import weights จาก source ใหม่ หรือ map ด้วย programCode

#### 0.3 ตรวจสอบ MBTI seed data
- ยืนยันว่า `MBTIProfile` (16 records) + `MBTIQuestion` + `FacultyMBTIMatch` ถูก seed ใน production DB แล้ว
- ถ้ายังไม่มี → สร้าง seed script

**Deliverable:** DB สมบูรณ์ 100%, TCAS64-69 ครบทุกปี

---

## Phase 1 — Core Loop Complete
**เป้าหมาย:** วง loop หลักของผู้ใช้ทำงานได้ครบ end-to-end

### งานที่ต้องทำ

#### 1.1 Wire Prediction Saving
ตอนนี้ `analyzeAction` คำนวณผลแต่ไม่ save
- แก้ `src/server/actions.ts` → `analyzeAction` save `PredictionHistory` เมื่อ user ล็อกอิน
- ใช้ Clerk `auth()` ดึง clerkId → lookup `User.id`
- Save: `facultyId`, `userScore`, `chance`, `gap`

```
analyzeAction() → save PredictionHistory (ถ้า signed in)
                → return AdmissionResult เหมือนเดิม
```

#### 1.2 User Sync (Clerk → DB)
- สร้าง webhook handler: `src/app/api/webhooks/clerk/route.ts`
- Event `user.created` → upsert `User` record (clerkId, email, name)
- ใช้ `verifyWebhook` จาก Clerk SDK

#### 1.3 Dashboard Page
สร้างหน้าใหม่ `/dashboard`
- แสดง: "วิเคราะห์ล่าสุด" (10 รายการ), คณะที่บันทึกไว้, สถิติการใช้งาน
- Protected route → redirect ถ้าไม่ login
- Component: `PredictionHistoryCard`, `SavedFacultyList`

#### 1.4 Header auth state
- ปุ่ม "เข้าสู่ระบบ" / avatar ใน Header component
- link ไป `/dashboard` เมื่อ login แล้ว

**Deliverable:** ผู้ใช้ login → วิเคราะห์ → ดูประวัติใน dashboard ได้

---

## Phase 2 — AI Advisor
**เป้าหมาย:** AI แนะนำ faculty ที่เหมาะสม + วิเคราะห์โอกาสรับ

### งานที่ต้องทำ

#### 2.1 AI Analysis Action
สร้าง `src/server/ai-advisor.ts`
- Input: คะแนนผู้ใช้ (subject scores), MBTI type (optional)
- Logic:
  - ดึง faculties ที่ user มีโอกาส (minScore ± threshold)
  - เรียง: high chance → competitive → reach
  - กรองตาม MBTI match ถ้ามี
- Output: `AdvisorResult[]` — ranked list พร้อม reason

```typescript
interface AdvisorResult {
  faculty: FacultyPreview
  university: string
  chance: "high" | "competitive" | "reach"
  gap: number
  mbtiMatch?: number   // 0–1 compatibility score
  reason: string       // "คะแนนสูงกว่า minScore 15 คะแนน · เหมาะกับ INTJ"
}
```

#### 2.2 AI Advisor Page
สร้างหน้า `/advisor`
- Step 1: กรอกคะแนนแต่ละวิชา
- Step 2: เลือก MBTI type (optional, skip ได้)
- Step 3: แสดง ranked recommendations
  - แบ่ง section: "โอกาสสูง", "แข่งขันได้", "ท้าทาย"
  - การ์ดแต่ละอัน: faculty, uni, คะแนน gap, reason badge

#### 2.3 Claude API Integration (Optional แต่ powerful)
- ใช้ Anthropic SDK สร้าง narrative อธิบายผล
- "คะแนนของคุณอยู่ในเกณฑ์... คณะที่น่าสนใจที่สุดคือ... เพราะ..."
- Streaming response เพื่อ UX ดี
- Cache prompt ด้วย `cache_control` เพื่อประหยัดค่า API

**Deliverable:** ผู้ใช้กรอกคะแนน → ได้ list คณะที่เหมาะกับตัวเอง + explanation

---

## Phase 3 — SEO & Growth
**เป้าหมาย:** ให้ Google index ได้ดี, organic traffic เติบโต

### งานที่ต้องทำ

#### 3.1 SEO Landing Pages
สร้างหน้า static สำหรับ long-tail keywords:

| หน้า | URL | Keyword |
|---|---|---|
| คะแนนต่ำสุด TCAS ปีล่าสุด | `/tcas/cutoff` | คะแนนต่ำสุด TCAS 68 |
| คะแนนย้อนหลัง ราย uni | `/tcas/[uni]/history` | คะแนน จุฬา ย้อนหลัง |
| MBTI กับคณะที่เหมาะ | `/mbti/career` | MBTI คณะ INTJ |
| เปรียบเทียบคะแนน ราย field | `/compare/[field]` | คณะแพทย์ คะแนนต่ำสุด |

#### 3.2 Structured Data (JSON-LD)
- `BreadcrumbList` ทุกหน้า
- `FAQPage` สำหรับหน้า MBTI
- `Dataset` สำหรับหน้าคะแนนย้อนหลัง

#### 3.3 Sitemap & robots.txt
- `src/app/sitemap.ts` — dynamic sitemap ครอบคลุมทุก uni/faculty
- `src/app/robots.ts`
- ยืนยัน `opengraph-image` ทำงานได้ทุก route

#### 3.4 Social Sharing Flow
- `/analyze` result → ปุ่ม "แชร์ผล" → สร้าง shareable URL พร้อม OG image
- OG image แบบ dynamic แสดง: คณะ, ผลวิเคราะห์, โอกาสรับ
- TikTok-friendly: ออกแบบผลวิเคราะห์ให้ screenshot-worthy

**Deliverable:** Google index ได้ครบ, หน้า landing สำหรับ keyword targets

---

## Phase 4 — Polish & Launch Readiness
**เป้าหมาย:** พร้อม launch จริง

### งานที่ต้องทำ

#### 4.1 Performance
- Image optimization: university logos (WebP + blur placeholder)
- `next/dynamic` สำหรับ heavy components ที่ยังไม่ lazy
- ตรวจ Core Web Vitals ด้วย Lighthouse
- เป้าหมาย: LCP < 2.5s บน mobile

#### 4.2 Rate Limiting
- `/api/*` และ Server Actions ที่ถูกเรียกบ่อย
- ใช้ Vercel Edge middleware หรือ Upstash Redis

#### 4.3 Error Monitoring
- ติดตั้ง Sentry หรือ Vercel Analytics
- Track: analyze errors, MBTI save failures, slow queries

#### 4.4 Analyze Result Sharing
- สร้าง `src/app/api/og/analyze/route.tsx` — dynamic OG image สำหรับผลวิเคราะห์
- ปุ่ม "คัดลอกผลวิเคราะห์" → copy URL ที่ embed ผลแล้ว

#### 4.5 Mobile PWA (Optional)
- `manifest.json`
- Service worker สำหรับ offline access ของหน้าที่เคยเข้าไป

**Deliverable:** Production-ready, fast, monitored

---

## Phase 5 — Community (Future)
**เป้าหมาย:** build engagement และ retention

### งานที่วางแผนไว้
- **Faculty Reviews** — ผู้ใช้ที่เข้าเรียนแล้ว review คณะ
- **University Reviews** — ภาพรวมมหาวิทยาลัย
- **Community Q&A** — ถาม-ตอบ TCAS
- **Study Planner** — วางแผนการเรียนก่อนสอบ
- **Notification** — แจ้งเตือนเมื่อ TCAS รอบใหม่เปิด

---

## Priority Queue (ทำก่อน-หลัง)

สิ่งที่ควรทำก่อนเพื่อให้ product มีคุณค่าเร็วที่สุด:

```
[ Phase 0.1 ] Import TCAS69              ← data completeness
[ Phase 0.3 ] Verify MBTI seed           ← MBTI ใช้งานได้จริง
[ Phase 1.1 ] Wire prediction saving     ← core loop
[ Phase 1.2 ] User sync webhook          ← prerequisite ของ dashboard
[ Phase 1.3 ] Dashboard page             ← retention hook
[ Phase 2.1 ] AI Advisor logic           ← differentiator หลัก
[ Phase 2.2 ] Advisor page UI            ← differentiator หลัก
[ Phase 3.1 ] SEO landing pages          ← organic growth
[ Phase 3.3 ] Sitemap                    ← SEO foundation
[ Phase 4.1 ] Performance pass           ← launch readiness
[ Phase 0.2 ] Fix missing requirements   ← data quality (ทำได้คู่กัน)
[ Phase 2.3 ] Claude API narrative       ← nice-to-have
[ Phase 3.4 ] Social sharing OG          ← viral potential
[ Phase 4.2 ] Rate limiting              ← security
[ Phase 4.3 ] Error monitoring           ← ops
```

---

## ประมาณ % Complete หลังแต่ละ Phase

| หลัง Phase | % |
|---|---|
| ปัจจุบัน | 52% |
| Phase 0 | 60% |
| Phase 1 | 72% |
| Phase 2 | 82% |
| Phase 3 | 90% |
| Phase 4 | 96% |
| Phase 5 | 100% |
