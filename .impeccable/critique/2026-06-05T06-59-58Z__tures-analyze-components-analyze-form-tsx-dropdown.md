---
timestamp: 2026-06-05T06-59-58Z
slug: tures-analyze-components-analyze-form-tsx-dropdown
---
## Dropdowns in /analyze

## Score
- Total 25/40 (Acceptable, mobile/desktop asymmetry blocks higher)

## Priority Issues
- [P1] Desktop faculty native select has no search (150+ options scroll)
- [P2] University select flat list 60+ items, no region grouping
- [P2] Faculty label dense ' · ' separators, no visual hierarchy
- [P3] Loading state no spinner inside input
- [P3] Empty state generic, no Thai abbreviation mapping

## False Positives
- None — focused critique without detector run

## Strengths
- Base UI Combobox + Portal z-50 = correct affordance
- Context-aware placeholder (3 states)
- Disabled cascade prevents premature interaction
- Brand-consistent highlighted state
