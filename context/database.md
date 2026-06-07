# Database Log

---

## 2026-05-27 — Initial Schema Setup

### สิ่งที่ทำ
- สร้าง Prisma schema เริ่มต้น (ไม่ได้ใช้ migrate dev — push ตรงไปยัง DB)
- DB: PostgreSQL บน Supabase (pooler: `aws-1-ap-southeast-1.pooler.supabase.com:5432`)
- ใช้ `PrismaPg` adapter สำหรับ connection pooling

### Schema (v1)
```
University         — id, slug, name, shortName, location, color, logoUrl
Faculty            — id, universityId, slug, name, program, majorName, detail, programCode, field
TcasScore          — id, facultyId, year, round, minScore, avgScore, maxScore, seats
FacultyRequirement — id, facultyId, weights (Json), estMinScore
User               — id, clerkId, email, name
PredictionHistory  — id, userId, facultyId, userScore, chance, gap
```

### หมายเหตุ
- ไม่ได้ใช้ `prisma migrate dev` ตั้งแต่ต้น → เกิด migration drift (DB ไม่มี migration history)
- `prisma migrate dev` ในภายหลังจะ error "Drift detected: Your database schema is not in sync with your migration history"

---

## 2026-05-27 — Import TCAS64–68 Scores

### สิ่งที่ทำ
- รัน `scripts/import-tcas.ts` นำเข้าคะแนน TCAS64–68 จาก CSV 5 ไฟล์
- รัน `scripts/import-weights.ts` นำเข้า subject weights จาก mytcas API + คะแนน TCAS69

### ผลลัพธ์
- University: ~50+ สถาบัน
- Faculty: หลายพันหลักสูตร
- TcasScore: หลายพัน records (TCAS64–69)
- FacultyRequirement: 6,553 records

### Bugs พบ
1. **Faculty ซ้ำ** — `makeFacultySlug` ใช้ `programCode` เป็น key → เปลี่ยนเป็น `programName:majorName:detail` แก้แล้ว
2. **Weights ผิด 98 records** — programCode บน Faculty เป็นของ TCAS68 แต่ mytcas API แสดง TCAS69 → code อาจถูก reuse สำหรับ program อื่น (dry-run `purge-bad-weights.ts` ยืนยัน 98 records ผิด)
3. **Migration drift** — DB setup โดยไม่มี migration baseline

---

## 2026-05-27 — Dedupe + Reslug Script

### สิ่งที่ทำ
- สร้าง `scripts/dedupe-faculties.ts`
  - Phase 1: merge Faculty ที่ซ้ำกัน → โอน TcasScore/FacultyRequirement ไป canonical row (ที่มี scores เยอะสุด)
  - Phase 2: re-slug Faculty ทั้งหมด จาก `programCode` → `programName:majorName:detail`

---

## 2026-05-28 — Schema Analysis + Reset Planning

### สิ่งที่ทำ
- วิเคราะห์ column mapping ของ CSV ทั้ง 5 ปี (TCAS64–68)
- หา root cause ของ bugs ทั้งหมด
- วางแผน reset DB + redesign schema

### Root Cause Analysis

| ปัญหา | Root Cause |
|-------|-----------|
| Faculty ซ้ำใน dropdown | dedup key ใช้ raw `f.program` แทน normalized → แก้ชั่วคราวแล้วใน queries.ts |
| Weights ผิดหลักสูตร | `programCode` เก็บบน Faculty (เก็บแค่ปีล่าสุด) → ควรเก็บบน TcasScore (per-year) |
| Migration drift | ไม่ได้ใช้ `prisma migrate dev` ตั้งแต่ต้น |
| ไม่รู้ว่า weights อ้างอิงปีไหน | `FacultyRequirement` ไม่มี `year` field |

### Design Decisions (blueprint สำหรับ reset)
1. ย้าย `programCode` จาก **Faculty → TcasScore** (code เปลี่ยนทุกปี ควรเก็บ per-year)
2. Faculty slug = identity key: `lower(uni)|lower(faculty)|lower(program)|lower(major)|lower(detail)`
3. เพิ่ม `year Int` ใน `FacultyRequirement` (รู้ว่า weights อ้างอิงจากปีไหน)
4. ใช้ `prisma migrate reset` เพื่อตั้ง migration baseline ใหม่ตั้งแต่ต้น

