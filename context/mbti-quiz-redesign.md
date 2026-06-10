# MBTI Quiz — Analysis & Redesign Memory

**Date:** 2026-06-09
**Status:** Analysis complete · Awaiting implementation decision
**Author:** Design discussion log

---

## 1. ภาพรวม

ระบบ MBTI quiz ปัจจุบัน (28 ข้อ + 5-point Likert + 2 contrasting options) ทำงานได้และ test ผ่านครบ แต่มีจุดอ่อนเชิง measurement & UX ที่ควรปรับ บันทึกนี้สรุป **(a) จุดอ่อนทั้งหมด** + **(b) 3 แนวทาง redesign** + **(c) decision ที่ค้างไว้**

---

## 2. จุดอ่อนของระบบปัจจุบัน

### 2.1 Item Design (คำถาม)

| # | ปัญหา | ตัวอย่าง |
|---|---|---|
| 1.1 | **Transparent items** — เดาออกว่าตอบยังไงจะเป็น type ไหน | "ระบายกับเพื่อน vs อยู่คนเดียว" → ใครๆ ก็รู้ว่าซ้าย = E |
| 1.2 | **Social desirability bias** — คำตอบที่ "ดูดีกว่า" | "ตรงไปตรงมา" vs "คำนึงความรู้สึก" → คนเลือก F บ่อย |
| 1.3 | **Forced dichotomy** — 2 ขั้วราวกับตรงข้าม แต่จริงๆ ไม่ใช่ | คนๆ หนึ่งอาจมี "พลังจากกลุ่ม" + "ต้องเวลาคนเดียว" พร้อมกัน |
| 1.4 | **Same 28 every session** — gamification ได้ | retake ครั้งที่ 2 จำได้ |
| 1.5 | **Cultural context bias** — assume urban Thai student | "ไปทริปกับเพื่อน" — นักเรียน ตจว. ตอบยาก |
| 1.6 | **Reverse ratio ต่ำ** 8/28 (29%) | pattern answering ยังเล็ดลอด |
| 1.7 | **Item weights ไม่ได้ tune** | 1.0–1.2 = editorial guess ไม่มี IRT calibration |

### 2.2 Scale Design (5-point Likert)

| # | ปัญหา |
|---|---|
| 2.1 | **Symmetric assumption** — strongly A vs strongly B สมมุติ cognitive distance เท่ากัน (จริงๆ ไม่เท่า) |
| 2.2 | **Neutral abuse** — 3 = ทั้ง "ไม่แน่ใจ" + "เป็นทั้งสอง" + "ไม่อยากตอบ" → noise |
| 2.3 | **No anchor calibration** — "เห็นด้วยที่สุด" ความหมายต่างกันในแต่ละคน |
| 2.4 | **Response style bias** — Likert บางคนชอบใช้ middle, บางคนชอบ extreme |

### 2.3 Adaptive Logic

| # | ปัญหา |
|---|---|
| 3.1 | **Early-finish เร็วเกิน** — 75% conf × 3 q/dim = บางคนจบที่ ~12-13 ข้อ → unreliable |
| 3.2 | **Lowest-confidence picking** — เลือกแค่ dim ไม่ได้เลือก *คำถาม* ที่ให้ information สูงสุด (ไม่ใช่ CAT จริง) |
| 3.3 | **ไม่มี reliability check** — ไม่ทดสอบ consistency ภายใน session |
| 3.4 | **Confidence ≠ accuracy** — conf 75% บอกแค่มั่นใจ pole ไหน ไม่ได้บอกว่า type ถูก |

### 2.4 UX & Output

| # | ปัญหา |
|---|---|
| 4.1 | **Type instability** — score 51% J vs 95% J → ผลลัพธ์เดียวกัน (XXTJ) สูญข้อมูล |
| 4.2 | **Edge case 50/50** — random tie-break (`>=`) → คนที่ J=P ได้ J เสมอ ไม่บอกว่า "edge" |
| 4.3 | **No "why this question"** — click-through ไม่ engaged |
| 4.4 | **Reverse confuses** — "ทำไมถามคล้ายเดิม?" |
| 4.5 | **No partial save** — anonymous user หาย session = หายหมด |
| 4.6 | **Career/faculty mapping** — editorial mapping ไม่ใช่ data-driven |
| 4.7 | **Single quiz attempt** — ไม่มี retest reliability score |

### 2.5 MBTI Fundamental Concerns

- **Validity ต่ำในวงการ academia** — type binary สูญข้อมูลเชิงต่อเนื่อง
- Big Five / HEXACO มี predictive power สูงกว่า แต่ MBTI viral กว่า
- ต้องตัดสินใจว่าจะใช้ MBTI เป็น core หรือ entry point

