# Project Structure — jknowledge

> อัปเดตล่าสุด: 2026-06-11

---

## สถานะปัจจุบัน

**Stage: MVP กำลังพัฒนา**

โปรเจกต์มี scaffold พร้อม features หลัก:
- ✅ TCAS Score Analyzer (หน้า `/analyze`) — ดู [`context/features/tcas-analysis.md`](context/features/tcas-analysis.md)
- ✅ MBTI Recommendation System (หน้า `/mbti`, `/mbti/[type]`) — ดู [`context/features/mbti.md`](context/features/mbti.md)
- ✅ Historical Score Browser (หน้า `/scores`, `/scores/[uni]`, `/scores/[uni]/[fac]`) — ดู [`context/features/history-score.md`](context/features/history-score.md)
- ✅ TCAS Calculator + Min-Scores (หน้า `/tcas/calculator`, `/tcas/min-scores`)
- ✅ TCASfolio — คู่มือพอร์ตโฟลิโอ PDF + วิดีโอ (หน้า `/tcas-folio`)
- ✅ Authentication (Clerk + OAuth 5 providers) — ดู [`context/features/auth.md`](context/features/auth.md)
- ✅ User Dashboard / Profile (หน้า `/dashboard`, `/profile`)
- ✅ Database schema ด้วย Prisma + PostgreSQL — ดู [`context/database.md`](context/database.md)
- ✅ ข้อมูล TCAS ย้อนหลัง 64–69 (CSV files)
- ✅ Analytics (GA4 + Meta Pixel) + Cookie Consent — ดู [`context/features/privacy.md`](context/features/privacy.md)
- ✅ SEO: sitemap, robots, structured data

---

## Tech Stack (ที่ติดตั้งแล้ว)

| Package | Version | สถานะ |
|---------|---------|--------|
| next | 16.2.6 | ✅ App Router |
| react | 19.2.4 | ✅ |
| react-dom | 19.2.4 | ✅ |
| typescript | ^6.0.3 | ✅ devDep |
| tailwindcss | ^4 | ✅ devDep |
| @tailwindcss/postcss | ^4 | ✅ devDep |
| shadcn | ^4.8.0 | ✅ |
| clsx | ^2.1.1 | ✅ via shadcn |
| tailwind-merge | ^3.6.0 | ✅ via shadcn |
| lucide-react | ^1.16.0 | ✅ via shadcn |
| class-variance-authority | ^0.7.1 | ✅ |
| tw-animate-css | ^1.4.0 | ✅ |
| @base-ui/react | ^1.5.0 | ✅ |
| recharts | ^3.8.1 | ✅ Charts |
| @clerk/nextjs | ^7.4.1 | ✅ Auth |
| @clerk/ui | ^1.13.1 | ✅ Auth UI |
| prisma | ^7.8.0 | ✅ ORM |
| @prisma/client | ^7.8.0 | ✅ |
| @prisma/adapter-pg | ^7.8.0 | ✅ |
| pg | ^8.21.0 | ✅ PostgreSQL driver |
| @types/pg | ^8.20.0 | ✅ devDep |
| csv-parse | ^6.2.1 | ✅ import scripts |
| tsx | ^4.22.3 | ✅ run scripts |
| playwright | ^1.60.0 | ✅ devDep (testing) |
| eslint | ^9 | ✅ devDep |
| eslint-config-next | 16.2.6 | ✅ devDep |
| @next/third-parties | ^16.2.7 | ✅ GA4 loader |
| @vercel/speed-insights | ^2.0.0 | ✅ |
| html-to-image | ^1.11.13 | ✅ MBTI shareable card |
| react-pdf | ^10.4.1 | ✅ PDF viewer (TCASfolio) |
| pdfjs-dist | ^5.4.296 | ✅ transitive (react-pdf) |
| wawoff2 | ^2.0.1 | ✅ devDep |

---

## โครงสร้างไฟล์

