# Privacy & Data Protection

เอกสารฉบับนี้เป็น **technical guide** สำหรับทีม implement และ maintain privacy ของ Jknowledge ครอบคลุม PDPA (Thailand) + GDPR alignment + actionable checklist

> สถานะปัจจุบัน: **57% compliant** (security ดี, compliance docs + analytics PII ต้องแก้)
> Last reviewed: 2026-06-05

---

## Compliance Baseline

| มาตรฐาน | สถานะ | หมายเหตุ |
|--------|------|---------|
| PDPA (พรบ. คุ้มครองข้อมูลส่วนบุคคล 2562) | ⚠️ Partial | Architecture พร้อม, docs + consent ขาด |
| GDPR (สำหรับ EU users ถ้ามี) | ⚠️ Partial | เหมือนกัน |
| COPPA (ผู้ใช้ <13 ปี) | N/A | Target: ม.6 (17-18 ปี) |

---

## หมวดที่ 1: ข้อมูลที่เก็บ (Data Inventory)

### ข้อมูลที่ collect ตอนนี้

| Data | Source | Storage | Sensitive? | Purpose | Retention |
|------|--------|---------|-----------|---------|-----------|
| `clerkId` | Clerk | PostgreSQL `User` | ไม่ (internal ID) | FK reference | ตลอดอายุบัญชี |
| `email` | Clerk (user input / OAuth) | PostgreSQL `User` | ใช่ | account recovery + notification | ตลอดอายุบัญชี |
| `name` (first + last) | Clerk | PostgreSQL `User` | ใช่ | display | ตลอดอายุบัญชี |
| Password hash | Clerk only | Clerk | ใช่ (security) | authentication | ตลอดอายุบัญชี |
| TCAS scores | User input | PostgreSQL `PredictionHistory` | **ใช่ (educational record)** | analyze + history | ตลอดอายุบัญชี |
| Faculty/University picks | User action | PostgreSQL `PredictionHistory` | ใช่ (preference profile) | history + analytics | ตลอดอายุบัญชี |
| MBTI result | Quiz | PostgreSQL `MBTIResult` | ใช่ (personality data) | recommendation | ตลอดอายุบัญชี |
| MBTI answers (raw) | Quiz | PostgreSQL `MBTIResult.answers` (JSON) | ใช่ | re-scoring + analytics | ตลอดอายุบัญชี |
| Quiz duration | Quiz | PostgreSQL `MBTIResult.durationMs` | ไม่ | analytics | ตลอดอายุบัญชี |
| Session cookie | Clerk | Browser HTTP-only cookie | ใช่ | authentication | session lifetime |
| GA `_ga` cookie | Google | Browser | ใช่ (tracking) | analytics | 2 ปี (Google default) |
| Vercel SpeedInsights | Vercel | Vercel + browser | ใช่ (perf) | perf monitoring | Vercel retention |
| Form drafts | User | `sessionStorage` (browser only) | ใช่ | UX persistence | per-tab |
| Recent uni picks | User | `localStorage` (browser only) | ไม่ (just IDs) | quick-pick | cross-session |

### ข้อมูลที่ **ไม่ควร** collect (red lines)

- เลขบัตรประชาชน / passport
- เบอร์โทร (เว้นแต่จำเป็นจริงๆ)
- ที่อยู่
- วันเกิด (ยกเว้นเก็บแค่ปี ถ้าจำเป็น)
- GPS location
- Device fingerprint
- IP address ใน DB ของเรา (Clerk เก็บแล้วสำหรับ rate limit, เราไม่ต้อง mirror)
- ลายนิ้วมือ / biometric
- ข้อมูลทางการแพทย์
- ความคิดเห็นทางการเมือง / ศาสนา (PDPA หมวด sensitive data)

---

## หมวดที่ 2: PII vs Anonymous Analytics

### กฎทอง

> **Raw user scores ห้ามส่งออก third-party analytics**

### ตอนนี้ (มีปัญหา)
```ts
// src/lib/analytics.ts — ส่ง raw score ออก GA
trackAnalyzeResult({
  user_score: 75.2,    // ❌ raw value
  gap: 3.2,            // ❌ raw value
})
```