---

## 3. แนวทาง Redesign — 3 ทาง

### 🅰️ ทาง A: "Sharpened MBTI" (Iterative)

> เพิ่มความเที่ยงโดยไม่เปลี่ยน paradigm

1. **Item Pool ขยาย 28 → 60** + stratified random 24/session
2. **Reverse ratio 50%** (จาก 29%)
3. **4-point Likert** (no neutral) + ปุ่ม "ข้าม" แยก
4. **Show score % แทน type letter** — "I 73% · N 60% · F 51% · J 85%"
5. **Calibration question** แรก (mood warm-up)

**Effort:** 2-3 วัน · **Risk:** ต่ำ

### 🅱️ ทาง B: "MBTI + Big Five Hybrid"

> Big Five = measurement core, MBTI = brand layer

1. **30-40 ข้อ Big Five (mini IPIP)**
2. **Show 5 axes** + MBTI letter เป็น "archetype"
3. **Faculty matching data-driven** (Conscientiousness สูง → medicine/engineering)
4. **Reduce social desirability** ผ่าน items ที่ less obvious

**Effort:** 5-7 วัน · **Risk:** กลาง

### 🅲 ทาง C: "Forced-Choice Tournament"

> ไม่ใช่ Likert — ใช้ pairwise comparison + swipe

1. **Forced-choice items** (ipsative scoring)
2. **Swipe gesture** แทน click (Tinder-like)
3. **"Why" reveal** ระหว่างเล่น (micro-feedback)
4. **Faculty pairwise** ตอนท้าย

**Effort:** 7-10 วัน · **Risk:** สูง

### Comparison

| มิติ | A | B | C |
|---|---|---|---|
| Validity | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Engagement | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Migration effort | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Faculty mapping | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Brand familiarity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Mobile UX | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Risk | ต่ำ | กลาง | สูง |

---

## 4. ทาง D (NEW) — "Single Statement + 5-dot Likert"

**User chose direction:** เปลี่ยนจาก 2-option (A vs B) → single statement + 5-dot agree scale

### 4.1 Concept

```
เดิม:
  "เวลาที่อยู่กับกลุ่มเพื่อน คุณรู้สึกอย่างไร?
   A. มีพลัง อยากพูดคุยและเชื่อมต่อกับทุกคน
   B. สนุก แต่ต้องการเวลาคนเดียว"

ใหม่:
  "ฉันมีพลังเมื่อได้พูดคุยกับคนหมู่มาก"

  เห็นด้วยที่สุด ● ● ● ● ● ไม่เห็นด้วยเลย
  มากที่สุด  มาก  กลาง  น้อย  น้อยที่สุด
```

### 4.2 ต้องเปลี่ยน DB ไหม?

**❌ ไม่ต้อง** — schema ปัจจุบันรองรับอยู่แล้ว

```prisma
model MBTIQuestion {
  text      String     // ← ใช้เก็บ statement
  optionA   String     // ← ปล่อยว่างหรือใช้คำว่า "เห็นด้วย"
  optionB   String     // ← ปล่อยว่างหรือใช้คำว่า "ไม่เห็นด้วย"
  weight    Float
  isReverse Boolean    // ← ยังจำเป็น (สำคัญกว่าเดิม)
  dimension MBTIDimension
}
```

Scoring engine ทำงานได้เลย เพราะ Likert 1-5 + isReverse คือ pattern ที่รองรับอยู่แล้ว

| Likert | Net | ความหมาย |
|---|---|---|
| 1 = เห็นด้วยที่สุด | +2 | ไป A-pole สุด (เช่น E) |
| 2 = เห็นด้วย | +1 | เอนเอียง A |
| 3 = กลาง | 0 | neutral |
| 4 = ไม่ค่อยเห็นด้วย | -1 | เอนเอียง B |
| 5 = ไม่เห็นด้วยเลย | -2 | ไป B-pole สุด (เช่น I) |

### 4.3 UI Layout ใหม่

```
┌─────────────────────────────────┐
│  ข้อ 12          ━━━━━━░░░ 43% │
│                                  │
│  ● ทำความเข้าใจด้านพลังงาน      │
│                                  │
│  ┌───────────────────────────┐  │
│  │                            │  │
│  │  "ฉันมีพลังเมื่อได้พูดคุย   │  │
│  │   กับคนหมู่มาก"            │  │
│  │                            │  │
│  └───────────────────────────┘  │
│                                  │
│  เห็นด้วย               ไม่เห็นด้วย│
│  ที่สุด                    เลย   │
│   ●━━━●━━━●━━━●━━━●             │
│                                  │
│  [ ← ย้อน ]  [ ถัดไป → ]        │
└─────────────────────────────────┘
```