```
jknowledge/
├── src/
│   ├── app/
│   │   ├── __clerk/
│   │   │   └── [...path]/route.ts   ← Clerk proxy route
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts   ← Clerk webhook (user lifecycle → DB sync)
│   │   ├── analyze/
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx             ← TCAS Score Analyzer page
│   │   ├── dashboard/
│   │   │   ├── _components/
│   │   │   │   └── dashboard-list.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx             ← ประวัติการวิเคราะห์ (protected)
│   │   ├── mbti/
│   │   │   ├── [type]/
│   │   │   │   └── page.tsx         ← MBTI result + คณะแนะนำ (SSG)
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx             ← MBTI Quiz page
│   │   ├── privacy/
│   │   │   └── page.tsx             ← Privacy policy
│   │   ├── profile/
│   │   │   ├── _components/
│   │   │   │   ├── avatar-upload.tsx
│   │   │   │   ├── delete-account-button.tsx
│   │   │   │   ├── edit-name-form.tsx
│   │   │   │   └── sign-out-button.tsx
│   │   │   └── page.tsx             ← Profile settings (protected)
│   │   ├── result/
│   │   │   └── [id]/
│   │   │       └── page.tsx         ← Shared analysis result (public)
│   │   ├── scores/
│   │   │   ├── [universitySlug]/
│   │   │   │   ├── [facultySlug]/
│   │   │   │   │   └── page.tsx     ← Score detail + trend
│   │   │   │   └── page.tsx         ← Faculty list ของมหาวิทยาลัย
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx             ← Historical Score Browser
│   │   ├── sign-in/
│   │   │   ├── [[...sign-in]]/page.tsx   ← Clerk sign-in
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── sso-callback/page.tsx
│   │   ├── sign-up/
│   │   │   ├── [[...sign-up]]/page.tsx   ← Clerk sign-up
│   │   │   └── sso-callback/page.tsx
│   │   ├── tcas/
│   │   │   ├── calculator/page.tsx  ← TCAS score calculator (standalone)
│   │   │   └── min-scores/
│   │   │       ├── _components/filter.tsx
│   │   │       └── page.tsx         ← Min-score lookup table
│   │   ├── tcas-folio/
│   │   │   └── page.tsx             ← TCASfolio: PDF + video course player
│   │   ├── terms/
│   │   │   └── page.tsx             ← Terms of service
│   │   ├── error.tsx                ← Root error boundary
│   │   ├── favicon.ico
│   │   ├── globals.css              ← Tailwind v4 + shadcn CSS variables
│   │   ├── layout.tsx               ← Root layout (ClerkProvider, Header, analytics)
│   │   ├── loading.tsx              ← Root loading state
│   │   ├── not-found.tsx            ← 404 page
│   │   ├── page.tsx                 ← Home page
│   │   ├── robots.ts                ← robots.txt (SEO)
│   │   └── sitemap.ts               ← sitemap.xml (SEO)
│   │
│   ├── components/
│   │   ├── animations/
│   │   │   ├── count-up.tsx         ← Animated number counter
│   │   │   └── fade-in.tsx          ← Fade-in scroll animation
│   │   ├── layout/
│   │   │   ├── auth-layout.tsx      ← Shared layout for sign-in/sign-up
│   │   │   ├── bottom-nav.tsx       ← Mobile bottom navigation
│   │   │   ├── header.tsx           ← Site header (nav + auth)
│   │   │   ├── mobile-menu.tsx      ← Mobile nav drawer
│   │   │   ├── page-transition.tsx  ← Route transition animation
│   │   │   └── profile-avatar-link.tsx
│   │   ├── ui/                      ← shadcn/ui components
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── error-page.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-to-top.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toaster.tsx
│   │   ├── analytics-loader.tsx     ← GA4 + Meta Pixel loader (consent-gated)
│   │   ├── cookie-consent.tsx       ← Cookie consent banner
│   │   ├── meta-pixel.tsx           ← Meta Pixel script component
│   │   └── university-logo.tsx      ← University logo image with fallback
│   │
│   ├── features/
│   │   ├── analyze/
│   │   │   ├── actions/
│   │   │   │   └── get-mbti-match.ts      ← Server action: MBTI ↔ คณะ matching
│   │   │   └── components/
│   │   │       ├── analyze-form.tsx       ← Form กรอกคะแนน + Combobox มหาวิทยาลัย/คณะ
│   │   │       ├── mbti-match-badge.tsx   ← Badge แสดงความเข้ากันได้กับ MBTI
│   │   │       ├── result-card.tsx        ← แสดงผลการวิเคราะห์
│   │   │       ├── score-position-bar.tsx ← Bar แสดง position ของคะแนน
│   │   │       ├── score-trend-chart.tsx  ← Recharts trend graph
│   │   │       ├── score-trend-chart-lazy.tsx ← Lazy-loaded wrapper
│   │   │       ├── share-result-button.tsx← แชร์ผลลัพธ์ (html-to-image)
│   │   │       └── weighted-inputs.tsx    ← Input น้ำหนักวิชา
│   │   ├── auth/                           ← ดู context/features/auth.md
│   │   │   ├── icons.tsx                  ← Provider brand SVGs (Google/LINE/Apple/FB/X)
│   │   │   └── components/
│   │   │       ├── auth-shell.tsx         ← Card + header + footer toggle + divider
│   │   │       └── oauth-buttons.tsx      ← OAuth provider button group
│   │   ├── mbti/
│   │   │   ├── actions/
│   │   │   │   ├── get-faculties.ts       ← Server action: คณะแนะนำตาม MBTI
│   │   │   │   ├── get-insights.ts        ← Server action: AI insight ต่อ type
│   │   │   │   └── save-result.ts         ← Server action: บันทึกผล MBTI ลง DB
│   │   │   ├── components/
│   │   │   │   ├── mbti-faculty-list.tsx  ← รายการคณะแนะนำ
│   │   │   │   ├── mbti-personal-insight.tsx
│   │   │   │   ├── mbti-quiz.tsx          ← Quiz component (cross-feature pool)
│   │   │   │   ├── mbti-result-card.tsx   ← แสดงผล MBTI + คณะแนะนำ
│   │   │   │   ├── mbti-reveal.tsx        ← Reveal animation สำหรับผลลัพธ์
│   │   │   │   ├── mbti-share-modal.tsx   ← Modal แชร์ผลลัพธ์
│   │   │   │   └── mbti-shareable-card.tsx← การ์ดสำหรับ export เป็นรูป
│   │   │   └── hooks/
│   │   │       └── use-session-seed.ts    ← Deterministic quiz pool seed
│   │   ├── scores/
│   │   │   ├── components/
│   │   │   │   ├── faculty-list.tsx
│   │   │   │   ├── score-history-chart.tsx
│   │   │   │   ├── score-history-chart-lazy.tsx
│   │   │   │   ├── score-table.tsx
│   │   │   │   └── university-grid.tsx
│   │   │   └── lib/
│   │   │       └── field-labels.ts        ← Label mapping สำหรับ FacultyField
│   │   └── tcas-folio/
│   │       ├── components/
│   │       │   ├── pdf-canvas-preview.tsx ← Custom canvas PDF viewer (react-pdf, no native UI)
│   │       │   ├── pdf-preview-card.tsx   ← PDF card + fullscreen modal
│   │       │   ├── tcas-folio-player.tsx  ← Course player (video + sidebar tabs)
│   │       │   └── video-facade.tsx       ← YouTube facade (thumbnail → click-to-load)
│   │       ├── data/
│   │       │   └── content.ts             ← PDF + episode metadata
│   │       └── utils/
│   │           └── youtube.ts             ← getYoutubeVideoId() URL normalizer
│   │
│   ├── data/
│   │   ├── tcas64-69/               ← Raw CSV ข้อมูล TCAS ย้อนหลัง
│   │   │   ├── T68-stat-r3_2-maxmin-24May25 - Sheet1.csv
│   │   │   ├── TCAS64_maxmin - Sheet1.csv
│   │   │   ├── TCAS65_maxmin - Sheet1.csv
│   │   │   ├── TCAS66_maxmin - maxmin66.csv
│   │   │   └── TCAS67_maxmin - Sheet2.csv
│   │   ├── index.ts                 ← re-export data
│   │   ├── mbti-questions.ts        ← คำถาม MBTI
│   │   ├── mbti-types.ts            ← ข้อมูล 16 types + คณะแนะนำ
│   │   ├── scores.ts                ← Static score data (fallback)
│   │   └── universities.ts          ← รายชื่อมหาวิทยาลัย
│   │
│   ├── generated/
│   │   └── prisma/                  ← Auto-generated Prisma client
│   │       ├── browser.ts
│   │       ├── client.ts
│   │       ├── commonInputTypes.ts
│   │       ├── enums.ts
│   │       ├── models.ts
│   │       ├── models/
│   │       │   ├── Faculty.ts
│   │       │   ├── FacultyRequirement.ts
│   │       │   ├── PredictionHistory.ts
│   │       │   ├── TcasScore.ts
│   │       │   ├── University.ts
│   │       │   └── User.ts
│   │       └── internal/
│   │           ├── class.ts
│   │           ├── prismaNamespace.ts
│   │           └── prismaNamespaceBrowser.ts
│   │
│   ├── lib/
│   │   ├── analytics.ts             ← GA4 / Meta Pixel event helpers
│   │   ├── consent.ts               ← Cookie consent state helpers
│   │   ├── mbti-claim.ts            ← Link MBTI result กับ user หลัง login
│   │   ├── normalize-faculty.ts     ← Normalize ชื่อคณะ/สาขา
│   │   ├── prisma.ts                ← Prisma client singleton
│   │   ├── site.ts                  ← Site metadata constants (URL, ชื่อ, social)
│   │   ├── subjects.ts              ← รายวิชา TCAS + น้ำหนัก
│   │   ├── thai-regions.ts          ← ภูมิภาค/จังหวัดของไทย
│   │   ├── thai-synonyms.ts         ← คำพ้องความหมายภาษาไทยสำหรับค้นหา
│   │   ├── university-logo.ts       ← Resolve โลโก้มหาวิทยาลัย
│   │   └── utils.ts                 ← cn() utility
│   │
│   ├── server/
│   │   ├── actions.ts               ← Server Actions
│   │   └── queries.ts               ← DB query functions
│   │
│   ├── types/
│   │   ├── mbti.ts                  ← MBTI TypeScript types
│   │   └── tcas.ts                  ← TCAS-related types
│   │
│   ├── utils/
│   │   ├── analyze.ts               ← Score analysis logic
│   │   └── mbti.ts                  ← MBTI scoring logic
│   │
│   └── proxy.ts                     ← Clerk proxy config
│
├── prisma/
│   ├── schema.prisma                ← Database schema (6 models)
│   └── seed.ts                      ← Seed script
│
├── scripts/
│   ├── import-tcas.ts               ← Import CSV → DB
│   ├── import-weights.ts            ← Import weights → DB
│   └── update-logos.ts              ← Update university logos
│
├── context/
│   ├── History_log/                 ← Session logs (รายวัน YYYY-MM-DD.md)
│   ├── UX/                          ← UX research + redesign notes
│   ├── architecture.md              ← Architecture decisions
│   ├── business-rules.md            ← Business logic rules
│   ├── database.md                  ← Database changes log
│   ├── features/
│   │   ├── auth.md                  ← Auth system (Clerk + OAuth + webhook + DB sync)
│   │   ├── history-score.md         ← Historical TCAS score browser
│   │   ├── mbti-core.md             ← MBTI scoring algorithm + 16 types
│   │   ├── mbti.md                  ← MBTI quiz + faculty recommendation flow
│   │   ├── privacy.md               ← Privacy/PDPA compliance guide + roadmap
│   │   └── tcas-analysis.md         ← Score analyzer + admission probability
│   ├── mbti-audit.md                ← MBTI quiz audit notes
│   ├── mbti-quiz-redesign.md        ← MBTI quiz redesign notes
│   ├── mbti-roadmap.md              ← MBTI roadmap
│   ├── planning.md                  ← Active planning notes
│   ├── progress.md                  ← Overall progress tracker
│   └── roadmap/
│       ├── mvp-roadmap.md
│       └── roadmap_phase2.md
│
├── public/
│   ├── jknowledge_logo.png          ← Brand logo
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .claude/
│   ├── settings.json                ← Claude Code project permissions
│   └── settings.local.json
│
├── .env                             ← Environment variables (git-ignored)
├── .env.local                       ← Local env override (git-ignored)
├── AGENTS.md                        ← Agent-specific instructions
├── CLAUDE.md                        ← Project instructions (AI rules)
├── STRUCTURE.md                     ← ไฟล์นี้ (project map)
├── README.md
├── components.json                  ← shadcn/ui config
├── next.config.mjs                  ← Next.js config
├── next-env.d.ts
├── prisma.config.ts                 ← Prisma config
├── tsconfig.json                    ← TypeScript config (strict, paths)
├── postcss.config.mjs               ← PostCSS สำหรับ Tailwind
└── eslint.config.mjs
```

