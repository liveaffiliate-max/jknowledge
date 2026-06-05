---
timestamp: 2026-06-05T03-54-08Z
slug: src-app-page-tsx
---
## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | CountUp/FadeIn มีชีวิต แต่ไม่แสดง auth state |
| 2 | Match System / Real World | 4 | ภาษาตรง, TCAS Journey ตรง mental model |
| 3 | User Control and Freedom | 3 | CTA ชัด แต่ไม่มี shortcut returning user |
| 4 | Consistency and Standards | 3 | Hover cards สม่ำเสมอ แต่ chips ดู clickable แต่คลิกไม่ได้ |
| 5 | Error Prevention | 3 | 'ไม่ต้อง login' ตัดความกังวลได้ดี |
| 6 | Recognition Rather Than Recall | 3 | Steps อธิบายตัวเองได้ |
| 7 | Flexibility and Efficiency | 2 | ไม่มี shortcut returning user, chips ไม่ linkable |
| 8 | Aesthetic and Minimalist Design | 3 | Hero clean มาก แต่ stats+chips redundant กับ hero |
| 9 | Error Recovery | 3 | Landing page N/A |
| 10 | Help and Documentation | 2 | ไม่มีคำอธิบาย TCAS newcomer |
| Total | | 29/40 | Good |

## Priority Issues
- [P1] FadeIn hides content after hydration (opacity:0 flash, SEO/OG invisible)
- [P2] University chips false affordance — span styled as pill, not navigable
- [P2] Gray-on-green hover (detector x3: lines 147, 165, 183)
- [P3] H1 feature-framing not outcome-framing
- [P3] Subtitle br tag instead of text-wrap balance