### Reference Files
- `src/data/tcas64-69/columns.md` — column mapping + quirks แต่ละปี
- `src/data/tcas64-69/cleaning-design.md` — cleaning strategy + schema changes ฉบับสมบูรณ์
- `scripts/purge-bad-weights.ts` — dry run พบ 98 records ผิด (ยังไม่ได้รัน จริง)

---

## Schema เป้าหมาย (หลัง Reset)

```prisma
model Faculty {
  id           String       @id @default(cuid())
  universityId String
  slug         String       // identity key: lower(uni|faculty|program|major|detail)
  name         String       // facultyName
  program      String       // programName
  majorName    String?
  detail       String?
  field        FacultyField @default(other)
  // ❌ ลบ programCode ออก — ย้ายไป TcasScore
}

model TcasScore {
  id          String  @id @default(cuid())
  facultyId   String
  year        Int
  round       Int     @default(3)
  programCode String? // ✅ เพิ่มใหม่ — รหัสหลักสูตรของปีนั้น
  minScore    Float
  avgScore    Float
  maxScore    Float?
  seats       Int?

  @@unique([facultyId, year, round])
}

model FacultyRequirement {
  id          String   @id @default(cuid())
  facultyId   String   @unique
  year        Int      // ✅ เพิ่มใหม่ — ปีที่ weights อ้างอิง (เช่น 2569)
  weights     Json
  estMinScore Float?
}
```

### Import Order หลัง Reset
```
1. prisma migrate reset
2. npx tsx scripts/import-tcas.ts    ← import คะแนน 5 ปี (schema ใหม่)
3. npx tsx scripts/import-weights.ts ← import weights + TCAS69 scores
4. ตรวจสอบด้วย check scripts
```

---

## 2026-05-28 — Full DB Reset + Reimport (Schema v2)

### สิ่งที่ทำ
1. **แก้ `prisma/schema.prisma`** (ตาม design ข้างต้น)
   - ลบ `programCode` ออกจาก Faculty
   - เพิ่ม `programCode String?` + `@@index([programCode])` ใน TcasScore
   - เพิ่ม `year Int` ใน FacultyRequirement

2. **รัน `prisma migrate reset --force`** (ด้วย `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="reset already"`)
   - ลบข้อมูลและ schema เก่าทั้งหมด

3. **รัน `prisma migrate dev --name init`**
   - สร้าง migration baseline `20260528034852_init`

4. **เขียนใหม่ `scripts/import-tcas.ts`**
   - `makeFacultySlug`: `lower(uni|faculty|program|major|detail).slice(0, 512)`
   - `upsertFaculty`: ไม่มี programCode แล้ว
   - `upsertScore`: เพิ่ม `programCode: row.programCode || null`
   - ผลลัพธ์: **16,404 scores, 86 universities, 8,814 faculties**

5. **แก้ `scripts/import-weights.ts`**
   - ดึง programCode ล่าสุดจาก TcasScore (ไม่ใช่ Faculty):
     ```ts
     scores: { where: { programCode: { not: null } }, orderBy: { year: "desc" }, take: 1, select: { programCode, year } }
     ```
   - FacultyRequirement upsert เพิ่ม `year: TCAS_YEAR`
   - ผลลัพธ์: **7,520 weights, 6,989 TcasScore TCAS69 records**

6. **แก้ `scripts/purge-bad-weights.ts`** (post-reset)
   - ลบ `Faculty.programCode` reference ออก (field นี้ไม่มีแล้ว)
   - ใช้ nested `select` แทน `include`
   - รัน dry-run: พบ 108 records ผิด (programCode reuse ข้ามปี)
   - รัน จริง: ลบ 108 records → เหลือ **7,412 clean FacultyRequirement records**

### DB State (Final) — หลัง reset + reimport + purge
| Table | Records |
|-------|---------|
| University | 86 |
| Faculty | 8,814 |
| TcasScore | 16,404 (TCAS64–68) + 6,989 (TCAS69) = 23,393 total |
| FacultyRequirement | 7,412 (weights TCAS69, clean) |

### Migration
- Migration baseline: `20260528034852_init`
- ใช้ `prisma migrate dev` เป็น standard workflow แล้ว