---

## Database Schema (Prisma)

6 models:

| Model | ความหมาย |
|-------|----------|
| `University` | มหาวิทยาลัย (slug, name, color, logoUrl) |
| `Faculty` | คณะ/หลักสูตร (program, majorName, detail, field, programCode) |
| `FacultyRequirement` | น้ำหนักวิชา TCAS ของแต่ละคณะ (JSON weights) |
| `TcasScore` | คะแนน min/avg/max ย้อนหลังรายปี/รอบ |
| `User` | ผู้ใช้ (clerkId, email) |
| `PredictionHistory` | ประวัติการวิเคราะห์คะแนน |

Enum:
- `FacultyField` — 15 สาขา (medicine, engineering, law, ...)
- `AdmissionChance` — high / competitive / low

---

## App Routes

| Route | Component | หมายเหตุ |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Home page |
| `/analyze` | `app/analyze/page.tsx` | TCAS Score Analyzer |
| `/scores` | `app/scores/page.tsx` | Historical Score Browser |
| `/scores/[uni]` | `app/scores/[universitySlug]/page.tsx` | Faculty list ของมหาวิทยาลัย |
| `/scores/[uni]/[fac]` | `app/scores/[universitySlug]/[facultySlug]/page.tsx` | Score detail + trend |
| `/mbti` | `app/mbti/page.tsx` | MBTI Quiz |
| `/mbti/[type]` | `app/mbti/[type]/page.tsx` | MBTI result + คณะแนะนำ (SSG) |
| `/tcas/calculator` | `app/tcas/calculator/page.tsx` | TCAS score calculator (standalone) |
| `/tcas/min-scores` | `app/tcas/min-scores/page.tsx` | ตารางคะแนนต่ำสุดย้อนหลัง |
| `/tcas-folio` | `app/tcas-folio/page.tsx` | TCASfolio — คู่มือ PDF + วิดีโอทำพอร์ตโฟลิโอ |
| `/dashboard` | `app/dashboard/page.tsx` | ประวัติการวิเคราะห์ (protected) |
| `/profile` | `app/profile/page.tsx` | ตั้งค่าโปรไฟล์ (protected) |
| `/result/[id]` | `app/result/[id]/page.tsx` | ผลวิเคราะห์ที่แชร์ (public) |
| `/privacy` | `app/privacy/page.tsx` | นโยบายความเป็นส่วนตัว |
| `/terms` | `app/terms/page.tsx` | ข้อกำหนดการใช้งาน |
| `/sign-in` | Custom UI (Clerk Future API + OAuth) | ดู [`features/auth.md`](context/features/auth.md) |
| `/sign-in/forgot-password` | `app/sign-in/forgot-password/page.tsx` | รีเซ็ตรหัสผ่าน |
| `/sign-in/sso-callback` | `app/sign-in/sso-callback/page.tsx` | OAuth callback |
| `/sign-up` | Custom UI (Clerk Future API + OAuth) | ดู [`features/auth.md`](context/features/auth.md) |
| `/sign-up/sso-callback` | `app/sign-up/sso-callback/page.tsx` | OAuth callback |
| `/__clerk/[...path]` | Frontend API proxy | First-party cookie domain |
| `/api/webhooks/clerk` | Webhook handler | User lifecycle → DB sync (Svix verified) |
| `/sitemap.xml` | `app/sitemap.ts` | SEO sitemap |
| `/robots.txt` | `app/robots.ts` | SEO robots |

