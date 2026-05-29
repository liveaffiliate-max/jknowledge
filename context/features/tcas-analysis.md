# TCAS Analysis Feature

## Goal

Build a dynamic TCAS score analysis system.

Users can:
- input scores
- select university/faculty
- calculate admission score
- compare historical scores
- estimate admission chance

---

# Current Features

## Analyze Form

Users can input:
- GPA
- TGAT
- TPAT1-5
- A-Level subjects

Users can:
- select university
- select faculty

---

## Result System

Show:
- calculated score
- minimum historical score
- score gap
- admission chance
- yearly trends

---

## Charts

Display:
- 5-year score trends
- score position
- competitiveness trend

Use Recharts.

---

# Dynamic Calculator System

Each faculty can define different:
- subjects
- weights
- score formulas
- exam routes

The calculator UI must render dynamically from database configuration.

Do NOT hardcode:
- subjects
- weights
- formulas

---

# Database Requirements

## Tables

### faculties
Stores faculty/program information.

### tcas_scores
Stores yearly historical scores.

### faculty_requirements
Stores calculator configuration.

Example:
- TGAT = 20%
- A-Level Math = 30%

---

# Current Analyze Flow

User
→ Select university
→ Select faculty
→ Load faculty requirements
→ Render dynamic form
→ Input scores
→ Calculate weighted score
→ Compare with historical scores
→ Show prediction result

---

# Tasks To Build

## Phase 1 — Real Data

- import TCAS64-69 CSV
- normalize faculty names
- normalize university names
- generate unique faculty slugs

---

## Phase 2 — Dynamic Calculator

- create faculty_requirements table
- fetch calculator config from DB
- render dynamic subject inputs
- support different exam routes

---

## Phase 3 — Prediction Engine

Build:
- score gap analysis
- percentile estimation
- competitiveness index
- safer faculty suggestions

---

## Phase 4 — Prediction History

Save:
- user score
- selected faculty
- prediction result
- timestamp

Requires authentication.

---

## Phase 5 — Dashboard Integration

Users can:
- view previous analyses
- compare faculties
- save favorite faculties

---

## Phase 6 — SEO Pages

Create:
- /faculty/[slug]
- /university/[slug]
- /scores/[facultySlug]

Display:
- historical scores
- trends
- competitiveness
- related faculties

---

# Important Rules

Never:
- guarantee admission
- hardcode calculation logic
- fake statistics

Always:
- use estimate-based wording
- load calculator config dynamically
- preserve historical accuracy

---

# Future Improvements

Possible future features:
- AI advisor
- faculty comparison
- score simulation
- ranking system
- personalized recommendations
- admission strategy suggestions