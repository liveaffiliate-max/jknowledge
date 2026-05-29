# TCAS Data Cleaning Design

## ปัญหาหลักที่ต้องแก้

| ปัญหา | สาเหตุ |
|-------|--------|
| Faculty ซ้ำข้ามปี | ไม่มี stable identity key — programCode เปลี่ยนทุกปี |
| Weights ผิดหลักสูตร | programCode stored บน Faculty ใช้ code ปีเก่า → fetch TCAS69 ได้ code ของ program อื่น |
| Column name ต่างกันทุกปี | ทปอ เปลี่ยน format CSV ทุกปี |
| Score column ต่างกัน | บางปีมีรอบ 1+2 บางปีมีรอบเดียว, TCAS68 สลับ max/min |
| "0" vs "" | TCAS65 ใช้ "0" แทน empty |

---

## Unified NormalizedRow — Output ที่ต้องการ

ทุกปีต้องแปลงออกมาในรูปแบบนี้ก่อน import:

```typescript
interface NormalizedRow {
  year:          number   // 2564–2568
  universityName: string  // trimmed
  facultyName:   string  // trimmed (ชื่อคณะ)
  programName:   string  // trimmed (ชื่อหลักสูตร)
  majorName:     string  // trimmed, "" ถ้าไม่มี
  detail:        string  // trimmed, "" ถ้าไม่มี
  programCode:   string  // รหัสหลักสูตรปีนั้น (เก็บ per-score ไม่ใช่ per-faculty)
  seats:         number | null
  minScore:      number  // final round
  maxScore:      number  // final round
  avgScore:      number  // computed: (min+max)/2
}
```

---

## Column Mapping Per Year

### TCAS64
```
universityName  ← สถาบัน
facultyName     ← คณะ
programName     ← หลักสูตร
majorName       ← แขนง/วิชาเอก
detail          ← โครงการ
programCode     ← รหัสหลักสูตร
seats           ← รับ
minScore        ← คะแนนต่ำสุด        (single round)
maxScore        ← คะแนนสูงสุด        (single round)

⚠️ filter: รูปแบบ === "Admission1" เท่านั้น (Admission2 = raw score หลักหมื่น)
```

### TCAS65
```
universityName  ← university_name
facultyName     ← program_lookup_programs.faculty_name_th
programName     ← program_name_th
majorName       ← major_name_th
detail          ← project_name_th
programCode     ← program_id
seats           ← รับ
minScore        ← คะแนนต่ำสุด หลังประมวลผลรอบ 2   (fallback: คะแนนต่ำสุด)
maxScore        ← คะแนนสูงสุด หลังประมวลผลรอบ 2   (fallback: คะแนนสูงสุด)

⚠️ "0" = empty → แปลงเป็น ""
```

### TCAS66
```
universityName  ← สถาบัน
facultyName     ← คณะ/สำนักวิชา
programName     ← ชื่อหลักสูตร
majorName       ← สาขาวิชา/วิชาเอก
detail          ← รายละเอียด
programCode     ← รหัสหลักสูตร
seats           ← รับ
minScore        ← คะแนนต่ำสุด        (single round)
maxScore        ← คะแนนสูงสุด        (single round)
```

### TCAS67
```
universityName  ← สถาบัน
facultyName     ← คณะ
programName     ← หลักสูตร
majorName       ← สาขา/วิชาเอก
detail          ← รายละเอียด
programCode     ← รหัสหลักสูตร
seats           ← รับ
minScore        ← คะแนนต่ำสุด หลังประมวลผลรอบ 2   (fallback: คะแนนต่ำสุด)
maxScore        ← คะแนนสูงสุด หลังประมวลผลรอบ 2   (fallback: คะแนนสูงสุด)
```

### TCAS68
```
universityName  ← สถาบัน
facultyName     ← คณะ
programName     ← หลักสูตร
majorName       ← สาขา/วิชาเอก
detail          ← รายละเอียด
programCode     ← รหัสหลักสูตร
seats           ← รับ
minScore        ← คะแนนต่ำสุด ประมวลผลครั้งที่ 2   (fallback: คะแนนต่ำสุด ประมวลผลครั้งที่ 1)
maxScore        ← คะแนนสูงสุด ประมวลผลครั้งที่ 2   (fallback: คะแนนสูงสุด ประมวลผลครั้งที่ 1)

⚠️ คอลัมน์ไฟล์สลับกัน (สูงสุดมาก่อนต่ำสุด) — ต้อง map ด้วยชื่อคอลัมน์ ไม่ใช่ index
```

---

## Text Normalization Rules

กฎที่ใช้กับทุก string field ก่อน import:

```typescript
function normalizeText(s: string | undefined): string {
  if (!s) return ""
  const t = s.trim()
  if (t === "0") return ""   // TCAS65 sentinel
  return t
}
```

### Score Selection Logic

```typescript
function pickScore(r1: number, r2: number): number {
  // ใช้รอบ 2 ถ้ามีค่า fallback รอบ 1
  return r2 > 0 ? r2 : r1
}
```

---

## Global Validation Filter (ทุกปีเหมือนกัน)

