# Project Structure — jknowledge

> อัปเดตล่าสุด: 2026-05-27

---

## สถานะปัจจุบัน

**Stage: MVP กำลังพัฒนา**

โปรเจกต์มี scaffold พร้อม features หลัก 3 อย่าง:
- ✅ TCAS Score Analyzer (หน้า `/analyze`)
- ✅ MBTI Recommendation System (หน้า `/mbti`)
- ✅ Historical Score Browser (หน้า `/scores`)
- ✅ Authentication ด้วย Clerk
- ✅ Database schema ด้วย Prisma + PostgreSQL
- ✅ ข้อมูล TCAS ย้อนหลัง 64–69 (CSV files)

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
| shadcn | 4.8.0 | ✅ |
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

---

## โครงสร้างไฟล์

```
jknowledge/
├── src/
│   ├── app/
│   │   ├── __clerk/
│   │   │   └── [...path]/route.ts   ← Clerk proxy route
│   │   ├── analyze/
│   │   │   └── page.tsx             ← TCAS Score Analyzer page
│   │   ├── mbti/
│   │   │   └── page.tsx             ← MBTI Quiz page
│   │   ├── scores/
│   │   │   └── page.tsx             ← Historical Score Browser
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/page.tsx  ← Clerk sign-in
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/page.tsx  ← Clerk sign-up
│   │   ├── favicon.ico
│   │   ├── globals.css              ← Tailwind v4 + shadcn CSS variables
│   │   ├── layout.tsx               ← Root layout (ClerkProvider, Header)
│   │   └── page.tsx                 ← Home page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx           ← Site header (nav + auth)
│   │   └── ui/                      ← shadcn/ui components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── select.tsx
│   │
│   ├── features/
│   │   ├── analyze/
│   │   │   └── components/
│   │   │       ├── analyze-form.tsx       ← Form กรอกคะแนน
│   │   │       ├── result-card.tsx        ← แสดงผลการวิเคราะห์
│   │   │       ├── score-position-bar.tsx ← Bar แสดง position ของคะแนน
│   │   │       ├── score-trend-chart.tsx  ← Recharts trend graph
│   │   │       └── weighted-inputs.tsx    ← Input น้ำหนักวิชา
│   │   └── mbti/
│   │       └── components/
│   │           ├── mbti-quiz.tsx          ← Quiz component
│   │           └── mbti-result-card.tsx   ← แสดงผล MBTI + คณะแนะนำ
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
│   │   ├── prisma.ts                ← Prisma client singleton
│   │   ├── subjects.ts              ← รายวิชา TCAS + น้ำหนัก
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
│   ├── History_log/
│   │   └── 2026-05-26.md            ← Session logs
│   ├── architecture.md              ← Architecture decisions
│   ├── business-rules.md            ← Business logic rules
│   ├── database.md                  ← Database notes
│   ├── features/
│   │   ├── history-score.md
│   │   └── tcas-analysis.md
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
| `/mbti` | `app/mbti/page.tsx` | MBTI Quiz & Result |
| `/sign-in` | Clerk UI | Authentication |
| `/sign-up` | Clerk UI | Registration |
| `/api/__clerk/[...path]` | Clerk proxy | Clerk backend route |

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
5. ✅ Authentication (Clerk)
6. ✅ Historical Score Database schema (Prisma)
7. ✅ MBTI System (basic)
8. ⬜ Admission Prediction (AI-assisted)
9. ⬜ Dashboard (user history)
10. ⬜ AI Advisor
11. ⬜ SEO Pages
12. ⬜ Community Features