### Errors ที่แก้ระหว่างทาง
| Error | สาเหตุ | แก้ |
|-------|--------|-----|
| `PrismaClientValidationError` ใน import-weights.ts | ใช้ `select` + `include` พร้อมกัน | เปลี่ยนเป็น nested `select` อย่างเดียว |
| purge-bad-weights.ts crash | reference `Faculty.programCode` ที่ลบออกไปแล้ว | ลบ reference + logic ที่เกี่ยวข้องออก |
| Prisma generated client ยังมี `programCode` บน Faculty | `prisma generate` ไม่ได้รันหลัง schema reset | รัน `npx prisma generate` → client ถูก regenerate |

---

## 2026-05-28 — Fix mytcas Language Weight Encoding Issue

### สิ่งที่ทำ
ค้นพบว่า **mytcas API มีปัญหา data quality เอง** (ไม่ใช่ programCode mismatch):

mytcas encode "ภาษาต่างประเทศ X%" แบบผิดรูปแบบ:
- **ถูก**: `{"cal_type":"1","cal_score_sum":30,"cal_subject_name":"a_lv_81 a_lv_82..."}`
- **ผิด**: `{"a_lv_81":15,"a_lv_82":15}` → แสดงผลเป็น "ฝรั่งเศส 15% + เยอรมัน 15%"

ตัวอย่าง: KKU วิศวกรรมเครื่องกล `10030104300701A` → mytcas API ส่งคืน `{"tpat3":20,"a_lv_61":30,"a_lv_64":30,"a_lv_82":20}` ซึ่งถูกเข้ารหัสผิด

### ปัญหาที่พบ
- **620 records** ใน STEM fields มี specific language subjects (a_lv_81–86) เป็น top-level fixed weights
- **48 มหาวิทยาลัย** ได้รับผลกระทบ
- หนักสุด: ม.ศิลปากร (105), กลุ่มสถาบันแพทย์ (99), มข. (53), มจพ. (47)

### แนวทางแก้
แทนที่จะลบ (purge) → **แปลง (convert)** specific lang codes ให้เป็น `a_lv_80` (A-Level ภาษาต่างประเทศ):
- `{"a_lv_81":15,"a_lv_82":15}` → `{"a_lv_80":30}` — รักษา weight info ไว้

### Script ที่สร้าง
- `scripts/fix-lang-weights.ts` — detect + convert
- `scripts/count-bad-by-uni.ts` — วิเคราะห์ปัญหาแยกตามมหาวิทยาลัย
- `scripts/check-mech-eng.ts` / `check-api.ts` — debug scripts

### ผลลัพธ์
- แปลง **821 records** → `a_lv_80` สำเร็จ
- `purge-bad-weights.ts --dry-run` ยืนยัน: **0 bad records** เหลืออยู่
- FacultyRequirement ทั้ง 7,412 records clean แล้ว

### Logic ที่ใช้ใน fix-lang-weights.ts
- STEM fields (engineering/science/medicine/nursing/pharmacy/dentistry/architecture/ict): ถ้ามี a_lv_81-86 เป็น top-level key → แปลง (ยกเว้น international programs)
- Non-STEM fields: แปลงเฉพาะถ้า specific lang ≥ 60% รวมกัน

---

## 2026-05-28 — Critical Fix: SUBJECT_LABELS mapping ผิดทั้งหมด + Re-import weights

### ปัญหาที่ค้นพบ
**SUBJECT_LABELS ใน `src/lib/subjects.ts` ใช้ NIETS official codes ซึ่งต่างจาก mytcas internal codes อย่างสิ้นเชิง**

mapping เก่า (ผิด):
- a_lv_61 = ภาษาไทย, a_lv_62 = สังคมศาสตร์, a_lv_63 = ภาษาอังกฤษ
- a_lv_82 = ภาษาเยอรมัน, a_lv_81 = ภาษาฝรั่งเศส

mapping ที่ถูกต้อง (verified จาก mytcas.com JS bundle `main.198bc51d.chunk.js`):
- a_lv_61 = คณิตศาสตร์ประยุกต์ 1, a_lv_62 = คณิตศาสตร์ประยุกต์ 2
- a_lv_64 = ฟิสิกส์, a_lv_65 = เคมี, a_lv_66 = ชีววิทยา
- a_lv_81 = ภาษาไทย, a_lv_82 = ภาษาอังกฤษ
- a_lv_83 = ฝรั่งเศส, a_lv_84 = เยอรมัน, a_lv_85 = ญี่ปุ่น
- a_lv_86 = เกาหลี, a_lv_87 = จีน, a_lv_88 = บาลี, a_lv_89 = สเปน

