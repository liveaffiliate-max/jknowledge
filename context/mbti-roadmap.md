# MBTI Feature — Roadmap & Plan

**Last updated:** 2026-06-10
**Status of base feature:** ✅ shipped (A+B+D + Path D + P1 + P2 + P3 committed)
**Next milestone:** P5 — Dynamic Faculty Re-ranking

---

## 0. Snapshot ปัจจุบัน

| ระดับ | สถานะ |
|---|---|
| Quiz format | Single statement + 5-dot Likert |
| Item pool | 60 ข้อ (15/dim, 8 std + 7 rev) |
| Session pick | Deterministic stratified 24/60 ต่อ user |
| Adaptive next-question | เลือก dim ที่ confidence ต่ำสุด |
| Result display | Type letter + 4 dim % + edge band marker |
| Cross-feature | /analyze badge · dashboard hero · /result/[id] share |
| Faculty mapping | **Rule-based static** (FacultyMBTIMatch 320 rows seeded) |
| Schema | clean — statement field, no legacy optionA/B |

---

## 1. P5 — Dynamic Faculty Re-ranking ⭐ NEXT

**Goal:** ทุก user เห็นคณะที่ต่างกันตาม signal ของตัวเอง (ไม่ใช่แค่ MBTI type)

**Effort:** ~1 วัน · **Risk:** ต่ำ · **ไม่แตะ DB schema**

### 1.1 Scoring formula
```
finalScore = 0.55 · mbtiAffinity      // FacultyMBTIMatch.score (เดิม)
           + 0.20 · scoreReachability  // คะแนนของ user vs cutoff
           + 0.15 · predictionOverlap  // user เคย analyze คณะนี้/คล้ายไหม
           + 0.10 · regionProximity    // จังหวัด/ภูมิภาคของ user
```

น้ำหนัก initial = editorial guess. ขั้นถัดไป (เมื่อมี data) → tune ด้วย click-through rate

### 1.2 Edge-aware mix
- ถ้า user มี dim ใด edge (`pct ≤ 53`) → mix top คณะของ "เพื่อนบ้าน type" เข้ามา 30%
- ESTJ ที่ T=51% → 70% ESTJ list + 30% ESFJ list interleave

### 1.3 Reason templates ที่เปลี่ยนตามผู้ใช้
| Trigger | Reason |
|---|---|
| คะแนน user ≥ cutoff - 3 | "คะแนนคุณใกล้แตะ cutoff คณะนี้แล้ว" |
| คณะอยู่ในจังหวัดของ user | "อยู่ในจังหวัดของคุณ + ตรงกับบุคลิก" |
| user เคย predict คณะนี้ | "เคย analyze ไว้ — มาดู match score" |
| MBTI score สูง (no edge) | (เดิม) "ทักษะหลักของสายนี้" |

### 1.4 Steps
- [ ] **5.1** สร้าง `server/mbti-personalized.ts` — `rankFacultiesForUser(type, userContext)`
- [ ] **5.2** Wire `MBTIFacultyList` ให้รับ optional `userContext` (region, scores, history)
- [ ] **5.3** Server action `getPersonalizedFacultiesForUser(type)` — รวบรวม context จาก Clerk + Prisma
- [ ] **5.4** Edge-aware mix logic + reason builder
- [ ] **5.5** Test: snapshot ระหว่าง 3 fake users (ต่าง region, ต่าง score, ต่าง history) ต้อง ranking ต่างกัน
- [ ] **5.6** Analytics: event `mbti_faculty_personalized_reason` (track reason ที่แสดง)

### 1.5 Files ที่จะแตะ
- NEW: `src/server/mbti-personalized.ts`
- NEW: `src/features/mbti/actions/get-personalized-faculties.ts`
- MODIFY: `src/features/mbti/components/mbti-faculty-list.tsx` (รับ context)
- MODIFY: `src/server/mbti-queries.ts` (เพิ่ม userContext-aware path)
- NEW: `scripts/test-personalized-ranking.ts`

---

## 2. P6 — Quiz Result Persistence Per User ⭐ Quick win

**Goal:** user signed-in เห็นประวัติ MBTI ของตัวเอง + เปรียบเทียบ retake

**Effort:** ~3-4 ชม. · **Risk:** ต่ำ

### 2.1 ที่ต้องทำ
- [ ] เพิ่ม UI ใน dashboard "ประวัติแบบทดสอบของฉัน" (list MBTIResult ของ user)
- [ ] Diff view: result ครั้งก่อน vs ครั้งนี้ — แสดง dim ที่เปลี่ยน
- [ ] CTA "ลองทำใหม่" + เก็บประวัติทุกครั้ง
- [ ] Privacy: ลบประวัติได้ใน /profile

### 2.2 หมายเหตุ
- `MBTIResult` table มีอยู่แล้ว — แค่ build UI/query
- เป็นการ enable ใช้ประโยชน์จาก deterministic seed (P2) ได้เต็มที่

---

## 3. P7 — Admin CMS for Statements (Optional)

**Goal:** แก้คำถามได้โดยไม่ต้อง redeploy

**Effort:** ~1-2 วัน · **Risk:** กลาง · **ROI:** ต่ำ (กว่าจะแก้บ่อย)

