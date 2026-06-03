# Knowledge Base Structure

This repository uses markdown files as a project knowledge base.

Before making product, UX, design, architecture, or database decisions, read the relevant documents.

---

## Source of Truth (Highest Priority)

These files define the long-term direction of the project.

### PRODUCT.md

Purpose:

* Product vision
* Target users
* Product goals
* Brand personality
* Product principles
* Success metrics

Read when:

* Building new features
* Making product decisions
* Prioritizing functionality

---

### UX.md

Purpose:

* User psychology
* User journeys
* Interaction principles
* Information hierarchy
* Loading states
* Empty states
* Decision-making flows

Read when:

* Designing flows
* Building forms
* Creating onboarding
* Designing analysis experiences

---

### DESIGN.md

Purpose:

* Visual language
* Colors
* Typography
* Components
* Spacing
* Elevation
* Design constraints

Read when:

* Creating UI
* Styling components
* Building layouts
* Designing charts

---

## Project Context

Located in:

context/

These documents evolve frequently and contain implementation details.

---

### context/architecture.md

Contains:

* System architecture
* Folder structure
* Technical decisions
* Application boundaries

Read when:

* Refactoring
* Designing backend/frontend structure
* Creating new modules

---

### context/business-rules.md

Contains:

* TCAS rules
* Admission logic
* Score calculation rules
* Prediction rules

Read when:

* Implementing business logic
* Working with score analysis
* Building prediction systems

---

### context/database.md

Contains:

* Database history
* Schema changes
* Migration records
* Data decisions

Read when:

* Modifying Prisma schema
* Database migrations
* Data modeling

Must update after any database-related work.

---

### context/planning.md

Contains:

* Current plans
* Upcoming work
* Development priorities

Read when:

* Planning new work
* Evaluating priorities

---

### context/progress.md

Contains:

* Current project status
* Completed work
* Active work

Read when:

* Continuing existing tasks
* Checking implementation status

---

## Feature Specifications

Located in:

context/features/

Each file defines a specific feature.

Examples:

* history-score.md
* tcas-analysis.md
* mbti.md
* mbti-core.md

Read before:

* Creating a feature
* Modifying a feature
* Refactoring feature logic

Feature specs override generic assumptions.

---

## Roadmaps

Located in:

context/roadmap/

Contains:

* MVP roadmap
* Phase roadmap
* Future plans

Used for long-term planning only.

Do not treat roadmap items as implemented features.

---

## Development Logs

Located in:

context/History_log/

Contains:

* Daily implementation logs
* Session history
* Development decisions

Use when:

* Understanding previous work
* Investigating regressions
* Reconstructing implementation history

---

# Document Priority Order

When documents conflict:

1. PRODUCT.md
2. UX.md
3. DESIGN.md
4. Feature Specification
5. Business Rules
6. Architecture
7. Roadmap
8. CLAUDE.md

Follow the higher-priority document.