### ผลกระทบของ mapping ผิด
- `fix-lang-weights.ts` รอบก่อนหน้า (2026-05-27) แปลง **821 records** โดยเข้าใจผิดว่า a_lv_81 = ฝรั่งเศส, a_lv_82 = เยอรมัน → ทำให้ภาษาไทย + ภาษาอังกฤษถูกรวมเป็น `a_lv_80` (key ที่ไม่มีจริง) → ข้อมูลเสียหาย

### สิ่งที่ทำ
- แก้ `src/lib/subjects.ts` — rewrite `SUBJECT_LABELS` + `getSubjectShortCode()` ให้ใช้ mytcas codes ที่ถูกต้อง
- แก้ `scripts/import-weights.ts` — sync SUBJECT_LABELS ให้ตรงกัน
- แก้ `scripts/purge-bad-weights.ts` — `LANG_SUBJECTS` เปลี่ยนเป็น {a_lv_83..89} (เอา a_lv_81/82 ออก)
- แก้ `scripts/fix-lang-weights.ts` — `SPECIFIC_LANG` เปลี่ยนเป็น {a_lv_83..89}, target จาก `a_lv_80` → `a_lv_82`
- **Re-run `import-weights.ts`** — upsert ทับ 7,520 records ด้วยข้อมูล original จาก mytcas API (restore 821 records ที่เสียหาย)

### ผลลัพธ์หลัง re-import
```
พบข้อมูลใน mytcas : 3,415 codes
ไม่พบ             : 920 codes
weights บันทึก    : 7,520 records
TcasScore 2569    : 6,989 records
errors            : 0
```

### Data quality verification
- `purge-bad-weights.ts --dry-run` → **0 bad records** ใน 7,520 records ✅
- `fix-lang-weights.ts --dry-run` → พบ 19 records (คณะภาษาต่างประเทศจริงๆ เช่น ภาษาฝรั่งเศส/เยอรมัน/จีน) → **ไม่ต้องแก้** เพราะถูกต้องอยู่แล้ว

### หมายเหตุ
- ลบไฟล์ debug `scripts/mytcas_main.js` แล้ว
- ตอนนี้ weights แสดงผลถูกต้อง เช่น KKU วิศวกรรมเครื่องกล = TPAT3 20% + คณิตศาสตร์ประยุกต์ 1 30% + ฟิสิกส์ 30% + ภาษาอังกฤษ 20%

---

## 2026-05-28 — Switch weights source: ly-programs (2568) → rounds (2569)

### ปัญหาที่ค้นพบ
API endpoint `ly-programs/[code].json` = "last year programs" = **weights ปี 2568** ไม่ใช่ 2569

ค้นพบ endpoint ใหม่: `rounds/[code].json` → ข้อมูล rounds ทั้งหมดของปี 2569 พร้อม official weights

ตัวอย่าง KKU Computer Engineering (10030104300501A):
- 2568 (ly-programs): `{"tpat3":20,"a_lv_61":30,"a_lv_64":25,"a_lv_82":25}`
- 2569 (rounds):      `{"tpat3":20,"a_lv_61":30,"a_lv_64":20,"a_lv_82":30}` ← ต่างกัน!

### สิ่งที่ทำ
- อัพเดท `scripts/import-weights.ts`:
  - weights: ดึงจาก `rounds/[code].json` filter type="3_2569" เป็นหลัก
  - fallback: ถ้า rounds ไม่มีข้อมูล → ใช้ ly-programs (2568)
  - min/max scores: ยังใช้ ly-programs (2568 historical actual scores)
- Re-run import

### ผลลัพธ์
```
weights ปี 2569 (rounds)   : 7,210 records
weights ปี 2568 (fallback) :   399 records
TcasScore ปี 2568          : 6,989 records
errors                     : 0
```

### หมายเหตุ
- HTTP 403 บน ly-programs = โปรแกรมใหม่ที่ไม่มีข้อมูลปี 68 → ไม่กระทบ weights ปี 69
- rounds endpoint ใช้ query param `?ts=19e6d54d971` (CDN cache-busting, S3 ignores it)

---

## 2026-05-28 — Migrate University Slugs: Thai → English SEO-friendly

