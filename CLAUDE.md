# Knowledge Base Structure

This repository uses markdown files as a project knowledge base.

Before making product, UX, design, architecture, or database decisions, read the relevant documents.

---

## Source of Truth (Highest Priority)

### PRODUCT.md
- Product vision, target users, goals, brand personality, success metrics
- Read when: building features, making product decisions, prioritizing functionality

### UX.md
- User psychology, user journeys, interaction principles, loading/empty states
- Read when: designing flows, building forms, creating onboarding

### DESIGN.md
- Visual language, colors, typography, components, spacing, elevation
- Read when: creating UI, styling components, building layouts

---

## Project Context (`context/`)

### context/architecture.md
- System architecture, folder structure, technical decisions
- Read when: refactoring, designing backend/frontend structure

### context/business-rules.md
- TCAS rules, admission logic, score calculation, prediction rules
- Read when: implementing business logic, working with score analysis

### context/database.md
- Database history, schema changes, migration records
- Read when: modifying Prisma schema, database migrations
- **Must update after any database-related work**

### context/planning.md
- Current plans, upcoming work, development priorities
- Read when: planning new work, evaluating priorities

### context/progress.md
- Current project status, completed work, active work
- Read when: continuing existing tasks, checking implementation status

---

## Feature Specifications (`context/features/`)

Each file defines a specific feature (e.g. `history-score.md`, `tcas-analysis.md`, `mbti.md`).

Read before creating, modifying, or refactoring any feature. **Feature specs override generic assumptions.**

---

## Roadmaps (`context/roadmap/`)

Long-term planning only. Do not treat roadmap items as implemented features.

---

## Development Logs (`context/History_log/`)

Daily implementation logs and development decisions.
Use when: understanding previous work, investigating regressions.

---

## Document Priority Order

When documents conflict, follow the higher-priority document:

1. PRODUCT.md
2. UX.md
3. DESIGN.md
4. Feature Specifications
5. Business Rules
6. Architecture
7. Roadmap
8. CLAUDE.md

---

## Before Implementing Features

1. Understand the user request
2. Read relevant documentation
3. State assumptions if necessary
4. Create the smallest valid solution
5. Verify success criteria
6. Update required logs

Do not make assumptions when documentation already exists.
