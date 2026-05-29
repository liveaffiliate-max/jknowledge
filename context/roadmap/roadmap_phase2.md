# POST_MVP_ROADMAP.md

# Jknowledge Post-MVP Roadmap

## Goal

Move from demo project → real product.

Focus on:
- real data
- user retention
- scalability
- trust
- growth

---

# Phase 1 — Real Database

Replace mock data with real database.

Tasks:
- Setup Supabase/PostgreSQL
- Setup Prisma ORM
- Create schema
- Import TCAS historical scores
- Create admin import flow

Main tables:
- universities
- faculties
- tcas_scores
- users
- prediction_history

---

# Phase 2 — Authentication

Add user accounts.

Features:
- Login/Register
- Save results
- Save favorite faculties
- User dashboard

Recommended:
- Clerk
or
- NextAuth

---

# Phase 3 — Better Prediction System

Upgrade score analysis logic.

Add:
- historical trends
- percentile calculation
- score gap analysis
- safer faculty recommendations

Avoid:
- guaranteed admission wording

---

# Phase 4 — AI Features

Add AI advisor.

Features:
- admission guidance
- backup recommendations
- study suggestions
- faculty comparison

Recommended:
- OpenAI API

---

# Phase 5 — SEO System

Build SEO pages.

Pages:
- university pages
- faculty pages
- score history pages
- ranking pages
- blog articles

Goal:
- organic traffic growth

---

# Phase 6 — Content & Viral Growth

Build shareable features.

Examples:
- MBTI result cards
- score prediction cards
- ranking lists
- trend pages

Platforms:
- TikTok
- Instagram
- Facebook
- Twitter/X

---

# Phase 7 — Analytics

Track:
- popular faculties
- user searches
- conversion flow
- retention
- prediction usage

Recommended:
- PostHog
- Google Analytics

---

# Phase 8 — Admin Dashboard

Build internal management system.

Features:
- manage universities
- manage scores
- import yearly data
- analytics overview

---

# Phase 9 — Performance & Scaling

Optimize:
- database queries
- image loading
- caching
- SEO performance
- mobile performance

Prepare for:
- high TCAS season traffic

---

# Future Features

Possible expansion:
- AI tutor
- study planner
- faculty reviews
- university reviews
- community
- premium subscription
- mock exam analysis

---

# Main Priorities

Priority order:

1. Real database
2. Authentication
3. Better prediction logic
4. AI advisor
5. SEO
6. Analytics
7. Admin dashboard

---

# Important Rules

Always prioritize:
- data accuracy
- mobile UX
- fast loading
- simple UI
- student trust

Never:
- fake statistics
- overcomplicate MVP features
- guarantee admission