```typescript
function isValid(row: NormalizedRow): boolean {
  if (!row.programCode)          return false  // ไม่มีรหัส
  if (!row.universityName)       return false  // ไม่มีมหาวิทยาลัย
  if (row.minScore <= 0)         return false  // ไม่มีคะแนน
  if (row.maxScore <= 0)         return false  // ไม่มีคะแนน
  if (row.maxScore > 100)        return false  // คะแนน raw (Admission2 style)
  if (row.minScore >= row.maxScore) return false  // ข้อมูลผิด
  return true
}
```

---

## Faculty Identity Key — หัวใจของ cross-year comparison

### ปัญหา

`programCode` ไม่ stable — ทปอ เปลี่ยนทุกปี:
- TCAS64: `10030105703501A` = "คอมพิวเตอร์ศึกษา"
- TCAS69: `10030105703501A` = "ภาษาฝรั่งเศส" ← code ถูก reuse!

### Solution: Identity Key จาก content

```typescript
function makeIdentityKey(row: NormalizedRow): string {
  return [
    row.universityName,
    row.facultyName,
    row.programName,
    row.majorName,
    row.detail,
  ]
    .map(s => s.trim().toLowerCase())
    .join("|")
}
```

Key นี้ใช้เป็น `slug` สำหรับ Faculty table — ถ้า key เดียวกัน = หลักสูตรเดียวกัน

### ตัวอย่าง

```
จุฬาลงกรณ์มหาวิทยาลัย|คณะอักษรศาสตร์|อักษรศาสตรบัณฑิต|อักษรศาสตร์|สาขาวิชาอักษรศาสตร์ เลือกสอบวิชาภาษาเกาหลี
```

→ ปี 64,65,66,67,68 ถ้า key นี้ตรงกัน → เป็น Faculty row เดียวกัน

---

## Schema Changes ที่จำเป็น

### ปัจจุบัน (ผิด)
```
Faculty {
  programCode  ← เก็บ code ปีล่าสุดที่ import เท่านั้น
}
```

### ใหม่ (ถูก)
```
Faculty {
  // ลบ programCode ออก
}

TcasScore {
  programCode  ← เก็บ code ของปีนั้น ← ย้ายมาที่นี่
}
```

**เหตุผล:**
- Faculty row ควร represent "หลักสูตร" ที่ stable ข้ามปี
- programCode เป็น property ของ score ปีนั้น ไม่ใช่ของ faculty

### FacultyRequirement — เพิ่ม year

```
FacultyRequirement {
  year  ← weights อ้างอิงจากปีไหน (เช่น 2569)
}
```

---

## Weights Import — Fix

เมื่อ programCode อยู่บน TcasScore แล้ว:

```typescript
// ดึง programCode ล่าสุดของแต่ละ faculty
const latestScore = await prisma.tcasScore.findFirst({
  where:   { facultyId: fac.id },
  orderBy: { year: "desc" },
  select:  { programCode: true, year: true },
})

if (!latestScore?.programCode) continue  // ข้าม ถ้าไม่มี code

// ใช้ code ของปีล่าสุดดึง weights จาก mytcas
const data = await fetchProgram(latestScore.programCode)
```

ข้อดี: ถ้าหลักสูตรนี้ไม่มีข้อมูลใน mytcas (code เปลี่ยน หรือปิดหลักสูตร) → skip โดยอัตโนมัติ ไม่ได้ weights ผิด

---

## Order of Operations หลัง Reset DB

```
1. prisma migrate reset        ← ล้าง + สร้าง schema ใหม่ (รวม migration baseline)
2. npx tsx scripts/import-tcas.ts    ← import คะแนน 5 ปี (ใช้ schema ใหม่)
3. npx tsx scripts/import-weights.ts ← import weights + TCAS69 scores
4. ตรวจสอบด้วย check scripts
```

---

## สิ่งที่ต้องเปลี่ยนใน import-tcas.ts

### 1. upsertFaculty — ลบ programCode ออก

```typescript
// ก่อน
create: { ..., programCode: row.programCode }

// หลัง
create: { ... }  // ไม่มี programCode
```

### 2. upsertScore — เพิ่ม programCode

```typescript
// ก่อน
create: { facultyId, year, round, minScore, avgScore, maxScore, seats }

// หลัง
create: { facultyId, year, round, programCode: row.programCode, minScore, avgScore, maxScore, seats }
```

### 3. makeFacultySlug — ใช้ identity key

```typescript
function makeFacultySlug(uni: string, faculty: string, program: string, major: string, detail: string): string {
  return [uni, faculty, program, major, detail]
    .map(s => s.trim().toLowerCase())
    .join("|")
    .slice(0, 255)  // safety limit
}
```

---

## สรุป: 3 เปลี่ยนที่สำคัญที่สุด

| # | เปลี่ยนอะไร | ทำไม |
|---|------------|------|
| 1 | ย้าย `programCode` จาก Faculty → TcasScore | code เปลี่ยนทุกปี ควรเก็บ per-year |
| 2 | Faculty slug = identity key (uni+faculty+program+major+detail) | ทำให้ match ข้ามปีได้ stable |
| 3 | เพิ่ม `year` ใน FacultyRequirement | รู้ว่า weights อ้างอิงจากปีไหน |
