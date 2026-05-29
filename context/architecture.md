# Project Architecture — Jknowledge TCAS Platform

_Last updated: 2026-05-26_

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| Language | TypeScript | 6.x |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) | 4.x |
| Database | PostgreSQL via Supabase | — |
| ORM | Prisma (adapter-pg) | 7.8.0 |
| Auth | Clerk | 7.4.1 |
| Charts | Recharts | 3.x |
| Runtime | Node.js / Vercel Edge | — |

---

## Folder Structure

```
jknowledge/
├── prisma/
│   ├── schema.prisma          # DB models: University, Faculty, TcasScore, User, PredictionHistory
│   └── seed.ts                # Seed script (mock 8 universities, 20 faculties)
│
├── prisma.config.ts           # Prisma 7 config — MIGRATE_URL (port 5432) / DATABASE_URL (port 6543)
│
├── scripts/
│   └── import-tcas.ts         # นำเข้าข้อมูลจริงจาก ทปอ CSV (TCAS64–68 ~27,000 rows)
│
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout — ClerkProvider (shadcn theme) + fonts
│   │   ├── globals.css        # Tailwind + shadcn + @clerk/ui/themes/shadcn.css
│   │   ├── page.tsx           # หน้าแรก (Landing page)
│   │   ├── analyze/
│   │   │   └── page.tsx       # หน้าวิเคราะห์คะแนน (async server component, force-dynamic)
│   │   ├── mbti/
│   │   │   └── page.tsx       # หน้าแนะนำคณะตาม MBTI
│   │   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in page
│   │   ├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up page
│   │   └── __clerk/[...path]/
│   │       └── route.ts       # Clerk Frontend API proxy handler (แก้ lcl.dev error)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx     # Sticky header — nav + Clerk auth buttons (Show/SignInButton/UserButton)
│   │   └── ui/                # shadcn/ui base components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── select.tsx
│   │
│   ├── features/              # Feature-based modules
│   │   ├── analyze/
│   │   │   └── components/
│   │   │       ├── analyze-form.tsx        # Client component — university/faculty picker + score input
│   │   │       ├── result-card.tsx         # แสดงผลการวิเคราะห์ (chance, gap, trend)
│   │   │       ├── score-position-bar.tsx  # Visual bar แสดงตำแหน่งคะแนนผู้ใช้
│   │   │       └── score-trend-chart.tsx   # Recharts line chart คะแนนย้อนหลัง 5 ปี
│   │   └── mbti/
│   │       └── components/
│   │           ├── mbti-quiz.tsx           # Client component — 20 คำถาม ทีละข้อ
│   │           └── mbti-result-card.tsx    # แสดงผล MBTI type + คณะแนะนำ
│   │
│   ├── server/                # Server-only logic (no "use client")
│   │   ├── queries.ts         # DB read functions — getUniversities, getFacultiesByUniversityId, getFacultyWithScores
│   │   └── actions.ts         # Server Actions — fetchFacultiesAction, analyzeAction
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton (PrismaPg adapter + global cache)
│   │   └── utils.ts           # cn() helper (clsx + tailwind-merge)
│   │
│   ├── data/                  # Static/seed data
│   │   ├── index.ts           # Re-exports
│   │   ├── scores.ts          # Mock score data (legacy — ถูกแทนด้วย DB แล้ว)
│   │   ├── universities.ts    # Mock university list (legacy)
│   │   ├── mbti-questions.ts  # 20 คำถาม MBTI (Thai)
│   │   ├── mbti-types.ts      # 16 MBTI profiles + faculty recommendations
│   │   └── tcas64-69/         # Raw CSV จาก ทปอ (5 ปี — ใช้ import script เท่านั้น)
│   │       ├── TCAS64_maxmin - Sheet1.csv
│   │       ├── TCAS65_maxmin - Sheet1.csv
│   │       ├── TCAS66_maxmin - maxmin66.csv
│   │       ├── TCAS67_maxmin - Sheet2.csv
│   │       └── T68-stat-r3_2-maxmin-24May25 - Sheet1.csv
│   │
│   ├── types/
│   │   ├── tcas.ts            # University, Faculty, FacultyWithScores, AdmissionResult, YearlyScore
│   │   └── mbti.ts            # MBTIType, MBTIDimension, MBTIQuestion, MBTIProfile, MBTIResult
│   │
│   ├── utils/
│   │   ├── analyze.ts         # calculateAdmissionChance(), calculateTrend()
│   │   └── mbti.ts            # computeMBTIResult(), dimensionStrength()
│   │
│   ├── generated/prisma/      # Auto-generated Prisma client (ห้ามแก้มือ)
│   │   ├── client.ts
│   │   ├── models/            # University, Faculty, TcasScore, User, PredictionHistory
│   │   └── ...
│   │
│   └── proxy.ts               # Next.js middleware — Clerk auth guard (isProtectedRoute)
│
├── context/                   # Project documentation
│   ├── architecture.md        # ← ไฟล์นี้
│   ├── business-rules.md
│   ├── database.md
│   └── roadmap/
│
├── .env.local                 # Secrets (gitignored)
├── .clerk/                    # Clerk CLI config
├── components.json            # shadcn/ui config (base-nova style)
├── next.config.mjs
├── prisma.config.ts
└── tsconfig.json
```