### แก้ให้ privacy-preserving
```ts
function bucketScore(s: number): string {
  if (s >= 90) return "90+"
  if (s >= 80) return "80-89"
  if (s >= 70) return "70-79"
  if (s >= 60) return "60-69"
  if (s >= 50) return "50-59"
  return "<50"
}

function bucketGap(gap: number): "above" | "close" | "below" {
  if (gap >= 3) return "above"
  if (gap <= -3) return "below"
  return "close"
}

trackAnalyzeResult({
  university_name: "...",         // OK (public info)
  faculty_name:    "...",         // OK
  chance:          "high",        // OK (category)
  user_score_bucket: bucketScore(75.2),  // "70-79"
  gap_direction:     bucketGap(3.2),     // "above"
})
```

### Rule of thumb
- **OK:** category, bucket, direction, count, duration
- **ไม่ OK:** raw value, exact number, identifying combination (university × faculty × score)

---

## หมวดที่ 3: Cookie Categories & Consent

### Cookie classification

| Cookie | Category | Consent ต้องขอ? | ตอนนี้ |
|--------|----------|----------------|--------|
| `__session` (Clerk auth) | Essential | ❌ ไม่ต้อง | ✅ active |
| `__clerk_db_jwt` | Essential | ❌ ไม่ต้อง | ✅ active |
| `_ga`, `_ga_<id>` (Google Analytics) | Analytics | ✅ **ต้องขอ** | 🔴 โหลดเลย |
| Vercel SpeedInsights | Analytics | ✅ **ต้องขอ** | 🔴 โหลดเลย |
| `cf_clearance` (Cloudflare) | Essential | ❌ | depends on infra |

### Consent UI ที่ต้องสร้าง

**ปุ่ม:**
- ✅ "ยอมรับทั้งหมด"
- ✅ "เฉพาะที่จำเป็น"
- ✅ "ตั้งค่า" → modal ที่ toggle per category

**Persistence:** เก็บ consent state ใน `localStorage` คีย์ `jknowledge:cookie-consent:v1`
```json
{
  "essential": true,
  "analytics": false,
  "marketing": false,
  "consentedAt": "2026-06-05T12:00:00Z",
  "version": "1.0"
}
```

**Conditional loading:**
```tsx
// layout.tsx
{consent.analytics && (
  <>
    <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
    <SpeedInsights />
  </>
)}
```

**Banner placement:** bottom-fixed bar, dismissible, 1 ครั้งต่อ user (จนกว่า consent version จะ bump)

---

## หมวดที่ 4: User Rights (PDPA หมวด 30)

| สิทธิ์ | คำอธิบาย | Implementation status |
|------|---------|----------------------|
| **Right to be informed** | บอก user ว่าเก็บอะไร ทำไม | ❌ ต้องมี privacy policy |
| **Right of access** | ขอดูข้อมูลของตัวเอง | ⚠️ Manual (ขอผ่าน email) |
| **Right to rectification** | แก้ไขข้อมูลผิด | ✅ ผ่าน Clerk UserButton |
| **Right to erasure** | ลบบัญชี | ✅ ผ่าน Clerk + cascade |
| **Right to restrict processing** | ระงับการใช้ข้อมูล | ❌ ยังไม่มี |
| **Right to data portability** | ขอ export ข้อมูล | ❌ ยังไม่มี |
| **Right to object** | ปฏิเสธการใช้ข้อมูลเพื่อ marketing | ⚠️ (ยังไม่มี marketing) |
| **Right to withdraw consent** | ถอน consent | ⚠️ (Cookie consent ยังไม่มี) |

### Endpoints ที่ต้องสร้าง

```
GET  /api/me/export              → JSON ของ user + predictions + mbti results
POST /api/me/delete               → delete account (cascade)
POST /api/me/consent              → update cookie consent
GET  /api/me/data-categories      → list of data we hold about you
```

---

## หมวดที่ 5: Implementation Roadmap

### Phase 1: P0 (ก่อนเปิด public)

#### 1.1 แก้ analytics → bucket scores
**File:** `src/lib/analytics.ts`
- เพิ่ม `bucketScore()` + `bucketGap()` helper
- เปลี่ยน `trackAnalyzeSubmit` + `trackAnalyzeResult` ให้ส่ง bucket แทน raw
- ลบ `user_score` ออกจาก event payload

#### 1.2 สร้าง /privacy page
**File:** `src/app/privacy/page.tsx`