---

## Path Aliases

```ts
import { Something } from "@/components/..."  // → src/components/...
import { Something } from "@/lib/..."         // → src/lib/...
import { Something } from "@/features/..."    // → src/features/...
import { Something } from "@/server/..."      // → src/server/...
import { Something } from "@/types/..."       // → src/types/...
import { Something } from "@/utils/..."       // → src/utils/...
import { Something } from "@/data/..."        // → src/data/...
```

---

## shadcn/ui Config

```json
{
  "style": "base-nova",
  "baseColor": "neutral",
  "cssVariables": true,
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Scripts

```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Production server
npm run lint   # ESLint

# Database
npx prisma generate     # Generate Prisma client
npx prisma db push      # Sync schema to DB
npx prisma studio       # DB GUI

# Import TCAS data
npx tsx scripts/import-tcas.ts
npx tsx scripts/import-weights.ts
npx tsx scripts/update-logos.ts
```

---

## Development Priority (จาก CLAUDE.md)

1. ✅ Next.js scaffold + TypeScript strict mode
2. ✅ shadcn/ui (v4.8.0, Tailwind v4)
3. ✅ Folder structure (features/, components/, lib/, etc.)
4. ✅ TCAS Score Calculator / Analyzer
5. ✅ Authentication (Clerk + OAuth: Google/LINE/Apple/Facebook/X) — [`features/auth.md`](context/features/auth.md)
6. ✅ Historical Score Database schema (Prisma)
7. ✅ MBTI System (16 types + faculty matching)
8. ✅ Admission Prediction (chance + gap calculation)
9. ✅ Dashboard (user history, protected route)
10. ✅ TCASfolio (Portfolio guide PDF + video player)
11. ✅ Analytics + Cookie Consent (GA4, Meta Pixel)
12. ✅ SEO Pages (sitemap, robots, privacy, terms)
13. ⬜ AI Advisor
14. ⬜ Community Features