### สิ่งที่ทำ
- สร้าง `scripts/migrate-uni-slugs.ts` — hardcoded mapping ชื่อไทย → English slug
- รัน migration: อัพเดท `University.slug` ทั้ง 86 records
- ไม่ต้องแก้ Faculty.slug (ใช้เป็น identity key ภายใน, URL routing ใช้ Faculty.id แทน)

### ตัวอย่าง slugs ใหม่
- จุฬาลงกรณ์มหาวิทยาลัย → chulalongkorn-university
- มหาวิทยาลัยขอนแก่น     → khon-kaen-university
- มหาวิทยาลัยมหิดล        → mahidol-university
- KMUTT                    → kmutt
- KMITL                    → kmitl
- ราชมงคล (9 แห่ง)         → rmut-[campus]

### หมายเหตุ
- ราชภัฎพระนคร (ฎ) ≠ ราชภัฏพระนคร (ฏ) — DB มี 2 records (ตัวสะกดต่างกัน) → ใช้ slug -b สำหรับ variant
- อิสเทิร์น vs อีสเทิร์นเอเชีย — DB มี 2 records → slug -iat สำหรับ variant
- slugs ต้อง stable ห้ามเปลี่ยนอีก (SEO)

---

## 2026-05-28 — MBTI Schema + Seed

### สิ่งที่ทำ
- เพิ่ม 4 models ใน Prisma schema: `MBTIQuestion`, `MBTIProfile`, `FacultyMBTIMatch`, `MBTIResult`
- เพิ่ม enum `MBTIDimension` (EI, SN, TF, JP)
- รัน `prisma db push` → sync สำเร็จ
- รัน `prisma generate` → regenerate Prisma Client
- รัน `scripts/seed-mbti.ts` → seed สำเร็จ

### Schema changes
- Model `MBTIQuestion`: order, dimension (enum), text, optionA, optionB, version, active
- Model `MBTIProfile`: type (unique), nickname, emoji, tagline, description (Text), strengths (Json), careers (Json), color
- Model `FacultyMBTIMatch`: mbtiType, field, score (Float), reason, rank — unique(mbtiType, rank)
- Model `MBTIResult`: userId (nullable), mbtiType, scores (Json)
- Enum `MBTIDimension`: EI | SN | TF | JP

### Seed results
- 20 MBTIQuestion (5 per dimension)
- 16 MBTIProfile (ครบ 16 type)
- 64 FacultyMBTIMatch (4 per type)

---

## 2026-05-31 — Phase 3: เพิ่ม programCode บน Faculty + ปรับ Import Identity Logic

### สิ่งที่ทำ
- เพิ่ม `programCode String?` และ `@@index([programCode])` ใน Faculty model
- รัน `prisma db push` → sync Supabase สำเร็จ (ไม่มี data loss เพราะ nullable)
- ปรับ `scripts/import-tcas.ts` ให้ใช้ programCode เป็น identity key (แทน slug) สำหรับ Faculty lookup
- เพิ่ม in-memory Faculty cache (`preloadFacultyIndex()`) เพื่อกัน per-row DB query → ป้องกัน connection timeout

### Schema changes
- `Faculty`: เพิ่ม `programCode String?`
- `Faculty`: เพิ่ม `@@index([programCode])`
- ไม่มี migration file (ใช้ `prisma db push`)

### หมายเหตุ
- slug ยังคงอยู่เป็น display/fallback key (legacy compatibility)
- programCode คือ "รหัสหลักสูตร" จาก ทปอ. — stable ทุกปีสำหรับ regular universities

---

## 2026-05-31 — Phase 4: Full DB Clean-slate Re-import

### สิ่งที่ทำ
1. Backup FacultyRequirement 6,612 records → `src/data/faculty-requirements-backup.json`
2. Truncate ด้วย cascading delete: TcasScore → FacultyRequirement → PredictionHistory → Faculty (ใช้ `deleteMany`)
3. Re-import ทั้ง 5 ปี (TCAS64–68) ด้วย import script ที่ใช้ programCode-based identity
4. รัน `dedupe-faculties.ts` → ยืนยัน 0 duplicates
5. Restore FacultyRequirement:
   - Match ด้วย programCode (priority)
   - Fallback: (facultyName, normProgram, normMajor)
   - ผล: 5,338 restored, 1,274 not found (faculty ถูก merge แล้ว)

