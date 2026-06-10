# MBTI System Audit — 2026-06-09

Snapshot ของ MBTI data ใน production DB ก่อนเริ่ม redesign (Phase A+B+D).

---

## ✅ สิ่งที่มีพร้อมแล้ว

| Table | Rows | สถานะ |
|---|---|---|
| `MBTIQuestion` | 28 (28 active) | ✅ ครบ (20 standard + 8 reverse) |
| `MBTIProfile` | 16/16 types | ✅ ครบทุก type |
| `MBTIResult` | 486 quizzes | ✅ มี traffic จริง (แต่ signed-in แค่ 2 — anonymous เกือบทั้งหมด) |
| `Faculty` | 5,082 (ทุกแถวมี TcasScore) | ✅ ใช้งานได้ |

---

## ⚠️ Gap หลัก (สิ่งที่ต้องแก้)

### 1. `FacultyMBTIMatch` ไม่ได้ link Faculty จริง

- **Sample row:**
  ```json
  {
    "mbtiType": "INTJ",
    "field":    "วิศวกรรมศาสตร์",   ← string label, ไม่ใช่ facultyId
    "score":    0.92,
    "reason":   "ตรงกับความชอบคิดเชิงระบบและแก้ปัญหา",
    "rank":     1
  }
  ```
- **ปัญหา:** เป็นแค่ category label — user จะรู้ว่า "เหมาะกับวิศวะ" แต่ไม่รู้ว่าควรไป **Chula Eng vs KU Eng vs KMUTT** และคะแนนเท่าไหร่
- **จำนวน:** 64 rows (4 ต่อ type) — ต้อง regenerate เป็น link จริง

### 2. Schema ต้องเพิ่ม column

```prisma
model FacultyMBTIMatch {
  // ... existing
  facultyId String?    // ⬅ ใหม่ — nullable เพื่อ backward compatible
  faculty   Faculty?   @relation(fields: [facultyId], references: [id])

  @@index([facultyId])
}
```

### 3. Signed-in adoption ต่ำมาก

- 486 quizzes แต่ login แค่ 2 → cross-feature (Phase B) จะ effective เฉพาะหลังเพิ่ม login incentive
- **Action:** ใน Phase B เพิ่ม CTA "บันทึกบุคลิกของคุณ — สมัครใน 10 วินาที" หลัง reveal

---

## 📊 FacultyField Distribution (สำหรับ matching algorithm)

| Field | Count | % | MBTI affinity (initial) |
|---|---:|---:|---|
| other | 1,553 | 31% | ต้องใช้ keyword จากชื่อคณะ — ใหญ่สุด |
| liberal_arts | 727 | 14% | F, N (มนุษย์ศาสตร์/ภาษา) |
| engineering | 724 | 14% | T, N, J |
| science | 622 | 12% | T, N |
| business | 417 | 8% | T, J, E |
| ict | 229 | 5% | T, N, I |
| architecture | 149 | 3% | N, P, F |
| accounting | 125 | 2% | S, T, J |
| political_science | 115 | 2% | N, F, E |
| law | 87 | 2% | T, J, S |
| nursing | 84 | 2% | F, J, S |
| economics | 80 | 2% | T, N |
| medicine | 80 | 2% | S, T, J |
| pharmacy | 58 | 1% | S, T, J |
| dentistry | 32 | 1% | S, T, J |

**Note:** "other" 31% ใหญ่เกินไป — ต้องใช้ keyword จาก `name`/`program`/`majorName` ในการแบ่งย่อย

---

## 🎯 ตัดสินใจ Architecture

### Matching Strategy
**เลือก: Rule-based (hybrid)** — Field enum + keyword scoring

- ทำไม: deterministic, debuggable, ไม่ต้องพึ่ง LLM ที่อาจ rate-limit
- เก็บ `reason` แบบ template ต่อ field (16 reasons static) → ไม่ต้อง LLM gen

### Row Strategy
- **ไม่ generate ทุก faculty × type** (5,082 × 16 = 81,312 rows — เยอะเกิน)
- **เก็บ top 20 per type** = 320 rows → query เร็ว, UI ใช้แค่ 5-10
- เลือกจาก highest match score และ "มี TcasScore ปีล่าสุด" เท่านั้น

### Display Order
1. `score desc` (match strength)
2. `latest minScore` (เรียงจาก competitive → safe)
3. ปล่อยให้ user คลิกเลือก uni ในกรณีอยากดู option อื่น

---

## ✅ Phase 0 — Done

ต่อไป → **Phase 1.1: เพิ่ม `facultyId` column ใน schema**
