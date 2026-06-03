---
target: src/app/analyze/page.tsx
total_score: 24
p0_count: 0
p1_count: 2
timestamp: 2026-06-03T08-35-28Z
slug: src-app-analyze-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading states ครบทุก async op แต่ step bar ไม่รู้สึก live พอ |
| 2 | Match System / Real World | 3 | ภาษาไทยดี แต่ "สัดส่วน" และ TGAT/TPAT ไม่มีคำอธิบายสำหรับ newcomer |
| 3 | User Control and Freedom | 2 | ไม่มีปุ่ม reset / "ลองคณะอื่น" — comparison flow ไม่ชัด |
| 4 | Consistency and Standards | 3 | StepBadge มี 2 implementations ที่ active/done state ต่างกัน |
| 5 | Error Prevention | 3 | Submit disabled จนกว่าจะพร้อม — ดี แต่ number input ไม่ป้องกัน input > 100 |
| 6 | Recognition Rather Than Recall | 2 | Faculty dropdown 100+ items ไม่มี search — ต้องจำชื่อคณะเอง |
| 7 | Flexibility and Efficiency | 2 | ไม่มี keyboard shortcuts, URL state, หรือ multi-faculty comparison |
| 8 | Aesthetic and Minimalist Design | 3 | สะอาด แต่ red progress bar ระหว่างกรอก + empty result placeholder ใหญ่เกิน |
| 9 | Error Recovery | 2 | Error messages ชัดเจน แต่ "ไม่พบข้อมูลคณะ" ไม่มี next step |
| 10 | Help and Documentation | 1 | ไม่มี tooltip/คำอธิบาย TGAT/TPAT/A-Level หรือวิธีคำนวณ chance |
| **Total** | | **24/40** | **Acceptable** |

## Anti-Patterns Verdict

ไม่ถือว่า AI slop — Forest Ink system ใช้สม่ำเสมอ ไม่มี gradient text, glassmorphism, หรือ identical card grids ที่ forbidden Detector: [] (clean)

## Overall Impression

Architecture ถูกต้อง — progressive disclosure + live score ทำงานได้ดี ปัญหาหลักอยู่ที่ faculty selection (native select กับ 100+ options) และ red feedback ระหว่าง input ที่ขัดกับ product promise โดยตรง

## What's Working

1. Live weighted score calculation — interaction ที่ดีที่สุดในหน้า
2. Progressive disclosure — Step 2 และ submit ปรากฎเฉพาะเมื่อพร้อม
3. estMinScore indicator แบบ real-time บน total card

## Priority Issues

### [P1] Red progress bar ขณะกรอกคะแนน — violation ของ design system
weighted-inputs.tsx:252 bg-red-400 เมื่อ total 0–49 ขัด No Red Alarm Rule ใน DESIGN.md Fix: ใช้ bg-green-200/bg-gray-300 แทน

### [P1] Faculty dropdown: native select กับ 100+ options
analyze-form.tsx:330-360 ไม่มี search/filter — major friction สำหรับ mobile users Fix: combobox จาก @base-ui/react

### [P2] text-[10px] บน score labels ใน result card
result-card.tsx:61 ต่ำกว่า minimum 12px สำหรับ Thai text Fix: เปลี่ยนเป็น text-xs

### [P2] ไม่มี path ชัดเจนสำหรับ compare หลายคณะ
ไม่มี "ลองคณะอื่น" CTA หลังเห็นผล Fix: เพิ่ม reset/compare action ใน ResultCard

### [P2] Missing label associations บน form fields
analyze-form.tsx:318 select ไม่มี label, weighted-inputs.tsx:66 input ไม่มี aria-label Fix: sr-only labels

## Persona Red Flags

Jordan: faculty labels ซับซ้อน, TGAT/TPAT ไม่มีคำอธิบาย, red bar สร้าง anxiety, ไม่มี CTA หลัง result
Casey: iOS picker 200+ items, ไม่มี state persistence, submit อยู่ล่าง
Sam: select ไม่มี label, score inputs ไม่มี aria-label, color-only indicators

## Minor Observations

- score-position-bar labels อาจ overflow บน narrow mobile
- StepBadge duplicate implementation ใน analyze-form.tsx
- faculty.program ไม่ guard empty string
- text-gray-400 บน page.tsx:43 contrast ~3.1:1 ต่ำกว่า AA