### DB State หลัง Phase 4
| Table | Records |
|-------|---------|
| Faculty | 4,564 |
| TcasScore | 14,099 |
| FacultyRequirement | 5,338 |

### หมายเหตุ
- FacultyRequirement 1,274 records ที่ restore ไม่ได้ = Faculty เดิมถูก merge เข้า canonical row แล้ว
- ต้องรัน `import-weights.ts` ใหม่เพื่อสร้าง FacultyRequirement ให้ครบ

---

## 2026-05-31 — Phase 5: COTMES Fix + Final Re-import

### ปัญหาที่ค้นพบ
COTMES reassign programCode ให้มหาวิทยาลัยสมาชิกต่างกันทุกปี:
- TCAS65: `50310123` = ทันตแพทย์ มหิดล
- TCAS66: `50310123` = ทันตแพทย์ จุฬา
→ programCode-based lookup จะผสม Faculty ข้ามมหาวิทยาลัยโดยผิดพลาด

### สิ่งที่ทำ
- Truncate DB อีกรอบ (4,681 Faculty, 14,072 TcasScore deleted)
- แก้ `import-tcas.ts`:
  - `isCOTMES()`: detect ด้วย `universityName.includes("กลุ่มสถาบัน")`
  - COTMES branch: ใช้ `facultyName`-based cache key แทน programCode (faculty name มีชื่อมหาวิทยาลัยอยู่ใน string)
  - Regular uni branch: ใช้ programCode-based key ตามเดิม
- Re-import ทั้ง 5 ปีด้วย logic ใหม่

### DB State Final (Phase 5)
| Table | Records |
|-------|---------|
| Faculty | **4,683** |
| TcasScore | **14,099** |
| FacultyRequirement | **5,338** |
| Duplicate Faculty groups | **0** |
| Faculty ที่มี programCode | **100%** |

### Verification
- ทันตแพทย์ จุฬา (COTMES): 1 row, years=[2564,2565,2566,2567,2568] ✅
- วิศวกรรมคอมพิวเตอร์ จุฬา (regular): 1 row, years=[2564,2565,2566,2567,2568] ✅
- Duplicate groups (programCode-based): 0 ✅

### หมายเหตุ
- COTMES identity = `(universityId, facultyName, normMajor)` — ไม่ใช้ programCode
- Regular uni identity = `(universityId, programCode, normMajor)` — stable ทุกปี
- ลด Faculty rows จาก 7,688 → 4,683 (-39%)

---

## 2026-05-29 — MBTIResult: เพิ่ม analytics fields

### สิ่งที่ทำ
- เพิ่ม 3 optional fields ใน `MBTIResult` เพื่อเก็บข้อมูลเชิง analytics
- `prisma db push` ผ่าน (Supabase)

### Schema changes
- `MBTIResult`: เพิ่ม `answers Json?` — snapshot ของ MBTIAnswer[] ทั้งหมด
- `MBTIResult`: เพิ่ม `answeredCount Int?` — จำนวนข้อที่ตอบจริง
- `MBTIResult`: เพิ่ม `durationMs Int?` — เวลาทำ quiz ทั้งหมดหน่วย ms

### หมายเหตุ
- ทุก field เป็น optional เพื่อ backward compat กับ records เก่า
- `userId` ยังคงเป็น null (anonymous) จนกว่า Clerk auth จะ integrate
- ออกแบบให้ claim-after-sign-in: client เก็บ resultId ใน localStorage แล้วส่ง userId ภายหลัง


## 2026-06-06 — Performance indexes (pending apply)

### สิ่งที่ทำ
- เพิ่ม `@@index([year, minScore])` ที่ `TcasScore` — เร่ง getLatestTcasYear + getMinScoresLatest
- เพิ่ม `@@index([userId, createdAt])` ที่ `PredictionHistory` — เร่ง dashboard + profile stats

### Migration ที่สร้างไว้ (ยังไม่ apply)
- `prisma/migrations/20260606_perf_indexes/migration.sql` — `CREATE INDEX IF NOT EXISTS` ทั้ง 2 ตัว
- รัน: `npx prisma migrate deploy` หรือ apply SQL ตรงๆ บน DB
- ไม่ destructive — สามารถรันบน production live ได้ (Postgres CREATE INDEX มี ACCESS SHARE lock เฉพาะ READ)

### หมายเหตุ
- `npx prisma generate` รันแล้ว — Prisma client recognize indexes ใหม่