### 4.4 ประโยชน์ที่ได้

- ✅ อ่าน statement สั้น → ตัดสินใจเร็วกว่า (~ลดเวลา quiz 30-40%)
- ✅ ไม่มี cognitive load จากการเทียบ 2 option ที่อาจไม่ใช่ตรงข้ามจริง
- ✅ Mobile: นิ้วเลื่อน dot ง่าย ไม่ต้องอ่านยาว
- ✅ ดูเป็น scientific มากกว่า (เหมือน Big Five / IPIP มาตรฐาน)
- ✅ ลด complexity: ไม่ต้องใช้ displayFlipped logic อีกแล้ว

### 4.5 ความเสี่ยงและการแก้

| Risk | Mitigation |
|---|---|
| **Reverse items สำคัญกว่าเดิม** — single statement = อ่านน้อยลง = pattern answering ง่ายขึ้น | เพิ่ม reverse ratio 29% → 43% (12/28) |
| **Social desirability สูงขึ้น** — "ฉันใส่ใจคนอื่น" → ทุกคนกดเห็นด้วย | เขียน statement ให้สมดุล มี both pole tone เป็น neutral |
| **Neutral abuse** — 3 = ทุกอย่าง | optionally เพิ่มปุ่ม "ข้าม / ไม่เกี่ยวกับฉัน" แยกออกจาก 3 |

### 4.6 Effort ประเมิน

| งาน | เวลา |
|---|---|
| แก้ MBTIQuiz component (single-statement layout) | 1 ชม. |
| Re-write 28 statements เป็น single-statement format | 1.5 ชม. |
| Update seed script + re-seed DB | 0.5 ชม. |
| Test (UI + scoring consistency) | 1 ชม. |
| **รวม** | **3-4 ชม.** |

---

## 5. Decision Log

### ตัดสินใจแล้ว ✅

- เลือก **ทาง D** (Single Statement + 5-dot Likert)
- ไม่เปลี่ยน DB schema (ทำใน schema ปัจจุบัน)

### Decisions Confirmed ✅ (2026-06-09)

| คำถาม | ตัดสิน |
|---|---|
| **Scale** | **5 dots (มี neutral)** — มากที่สุด · มาก · กลาง · น้อย · น้อยที่สุด |
| **Content** | **เขียน statement ใหม่ทั้ง 28 ข้อ** (ไม่ reuse `optionA` เดิม) |
| **Reverse ratio** | **43% (12/28)** — distribute 3 ข้อ/dim |
| **Schema cleanup** | ไม่ทำตอนนี้ ใช้ field `text`/`optionA`/`optionB` เดิม (ปล่อย optionA="เห็นด้วย", optionB="ไม่เห็นด้วย") |

### Distribution Plan (เพื่อความสมดุล)

| Dim | Total | Standard | Reverse |
|---|---:|---:|---:|
| EI | 7 | 4 | 3 |
| SN | 7 | 4 | 3 |
| TF | 7 | 4 | 3 |
| JP | 7 | 4 | 3 |
| **รวม** | **28** | **16** | **12** |

---

## 6. Action Items (เมื่อเริ่ม implement)

```
[ ] 6.1 Confirm 4 decisions ใน §5
[ ] 6.2 Write 28 single statements (file: scripts/mbti-statements-v2.ts)
[ ] 6.3 Update seed-mbti.ts → push new statements to DB
[ ] 6.4 Refactor MBTIQuiz component:
        - Remove displayFlipped logic
        - Single statement display
        - 5-dot scale (label: มากที่สุด/มาก/กลาง/น้อย/น้อยที่สุด)
        - Keep keyboard shortcuts 1-5
        - Keep "ย้อน" + "ถัดไป" buttons
[ ] 6.5 Update intro screen — explain new format
[ ] 6.6 Test scoring consistency (Playwright + data layer)
[ ] 6.7 Update analytics — new quiz format may need new event
[ ] 6.8 Soft launch / A/B test กับ old version (ถ้ามี toggle)
```

---

## 7. ลำดับ Prioritization

หลังจากทำ **D (Single Statement)** เสร็จ ปัญหาที่ยังเหลือ:

| Original Issue | Status หลัง D |
|---|---|
| 1.1 Transparent items | ⚠️ ยังเหลือ (ทุกระบบ MBTI มี) |
| 1.2 Social desirability | 🟡 บางส่วน (ต้อง careful wording) |
| 1.3 Forced dichotomy | ✅ แก้ |
| 1.4 Same 28 | ⚠️ ยังเหลือ → ทำ A.1 (item pool ขยาย) ต่อ |
| 1.5 Cultural bias | ⚠️ ยังเหลือ → ต้อง user testing |
| 1.6 Reverse ratio | ✅ แก้ (43%) |
| 2.2 Neutral abuse | 🟡 บางส่วน (ถ้าเลือก 4-dot ⇒ ✅) |
| 4.1 Type instability | ⚠️ ยังเหลือ → ทำ "show %" (A.4) ต่อ |
| 4.6 Faculty mapping | ⚠️ ยังเหลือ → ทำ B (Big Five hybrid) ต่อ |

### Roadmap แนะนำ (สั้น → ยาว)

1. ✅ Phase A+B+D (DB connection, cross-feature, shareable) — **DONE**
2. 🚧 **D (Single statement)** — 3-4 ชม. — *next*
3. ⏳ A.1 Item pool ขยาย 28 → 60 + stratified random
4. ⏳ A.4 Show score % แทนแค่ type letter
5. ⏳ B (Big Five hybrid) — ถ้าอยาก validity สูงขึ้น
6. ⏳ Schema cleanup (`statement` field)

---

## 8. ตัวอย่าง Statement (Draft)

ตัวอย่างการเขียน single statements 4 ข้อแรกของแต่ละ dimension เพื่อให้เห็นภาพ:

### EI Dimension (E = +, I = -)

```ts
// Standard items — agree → E
{ statement: "ฉันมีพลังเมื่อได้พูดคุยกับคนหมู่มาก",
  dimension: "EI", isReverse: false, weight: 1.2 }

{ statement: "ฉันชอบแสดงความคิดเห็นต่อหน้าผู้คน",
  dimension: "EI", isReverse: false, weight: 1.0 }

// Reverse items — agree → I
{ statement: "ฉันต้องการเวลาอยู่คนเดียวเพื่อชาร์จพลัง",
  dimension: "EI", isReverse: true, weight: 1.2 }

{ statement: "ฉันคิดทบทวนก่อนพูดมากกว่าพูดออกมาเลย",
  dimension: "EI", isReverse: true, weight: 1.0 }
```

### SN Dimension (S = +, N = -)

```ts
// Standard — agree → S
{ statement: "ฉันเชื่อในสิ่งที่จับต้องและพิสูจน์ได้",
  dimension: "SN", isReverse: false, weight: 1.2 }

// Reverse — agree → N
{ statement: "ฉันชอบคิดถึงความเป็นไปได้ในอนาคตมากกว่าปัจจุบัน",
  dimension: "SN", isReverse: true, weight: 1.2 }
```

### TF Dimension (T = +, F = -)

```ts
// Standard — agree → T
{ statement: "ฉันตัดสินใจด้วยตรรกะมากกว่าความรู้สึก",
  dimension: "TF", isReverse: false, weight: 1.2 }

// Reverse — agree → F
{ statement: "ฉันให้ความสำคัญกับความรู้สึกของทุกคนในการตัดสินใจ",
  dimension: "TF", isReverse: true, weight: 1.2 }
```

### JP Dimension (J = +, P = -)

```ts
// Standard — agree → J
{ statement: "ฉันชอบวางแผนล่วงหน้าและทำตามตาราง",
  dimension: "JP", isReverse: false, weight: 1.2 }

// Reverse — agree → P
{ statement: "ฉันยืดหยุ่นและเปลี่ยนแผนได้ตลอด",
  dimension: "JP", isReverse: true, weight: 1.2 }
```

---

## 9. References & Related Files

- Current quiz: `src/features/mbti/components/mbti-quiz.tsx`
- Current questions: `src/data/mbti-questions.ts` + `scripts/seed-mbti.ts`
- Scoring engine: `src/utils/mbti.ts` (no changes needed for D)
- Type definitions: `src/types/mbti.ts`
- DB schema: `prisma/schema.prisma` → `MBTIQuestion` model
- Related history log: `context/History_log/2026-06-09.md`
- DB audit: `context/mbti-audit.md`

---

## 10. หมายเหตุ

- เอกสารนี้เป็น living document — อัปเดตเมื่อ design เปลี่ยน
- ก่อน implement ต้อง confirm 4 decisions ใน §5
- ไม่จำเป็นต้องทำตามลำดับ — แต่ละทาง (A/B/C/D) อิสระจากกัน ทำ D ก่อนได้เลย
