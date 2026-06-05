---
timestamp: 2026-06-05T06-20-13Z
slug: src-app-analyze-page-tsx
---
## Design Health Score
| # | Heuristic | Score |
|---|-----------|-------|
| 1 | Visibility | 4 |
| 2 | Match Real World | 4 |
| 3 | User Control | 2 |
| 4 | Consistency | 3 |
| 5 | Error Prevention | 3 |
| 6 | Recognition | 3 |
| 7 | Flexibility | 2 |
| 8 | Aesthetic | 3 |
| 9 | Error Recovery | 3 |
| 10 | Help/Docs | 2 |
| Total | 29/40 | Good |

## Priority Issues
- [P1] No form state persistence — biggest friction
- [P2] Empty result placeholder dump on mobile (280px wasted)
- [P2] Duplicate TCAS badge + no subject code hints
- [P3] AlertTriangle on info-level no-weights message
- [P3] Duplicate mytcas disclaimer (header + footer)

## False Positives
- analyze-form:190 — combobox data-[highlighted] correct pairing
- result-card:122 — button hover state correct pairing