### 3.1 ที่ต้องทำ
- [ ] Route `/admin/mbti-questions` (gate ด้วย Clerk role)
- [ ] CRUD UI สำหรับ statement / weight / isReverse / active
- [ ] Soft-deactivate (active=false) แทน hard delete
- [ ] Audit trail: ใครแก้เมื่อไหร่
- [ ] Re-fetch cache invalidation

**Recommendation:** ทำเมื่อมี content team หรือคำถามต้อง iterate บ่อย ตอนนี้ developer แก้ไฟล์ TS เร็วกว่า

---

## 4. P8 — CAT-light (Information-Gain Picker)

**Goal:** เลือก *question* ที่ให้ information สูงสุด (ไม่ใช่แค่ *dim*)

**Effort:** ~2-3 วัน · **Risk:** กลาง · **ต้องการ data ก่อน**

### 4.1 ที่ต้องทำ
- [ ] เก็บ user response stats per question (response time, choice distribution)
- [ ] คำนวณ Item Information Function แบบ approximate
- [ ] `pickNextQuestion` ใช้ info gain + current uncertainty
- [ ] A/B test vs current adaptive

**Prerequisite:** ต้องมี ≥ 200 completed sessions ก่อน — รอเก็บ data

---

## 5. P9 — Big Five Hybrid (Heavy)

**Goal:** เปลี่ยน measurement core จาก MBTI dichotomy → Big Five 5-axis continuous

**Effort:** 5-7 วัน · **Risk:** สูง · **ROI:** สูง (academic validity)

### 5.1 Scope
- [ ] 30-40 ข้อ Big Five (mini IPIP)
- [ ] แสดง 5 axes + map เป็น MBTI archetype layer (brand)
- [ ] Faculty matching data-driven (Conscientiousness สูง → med/eng)
- [ ] Migration: เก็บ old MBTI data ไว้ + flag rounds

**Recommendation:** เก็บไว้รอ user feedback จาก v3 พอสมควรก่อน ถ้า user รู้สึก MBTI พอแล้ว = ไม่ต้องทำ

---

## 6. P10 — IRT Calibration (Data-Driven Weights)

**Goal:** weights ที่ถูก calibrate จาก data จริง แทน editorial guess

**Effort:** ~3-5 วัน · **Risk:** กลาง · **Prerequisite:** ≥ 500 sessions

### 6.1 ที่ต้องทำ
- [ ] Export response data → R/Python notebook
- [ ] Fit 2PL IRT model (discrimination + difficulty)
- [ ] Update weight + add `difficulty` field
- [ ] Validate: split-half reliability ≥ 0.7

**Prerequisite:** ต้องมี data ก่อน — รอเก็บ

---

## 7. Priority Order (Recommended)

```
NOW
 ↓
P5 Dynamic Faculty Re-ranking      (1 วัน, low risk, immediate UX win)
 ↓
P6 Quiz Result Persistence         (3-4 ชม, quick win, uses existing schema)
 ↓
─── ship to users + collect data ───
 ↓
[wait ~2 weeks of usage]
 ↓
P10 IRT Calibration                (data-dependent)
P8  CAT-light                      (data-dependent)
 ↓
P9 Big Five Hybrid                 (only if MBTI feels insufficient)
 ↓
P7 Admin CMS                       (only when content iteration is bottleneck)
```

---

## 8. Out of scope (decisions logged)

- ❌ Pure random quiz subset — chose deterministic for retake comparability
- ❌ 4-point Likert (no neutral) — keep 5-point with "ก้ำกึ่ง" edge marker instead
- ❌ Forced-choice tournament (Path C) — too risky for current scope
- ❌ Real-time multi-user comparison — privacy concern + low value vs effort

---

## 9. Open questions

1. **น้ำหนัก 55/20/15/10** ใน P5 ถูกต้องไหม? → tune ด้วย click-through rate หลัง ship
2. **Region detection** ใช้ data ไหน? → จาก Clerk profile (ถ้ามี) หรือ ask explicitly
3. **คำถามเดิมหายไป** ตอน user retake บน device ใหม่ (ไม่มี Clerk) — accept หรือ migrate guest → signed-in ด้วย?
4. **P9 Big Five** ทำเมื่อไหร่? — depends on user feedback

---

## 10. References

- Code:
  - `src/utils/mbti.ts` — scoring + picker
  - `src/server/mbti-matching.ts` — current rule-based matcher
  - `src/server/mbti-queries.ts` — DB queries
  - `src/features/mbti/components/` — quiz, result, faculty list, share
  - `src/features/mbti/hooks/use-session-seed.ts` — deterministic seed
  - `src/data/mbti-statements.ts` — 60-item pool
- Memory:
  - `context/mbti-audit.md` — DB state pre-redesign
  - `context/mbti-quiz-redesign.md` — original analysis + decisions
  - `context/mbti-roadmap.md` — this file
- Logs:
  - `context/History_log/2026-06-09.md`, `2026-06-10.md`
  - `context/database.md`
- Commits:
  - `d6f6e59` feat(mbti): redesign quiz — A+B+D + Path D + P1 + P2
  - `816ed5b` refactor(mbti): rename text → statement, drop optionA/B
