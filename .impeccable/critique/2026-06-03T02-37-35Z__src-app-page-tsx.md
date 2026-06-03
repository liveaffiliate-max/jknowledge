---
target: src/app/page.tsx
total_score: 28
p0_count: 0
p1_count: 2
timestamp: 2026-06-03T02-37-35Z
slug: src-app-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Header nav แสดง location แต่ไม่มี loading states |
| 2 | Match System / Real World | 4 | ภาษาไทยถูกต้อง คำศัพท์ TCAS ตรงกับที่นักเรียนใช้ |
| 3 | User Control and Freedom | 3 | หน้า static ไม่มีกับดัก แต่ 2 CTAs ชี้ /analyze เหมือนกัน |
| 4 | Consistency and Standards | 3 | Button style consistent แต่ badges ไม่ถูก distinguish |
| 5 | Error Prevention | 3 | ไม่มี forms ไม่มีอะไรผิดพลาดได้ |
| 6 | Recognition Rather Than Recall | 3 | Feature labels ชัดเจน แต่ 2/3 cards link เดียวกัน |
| 7 | Flexibility and Efficiency | 2 | ไม่มี keyboard shortcuts |
| 8 | Aesthetic and Minimalist Design | 2 | Identical card grid (absolute ban), generic structure |
| 9 | Error Recovery | 3 | ไม่มี error paths |
| 10 | Help and Documentation | 2 | "วิธีใช้งาน" 3 steps สั้นมาก ไม่มี trust signals |
| **Total** | | **28/40** | **Good** |

## Priority Issues

- [P1] Identical Card Grid — 3 cards เหมือนกันทุกประการ (absolute ban violation)
- [P1] Text Contrast Failure — text-gray-500 บน bg-gray-50 และ hover bg-green-50 ล้มเหลว AA
- [P2] Em dash ใน hero subtitle
- [P2] h1 ขาด text-wrap:balance, green span contrast risk บน green gradient
- [P3] Section header copy generic ("ทุกอย่างที่ต้องการ ในที่เดียว")
