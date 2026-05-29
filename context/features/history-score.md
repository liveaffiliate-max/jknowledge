# Historical Scores Roadmap

## Goal

Build a scalable TCAS historical score platform.

Focus on:
- historical score data
- trend visualization
- SEO pages
- mobile-first experience

Avoid building complex prediction systems too early.

---

# Phase 1 — Core Scores System

## Goal

Build the basic historical score platform.

---

## Features

### Scores Homepage

Route:

```txt
/scores
```

Displays:
- university logos
- university names
- search bar

---

### University Page

Route:

```txt
/scores/[universitySlug]
```

Displays:
- university information
- faculty list
- latest scores
- seat counts

---

### Faculty Score Page

Route:

```txt
/scores/[facultySlug]
```

Displays:
- faculty information
- historical scores
- min/max/avg scores
- seats
- trend charts

---

## Database Tasks

- create universities table
- create faculties table
- create tcas_scores table
- generate clean slugs
- normalize university names
- normalize faculty names

---

## UI Tasks

Build:
- university grid
- faculty list
- score table
- stat cards
- mobile layout

---

## Chart Tasks

Use Recharts.

Build:
- score trend chart
- seats trend chart

---

# Phase 2 — Real TCAS Data Import

## Goal

Import real historical data from TCAS files.

---

## Tasks

- import TCAS64-69 CSV
- clean duplicated faculties
- normalize program names
- normalize exam routes
- validate score accuracy

---

## Important Rules

Never:
- overwrite raw data
- trust inconsistent naming directly

Always:
- preserve raw source data
- normalize separately

---

# Phase 3 — Search System

## Goal

Allow users to quickly find faculties.

---

## Features

Build:
- university search
- faculty search
- quick navigation

---

## UI

Add:
- sticky search bar
- autocomplete suggestions

---

# Phase 4 — SEO Optimization

## Goal

Turn faculty pages into SEO landing pages.

---

## Tasks

Add:
- metadata generation
- structured titles
- SEO descriptions
- OpenGraph support

---

## Important Routes

```txt
/scores/[facultySlug]
/scores/[universitySlug]
```

---

# Phase 5 — Historical Analytics

## Goal

Add simple analytics and trends.

---

## Features

Display:
- score increases/decreases
- seat changes
- trend indicators

Examples:
- ↑ +3.2 from previous year
- ↓ seats reduced

---

# Phase 6 — Dynamic Calculator (Future)

## Goal

Build a configurable TCAS calculator system.

---

## Features

Support:
- dynamic score weights
- faculty requirements
- exam routes
- weighted calculations

---

## Important Notes

Calculator rules should:
- come from database
- not be hardcoded
- support yearly changes

---

# Phase 7 — Prediction System (Future)

## Goal

Estimate admission chances.

---

## Features

Build:
- score gap analysis
- competitiveness indicators
- percentile estimation
- safer faculty suggestions

---

# Phase 8 — User System

## Goal

Allow users to save and track results.

---

## Features

Build:
- prediction history
- favorite faculties
- saved comparisons

Requires:
- Clerk authentication

---

# MVP Priorities

Focus only on:

1. scores pages
2. historical tables
3. trend charts
4. search
5. SEO

Avoid:
- AI advisor
- compare system
- advanced prediction
- ranking systems

until core data is stable.

---

# Architecture Principles

Always:
- use normalized database structure
- use dynamic routing
- keep data scalable
- separate raw/imported data
- prioritize mobile UX

Never:
- hardcode score data
- hardcode calculator logic
- mix raw data with normalized data