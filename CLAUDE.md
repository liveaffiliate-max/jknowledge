@AGENTS.md
# CLAUDE.md

## Git Rules

**ห้าม** `git commit` หรือ `git push` ทุกกรณี เว้นแต่ผู้ใช้สั่งโดยตรงเท่านั้น

- ❌ ห้าม commit โดยอัตโนมัติหลังแก้ code
- ❌ ห้าม push โดยอัตโนมัติหลัง commit
- ✅ ทำได้เฉพาะเมื่อผู้ใช้พิมพ์ "commit" หรือ "push" อย่างชัดเจน

---

## Project Overview

This project is an AI-powered TCAS university admission analysis platform for Thai students.

Main goals:
- Help students analyze TCAS scores
- Predict admission chances
- Compare historical cutoff scores
- Recommend faculties/universities
- Provide MBTI-based faculty recommendations
- Build a student-focused education ecosystem

Target users:
- Thai high school students
- TCAS candidates
- Students preparing for university admission

---

# Product Vision

Build the most student-friendly TCAS analysis platform in Thailand.

Core principles:
- Mobile-first
- Fast
- Easy to understand
- Data-driven
- Visually modern
- Shareable on social media
- AI-assisted guidance

---

# Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Next.js Server Actions
- API Routes

## Database
- PostgreSQL
- Prisma ORM

## Authentication
- Clerk or NextAuth

## Charts
- Recharts

## Deployment
- Vercel

---

# Coding Standards

## General Rules

- Use TypeScript everywhere
- Avoid using `any`
- Prefer server components when possible
- Use async/await
- Keep components modular
- Avoid duplicated logic
- Keep functions small and reusable

---

# Folder Structure

Use scalable feature-based architecture.

Example:

src/
├── app/
├── components/
├── features/
├── lib/
├── services/
├── hooks/
├── types/
├── utils/
├── server/
├── prisma/
└── styles/

---

# UI/UX Rules

## Design Style

The UI should feel:
- Modern
- Clean
- Friendly
- Minimal
- Student-focused

## Primary Theme

Brand color:
- Green
- White
- Dark green accents

## UX Priorities

- Mobile-first
- Large touch targets
- Fast loading
- Simple navigation
- Easy readability

---

# Main Features

## 1. TCAS Score Analysis

Users can:
- Input scores
- Select university/faculty
- Analyze admission probability

System should:
- Compare against historical scores
- Calculate score gaps
- Show trends
- Estimate competitiveness

---

## 2. Historical Score Database

Store:
- University
- Faculty
- TCAS round
- Minimum score
- Average score
- Maximum score
- Number of seats
- Year

Must support:
- 5+ years historical data
- Trend analysis
- Filtering

---

## 3. AI Admission Advisor

AI should:
- Analyze score strength
- Recommend safer choices
- Suggest backup faculties
- Explain competitiveness

Avoid absolute statements like:
- "Guaranteed admission"

Prefer:
- "High chance"
- "Competitive range"
- "Likely admission"

---

## 4. MBTI Recommendation System

Users can:
- Take MBTI test
- Receive faculty recommendations

Recommendation logic should consider:
- Personality
- Interests
- Career paths
- Communication style

---

# SEO Strategy

Pages should be SEO optimized.

Target keywords:
- คะแนนต่ำสุด TCAS
- คะแนนย้อนหลัง
- คณะไหนดี
- MBTI คณะ
- TCAS calculator

Requirements:
- Dynamic metadata
- Structured data
- Fast performance
- Semantic HTML

---

# Performance Rules

- Use lazy loading when appropriate
- Optimize images
- Use server rendering where possible
- Avoid unnecessary client components
- Minimize bundle size

---

# Security Rules

- Validate all inputs
- Never trust client-side data
- Protect APIs
- Sanitize user-generated content
- Use rate limiting on public endpoints

---

# AI Behavior Instructions

When generating code:
- Prefer production-ready implementations
- Prioritize readability
- Use clean architecture
- Avoid overengineering
- Add comments only when necessary

When suggesting UI:
- Use modern SaaS-style layouts
- Prioritize mobile responsiveness
- Keep interfaces simple

When building features:
- Think scalability first
- Separate business logic from UI
- Use reusable abstractions

---

# Database Logging Rule

**ทุกครั้งที่มีการทำงานที่เกี่ยวข้องกับ database ให้บันทึกลงในไฟล์:**

```
context/database.md
```

ครอบคลุม:
- การเปลี่ยน schema (เพิ่ม/ลบ/แก้ model, field, index)
- การรัน migration หรือ `prisma db push`
- การ reset DB
- การ import/export data
- การ design หรือ redesign โครงสร้าง DB
- bugs หรือ data quality issues ที่พบ

Format:

```markdown
## YYYY-MM-DD — ชื่อ task

### สิ่งที่ทำ
- bullet points

### Schema changes
- Model X: เพิ่ม field Y (type)

### หมายเหตุ
- ข้อควรระวัง / decision ที่ตัดสินใจ
```

กฎ:
- **เขียนทุกครั้ง** ที่มีการแตะ DB ไม่ว่าจะเล็กน้อยแค่ไหน
- เขียน **ต่อท้าย** ไฟล์เดิม (append) ไม่ใช่เขียนทับ
- ถ้าไฟล์ยังไม่มี ให้สร้างใหม่

---

# Session Logging Rule

**ทุกครั้งที่มีการ update code หรือทำงานในส่วนใดส่วนหนึ่งของ project ให้เขียน log ลงในไฟล์:**

```
context/History_log/YYYY-MM-DD.md
```

Format ของแต่ละ session:

```markdown
## HH:MM — ชื่อ feature หรือ task

### สิ่งที่ทำ
- bullet points อธิบายสิ่งที่ทำในแต่ละขั้นตอน

### Files changed
- `path/to/file.ts` — คำอธิบาย
```

กฎ:
- ถ้าไฟล์วันนั้นยังไม่มี ให้สร้างใหม่
- เขียน **ทุกครั้ง** ที่ session จบ ไม่ว่าจะทำเยอะหรือน้อย
- ให้เพียงพอที่จะ reconstruct ว่าทำอะไรไปบ้างโดยไม่ต้องอ่าน code

---

# Database Philosophy

Data accuracy is critical.

Never:
- Guess TCAS score data
- Fabricate historical statistics

Always:
- Clearly label estimated calculations
- Distinguish official vs predicted data

---

# Content Strategy

The platform should support:
- Viral educational content
- Social sharing
- TikTok-friendly tools
- SEO landing pages

Potential future features:
- Faculty reviews
- University reviews
- Study planner
- AI tutor
- Community discussions

---

# Development Priorities

Priority order:

1. TCAS score calculator
2. Authentication
3. Historical score database
4. Admission prediction
5. Dashboard
6. MBTI system
7. AI advisor
8. SEO pages
9. Community features

---

# Important Notes

This is a real production-oriented platform.

Focus on:
- Scalability
- Maintainability
- UX quality
- Performance
- Reliability
- Data accuracy

Avoid:
- Toy examples
- Overly generic UI
- Fake data in production logic
- Unnecessary complexity