โครงสร้างต้องมี:
1. นโยบายข้อมูลส่วนบุคคล
2. ผู้ควบคุมข้อมูล (DPO contact)
3. ข้อมูลที่เก็บ + วัตถุประสงค์
4. ระยะเวลาเก็บ (retention)
5. การเปิดเผยข้อมูลให้ third parties (Clerk, Google, Vercel)
6. สิทธิ์ของเจ้าของข้อมูล (PDPA หมวด 30)
7. การติดต่อ DPO
8. การเปลี่ยนแปลงนโยบาย + ประวัติ version

#### 1.3 สร้าง /terms page
**File:** `src/app/terms/page.tsx`

โครงสร้างต้องมี:
1. การยอมรับเงื่อนไข
2. คุณสมบัติผู้ใช้ (ม.6 ขึ้นไป)
3. การใช้งานที่ห้าม (abuse, scraping, ฯลฯ)
4. Disclaimer: ผลวิเคราะห์เป็น **การประมาณการ** ไม่รับประกัน
5. ลิขสิทธิ์ + ทรัพย์สินทางปัญญา
6. การจำกัดความรับผิด
7. กฎหมายที่ใช้บังคับ (กฎหมายไทย)

#### 1.4 Cookie consent banner
**Files:**
- `src/components/cookie-consent.tsx` — banner UI
- `src/lib/consent.ts` — read/write localStorage + conditional load helpers
- Update `src/app/layout.tsx` ให้ load GA/SpeedInsights แบบ conditional

#### 1.5 ENV var สำหรับ GA
**File:** `.env.example` + `src/app/layout.tsx`
- เพิ่ม `NEXT_PUBLIC_GA_ID`
- เปลี่ยน hardcoded `"G-852N4SM4ND"` → `process.env.NEXT_PUBLIC_GA_ID!`

### Phase 2: P1 (ก่อน scale)

#### 2.1 Data export endpoint
**File:** `src/app/api/me/export/route.ts`
```ts
GET /api/me/export
→ auth() required
→ return JSON.stringify({
    user:        prisma.user.findUnique(...),
    predictions: prisma.predictionHistory.findMany(...),
    mbtiResults: prisma.mBTIResult.findMany(...),
    exportedAt:  ISO timestamp
  })
→ Content-Type: application/json
→ Content-Disposition: attachment; filename="jknowledge-data-{userId}.json"
```

#### 2.2 Account deletion UI
**File:** `src/app/dashboard/settings/page.tsx`
- ปุ่ม "ลบบัญชีของฉัน" + confirmation dialog
- เรียก `clerk.user.delete()` → cascade
- แสดงข้อความ "ข้อมูลของคุณถูกลบเรียบร้อย"

#### 2.3 Audit server logs
- ตรวจว่า `console.error` ไม่ log raw scores / emails
- เพิ่ม helper `redactPII(value)` สำหรับ log

#### 2.4 Data retention policy
**Background job:**
```ts
// Vercel cron / pg_cron
// Delete PredictionHistory เก่ากว่า 2 ปี
// Send warning email 30 วันก่อน account inactive deletion
```

### Phase 3: Nice-to-have

#### 3.1 Switch to privacy-first analytics
- Plausible (no cookies, GDPR-friendly)
- Umami (self-hosted)
- ลด dependency บน GA + cookie consent banner

#### 3.2 SOC2 / ISO 27001 prep (เมื่อ scale)

---

## หมวดที่ 6: Security Best Practices ที่ทำอยู่แล้ว

ระบุไว้เพื่อให้ team ไม่ break:

| Practice | Implementation | Where |
|----------|---------------|-------|
| HTTPS everywhere | Vercel default | infra |
| HTTP-only cookies | Clerk default | session |
| SameSite=Lax cookies | Clerk default | session |
| Password hashing | Clerk (bcrypt + salt) | external |
| Webhook signature | Svix HMAC verify | `src/app/api/webhooks/clerk/route.ts` |
| Secret in env | `CLERK_WEBHOOK_SECRET` | `.env` |
| SQL injection prevent | Prisma parameterized queries | ORM |
| XSS protect | React JSX escape | framework |
| CSRF protect | SameSite cookie | session |
| Rate limit (auth) | Clerk built-in | external |
| First-party cookies | `/__clerk/*` proxy | `src/proxy.ts` |
| Data minimization | Only 4 fields in `User` table | schema |
| Cascade delete | `onDelete: Cascade` on FKs | Prisma schema |

---

## หมวดที่ 7: Third Party Processors

ต้องระบุใน privacy policy