---

## Database Schema

```
University
  id, slug, name, shortName, location, color
  └─── Faculty (many)
         id, universityId, slug, name, program, majorName?, detail?, programCode?, field
         └─── TcasScore (many)
                id, facultyId, year, round, minScore, avgScore, maxScore?, seats?

User
  id, clerkId?, email?, name?
  └─── PredictionHistory (many)
         id, userId, facultyId, userScore, chance, gap, createdAt
```

**Key constraints:**
- `Faculty` unique on `[universityId, slug]` — slug = `programCode[:majorName][:detail]`
- `TcasScore` unique on `[facultyId, year, round]`
- `Faculty.detail` ใช้แยก exam-route ที่ต่างกัน เช่น "เลือกสอบภาษาเกาหลี"

---

## Data Flow — Analyze Feature

```
[Browser]
  AnalyzeForm (client)
      │
      ├─ onChange university → fetchFacultiesAction(universityId)  ← Server Action
      │                              └─ queries.getFacultiesByUniversityId()
      │                                      └─ prisma.faculty.findMany()
      │
      └─ onSubmit (score) → analyzeAction(facultyId, score)        ← Server Action
                                 └─ queries.getFacultyWithScores()
                                 └─ utils/analyze.calculateAdmissionChance()
                                 └─ utils/analyze.calculateTrend()
                                 └─ → AdmissionResult
      │
      └─ → ResultCard / ScorePositionBar / ScoreTrendChart (client render)
```

---

## Auth Flow (Clerk)

```
Request
  └─ src/proxy.ts (Next.js middleware)
        ├─ isProtectedRoute? (/dashboard, /profile) → auth.protect() → redirect /sign-in
        └─ public route → pass through

/__clerk/[...path]
  └─ src/app/__clerk/[...path]/route.ts
        └─ createFrontendApiProxyHandlers() — proxies Clerk FAPI requests locally
```

**Auth components in Header:**
- `Show when="signed-out"` → `SignInButton` + `SignUpButton` (mode="modal")
- `Show when="signed-in"` → `UserButton`

---

## MBTI System

```
mbti-quiz.tsx (client)
  └─ 20 คำถาม (mbti-questions.ts) ทีละข้อ
  └─ answers[] → computeMBTIResult() (utils/mbti.ts)
        └─ tally E/I, S/N, T/F, J/P scores
        └─ → MBTIType (เช่น "INTJ")

mbti-result-card.tsx
  └─ getMBTIProfile(type) (mbti-types.ts)
        └─ แสดง: ชื่อ type, คำอธิบาย, dimension bars, คณะแนะนำ, careers, share button
```

---

## Environment Variables

| Variable | ใช้ที่ | หมายเหตุ |
|---------|--------|---------|
| `DATABASE_URL` | Prisma runtime | Transaction pooler port 6543 |
| `MIGRATE_URL` | prisma db push/migrate | Session pooler port 5432 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client | pk_test_... |
| `CLERK_SECRET_KEY` | Clerk server | sk_test_... |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk redirect | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk redirect | `/sign-up` |

---

## Key Conventions

- **Server Components** → async, ไม่มี "use client", เรียก DB โดยตรง
- **Client Components** → ใช้ `useTransition` สำหรับ loading state
- **Server Actions** → ไฟล์ `src/server/actions.ts` มี `"use server"` ที่บรรทัดแรก
- **`export const dynamic = "force-dynamic"`** → ทุก page ที่เรียก DB (ป้องกัน static generation)
- **Prisma** — ใช้ `PrismaPg` adapter (ไม่ใส่ `url` ใน schema.prisma — Prisma 7 breaking change)
- **Slug format** — `programCode[:majorName][:detail]` เพื่อแยก exam-route

---

## Completed Phases

| Phase | สถานะ | รายละเอียด |
|-------|--------|-----------|
| Phase 1 — MVP UI | ✅ | Analyze form, ResultCard, ScoreTrendChart, MBTI quiz |
| Phase B — Real Database | 🔄 | Supabase + Prisma setup เสร็จ, รอ import CSV |
| Phase 2 — Authentication | ✅ | Clerk v7, proxy handler, auth controls in header |

## Next Phases

| Phase | รายละเอียด |
|-------|-----------|
| Phase B (import) | รัน `npx prisma db push` → `npx prisma generate` → `npx tsx scripts/import-tcas.ts` |
| Phase 3 | Prediction history — บันทึกผลวิเคราะห์ต่อ User |
| Phase 4 | Dashboard — ประวัติการวิเคราะห์, สถิติส่วนตัว |
| Phase 5 | SEO pages — `/university/[slug]`, `/faculty/[slug]` |
