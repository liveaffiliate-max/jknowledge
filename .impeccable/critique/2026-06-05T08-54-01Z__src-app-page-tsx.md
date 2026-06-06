---
timestamp: 2026-06-05T08-54-01Z
slug: src-app-page-tsx
---
## Homepage (mobile)
## Score
- 32/40 (Good — hero has dead space, missing proof above fold)

## Priority Issues
- [P1] Hero 30-40% empty vertical space above badge on mobile (justify-center + 100dvh)
- [P2] 'ไม่ต้อง login' repeats twice in subtitle + note
- [P2] No data preview / proof above fold (stats hidden in next section)
- [P3] Subtitle text-wrap: balance breaks 'ติด/ที่ไหนได้บ้าง' awkwardly
- [P3] CTAs visually equal weight on mobile (stacked full-width)

## False Positives
- detector x3 gray-on-color: Journey card description text NOT actually on bg-green-100

## Strengths
- Forest Ink discipline tight (green only on interactive + positive)
- Outcome-framing H1 per PRODUCT.md
- clamp() H1 sizing fixed prior overflow bug
- dvh prevents mobile layout shift
- Bottom nav with active state per mobile-native pattern