| Vendor | Purpose | Data shared | Location | DPA available? |
|--------|---------|-------------|----------|---------------|
| **Clerk** | Auth + session | email, name, password hash, IP, OAuth tokens | US (with EU data residency option) | ✅ |
| **Google Analytics 4** | Web analytics | events + IP (anonymized) | US | ✅ Standard Contractual Clauses |
| **Vercel** | Hosting + SpeedInsights | full request data | Global (Edge) | ✅ |
| **Supabase / PostgreSQL provider** | Database | DB data | depends on plan | ✅ |
| **Google OAuth** (if user signs up via Google) | Identity provider | email, name, profile pic | US | per Google ToS |
| **LINE Login** | Identity provider | LINE display name, optional email | JP | per LINE ToS |
| **Apple Sign In** | Identity provider | email (optional relay), name | US | per Apple ToS |
| **Facebook Login** | Identity provider | email, name | US | per Meta ToS |
| **X / Twitter Login** | Identity provider | username, email | US | per X ToS |
| **Svix** | Webhook signing | webhook payload metadata | US | ✅ |

---

## หมวดที่ 8: Breach Response Plan

ถ้าเกิด data breach:

### ภายใน 1 ชั่วโมง
1. ระบุขอบเขต (ใคร, ข้อมูลไหน, ปริมาณเท่าไหร่)
2. หยุด vector ที่ leak (revoke keys, rotate secrets)
3. แจ้ง engineering team

### ภายใน 72 ชั่วโมง (PDPA timeline)
1. แจ้ง **สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล** (PDPC)
2. ถ้า high risk → แจ้ง user ที่ affected
3. บันทึก incident log

### Mitigation
- Rotate ทุก secret ที่อาจ exposed (Clerk keys, webhook secret, DB password)
- Force re-login ทุก user (revoke sessions ผ่าน Clerk)
- Audit log access ของ DB ในช่วงที่ breach

### Post-mortem
- เขียน `context/incidents/YYYY-MM-DD-incident.md` พร้อม root cause + fix

---

## หมวดที่ 9: Privacy by Design Checklist

ทุก feature ใหม่ต้องตอบ:

- [ ] **Data minimization:** เก็บแค่ที่จำเป็นจริงๆ?
- [ ] **Purpose limitation:** ใช้เฉพาะวัตถุประสงค์ที่ระบุใน privacy policy?
- [ ] **Storage limitation:** กำหนด retention ชัดเจน?
- [ ] **Default privacy:** ตั้งค่าเริ่มต้นให้ปลอดภัยที่สุด?
- [ ] **Transparency:** user รู้ว่าเก็บอะไร?
- [ ] **User control:** มีทางให้ user opt-out / delete?
- [ ] **Security:** encrypted in transit + at rest?
- [ ] **Analytics events ปลอดภัย:** ส่งแค่ aggregate / bucketed ไม่ใช่ raw PII?

---

## หมวดที่ 10: Resources

### กฎหมายไทย
- [PDPA (พรบ. คุ้มครองข้อมูลส่วนบุคคล 2562)](https://www.pdpc.or.th/)
- [Cookie Law (PDPC Notification 2566)](https://www.pdpc.or.th/)

### Standards
- [OWASP Top 10](https://owasp.org/Top10/)
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework)

### Internal docs
- [`context/features/auth.md`](auth.md) — Authentication system
- [`context/database.md`](../database.md) — Database changes log
- `prisma/schema.prisma` — Data model

---

## Status Tracker

อัปเดตเมื่อมีการเปลี่ยนแปลง:

| Item | Status | Target | Done date |
|------|--------|--------|-----------|
| Analytics PII fix (bucket scores) | ✅ Done | Pre-launch | 2026-06-05 |
| /privacy page | ✅ Done | Pre-launch | 2026-06-05 |
| /terms page | ✅ Done | Pre-launch | 2026-06-05 |
| Cookie consent banner | ✅ Done | Pre-launch | 2026-06-05 |
| GA_ID → ENV (`NEXT_PUBLIC_GA_ID`) | ✅ Done | Pre-launch | 2026-06-05 |
| Data export endpoint | 🔴 Not started | Phase 2 | — |
| Account deletion UI | 🟡 Partial (via Clerk) | Phase 2 | — |
| Data retention cron | 🔴 Not started | Phase 2 | — |
| DPO email setup (`privacy@`) | 🔴 Not started | Phase 2 | — |
| Privacy-first analytics switch | 🔴 Not started | Phase 3 | — |
