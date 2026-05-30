/**
 * TCAS Import Script — นำเข้าข้อมูลจริงจาก ทปอ (TCAS64–68)
 * Run: npx tsx scripts/import-tcas.ts
 *
 * Cleaning rules applied:
 *  1. TCAS64 only: filter Admission1 (Admission2 = raw aggregate scores)
 *  2. Proper CSV parse — handle "1,234" quoted commas
 *  3. Trim whitespace, replace "0" major/detail with ""
 *  4. minScore > 0, maxScore > 0, maxScore <= 100, minScore < maxScore
 *  5. TCAS65: use round2 scores, fallback round1 if round2 = 0
 *  6. TCAS67: use "หลังประมวลผลรอบ 2", fallback round1
 *  7. TCAS68: column reversed — max comes before min
 *
 * Schema v2 changes:
 *  - programCode moved from Faculty → TcasScore (per-year)
 *  - Faculty slug = identity key: lower(uni|faculty|program|major|detail)
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { parse } from "csv-parse/sync"
import { readFileSync } from "fs"
import { join } from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { normalizeDetail, normalizeMajor } from "../src/lib/normalize-faculty"

// ── Prisma setup ──────────────────────────────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── Types ─────────────────────────────────────────────────────────────────────

interface NormalizedRow {
  universityName: string
  facultyName:    string
  programName:    string
  majorName:      string  // "" if none
  detail:         string  // "" if none
  programCode:    string  // this year's code → stored on TcasScore
  seats:          number
  minScore:       number
  maxScore:       number
  avgScore:       number
  year:           number
}

type CsvRow = Record<string, string>

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Parse number — strips commas e.g. "1,234" → 1234 */
function num(val: string | undefined): number {
  if (!val) return 0
  return parseFloat(String(val).replace(/,/g, "").trim()) || 0
}

/** Trim, convert "0" sentinel to empty string */
function str(val: string | undefined): string {
  if (!val) return ""
  const s = String(val).trim()
  return s === "0" ? "" : s
}

/** Read and parse CSV with proper RFC 4180 handling */
function readCsv(filePath: string): CsvRow[] {
  const content = readFileSync(filePath, "utf-8")
  return parse(content, {
    columns:            true,
    skip_empty_lines:   true,
    trim:               true,
    relax_column_count: true,
    bom:                true,
  }) as CsvRow[]
}

/**
 * Faculty identity slug — stable across years.
 * Uses normalizeDetail so verbose "คณะ... ภาคปกติ" and bare "ภาคปกติ" hash to
 * the same slug, preventing duplicate Faculty rows when the detail format
 * changes between TCAS years.
 */
function makeFacultySlug(
  universityName: string,
  facultyName:    string,
  programName:    string,
  majorName:      string,
  detail:         string
): string {
  const normDetail = normalizeDetail(detail, facultyName)
  return [universityName, facultyName, programName, majorName, normDetail]
    .map(s => s.trim().toLowerCase())
    .join("|")
    .slice(0, 512)
}

/** Generate university slug from Thai name */
function makeUniversitySlug(name: string): string {
  return name
    .replace(/มหาวิทยาลัย/g, "")
    .replace(/\s+/g, "")
    .slice(0, 20)
    || name.slice(0, 10)
}

/** Detect faculty field from faculty name + program name */
function detectField(facultyName: string, programName: string): string {
  const text = `${facultyName} ${programName}`
  if (/แพทยศาสตร์/.test(text) && !/ทันต/.test(text) && !/สัตว/.test(text)) return "medicine"
  if (/ทันตแพทย/.test(text))     return "dentistry"
  if (/เภสัช/.test(text))        return "pharmacy"
  if (/พยาบาล/.test(text))       return "nursing"
  if (/วิศวกรรม/.test(text))     return "engineering"
  if (/สถาปัตย/.test(text))      return "architecture"
  if (/นิติ/.test(text))         return "law"
  if (/บัญชี/.test(text))        return "accounting"
  if (/เศรษฐ/.test(text))        return "economics"
  if (/รัฐศาสตร์|รัฐประศาสน/.test(text)) return "political_science"
  if (/บริหาร|พาณิชย/.test(text)) return "business"
  if (/เทคโนโลยีสารสนเทศ|วิทยาการคอมพิวเตอร์|สารสนเทศ/.test(text)) return "ict"
  if (/วิทยาศาสตร์/.test(facultyName)) return "science"
  if (/อักษร|มนุษย|ศิลปศาสตร์|ศิลปกรรม|ภาษา/.test(text)) return "liberal_arts"
  return "other"
}

// ── Per-year normalizers ──────────────────────────────────────────────────────

function normalize64(rows: CsvRow[]): NormalizedRow[] {
  return rows
    .filter(r => str(r["รูปแบบ"]) === "Admission1")
    .map(r => ({
      universityName: str(r["สถาบัน"]),
      facultyName:    str(r["คณะ"]),
      programName:    str(r["หลักสูตร"]),
      majorName:      str(r["แขนง/วิชาเอก"]),
      detail:         str(r["โครงการ"]),
      programCode:    str(r["รหัสหลักสูตร"]),
      seats:          num(r["รับ"]),
      minScore:       num(r["คะแนนต่ำสุด"]),
      maxScore:       num(r["คะแนนสูงสุด"]),
      avgScore:       0,
      year:           2564,
    }))
}

function normalize65(rows: CsvRow[]): NormalizedRow[] {
  return rows.map(r => {
    const min1 = num(r["คะแนนต่ำสุด"])
    const max1 = num(r["คะแนนสูงสุด"])
    const min2 = num(r["คะแนนต่ำสุด หลังประมวลผลรอบ 2"])
    const max2 = num(r["คะแนนสูงสุด หลังประมวลผลรอบ 2"])
    return {
      universityName: str(r["university_name"]),
      facultyName:    str(r["program_lookup_programs.faculty_name_th"]),
      programName:    str(r["program_name_th"]),
      majorName:      str(r["major_name_th"]),
      detail:         str(r["project_name_th"]),
      programCode:    str(r["program_id"]),
      seats:          num(r["รับ"]),
      minScore:       min2 > 0 ? min2 : min1,
      maxScore:       max2 > 0 ? max2 : max1,
      avgScore:       0,
      year:           2565,
    }
  })
}

function normalize66(rows: CsvRow[]): NormalizedRow[] {
  return rows.map(r => ({
    universityName: str(r["สถาบัน"]),
    facultyName:    str(r["คณะ/สำนักวิชา"]),
    programName:    str(r["ชื่อหลักสูตร"]),
    majorName:      str(r["สาขาวิชา/วิชาเอก"]),
    detail:         str(r["รายละเอียด"]),
    programCode:    str(r["รหัสหลักสูตร"]),
    seats:          num(r["รับ"]),
    minScore:       num(r["คะแนนต่ำสุด"]),
    maxScore:       num(r["คะแนนสูงสุด"]),
    avgScore:       0,
    year:           2566,
  }))
}

function normalize67(rows: CsvRow[]): NormalizedRow[] {
  return rows.map(r => {
    const min1 = num(r["คะแนนต่ำสุด"])
    const max1 = num(r["คะแนนสูงสุด"])
    const min2 = num(r["คะแนนต่ำสุด หลังประมวลผลรอบ 2"])
    const max2 = num(r["คะแนนสูงสุด หลังประมวลผลรอบ 2"])
    return {
      universityName: str(r["สถาบัน"]),
      facultyName:    str(r["คณะ"]),
      programName:    str(r["หลักสูตร"]),
      majorName:      str(r["สาขา/วิชาเอก"]),
      detail:         str(r["รายละเอียด"]),
      programCode:    str(r["รหัสหลักสูตร"]),
      seats:          num(r["รับ"]),
      minScore:       min2 > 0 ? min2 : min1,
      maxScore:       max2 > 0 ? max2 : max1,
      avgScore:       0,
      year:           2567,
    }
  })
}

function normalize68(rows: CsvRow[]): NormalizedRow[] {
  // ⚠️ TCAS68: คะแนนสูงสุด comes BEFORE คะแนนต่ำสุด in both rounds
  return rows.map(r => {
    const max1 = num(r["คะแนนสูงสุด ประมวลผลครั้งที่ 1"])
    const min1 = num(r["คะแนนต่ำสุด ประมวลผลครั้งที่ 1"])
    const max2 = num(r["คะแนนสูงสุด ประมวลผลครั้งที่ 2"])
    const min2 = num(r["คะแนนต่ำสุด ประมวลผลครั้งที่ 2"])
    return {
      universityName: str(r["สถาบัน"]),
      facultyName:    str(r["คณะ"]),
      programName:    str(r["หลักสูตร"]),
      majorName:      str(r["สาขา/วิชาเอก"]),
      detail:         str(r["รายละเอียด"]),
      programCode:    str(r["รหัสหลักสูตร"]),
      seats:          num(r["รับ"]),
      minScore:       min2 > 0 ? min2 : min1,
      maxScore:       max2 > 0 ? max2 : max1,
      avgScore:       0,
      year:           2568,
    }
  })
}

// ── Global cleaning filter ────────────────────────────────────────────────────

function clean(rows: NormalizedRow[], year: number): NormalizedRow[] {
  const total   = rows.length
  const dropped = { noCode: 0, noUni: 0, minZero: 0, maxZero: 0, above100: 0, minGeMax: 0 }

  const result = rows.filter(r => {
    if (!r.programCode)           { dropped.noCode++;   return false }
    if (!r.universityName)        { dropped.noUni++;    return false }
    if (r.minScore <= 0)          { dropped.minZero++;  return false }
    if (r.maxScore <= 0)          { dropped.maxZero++;  return false }
    if (r.maxScore > 100)         { dropped.above100++; return false }
    if (r.minScore >= r.maxScore) { dropped.minGeMax++; return false }
    return true
  }).map(r => ({
    ...r,
    avgScore: parseFloat(((r.minScore + r.maxScore) / 2).toFixed(4)),
  }))

  console.log(`  TCAS${year - 2500}: ${total} raw → ${result.length} clean`)
  console.log(`    dropped: noCode=${dropped.noCode} noUni=${dropped.noUni} minZero=${dropped.minZero} maxZero=${dropped.maxZero} above100=${dropped.above100} minGeMax=${dropped.minGeMax}`)
  return result
}

// ── DB upsert helpers ─────────────────────────────────────────────────────────

const uniCache = new Map<string, string>() // name → id

async function upsertUniversity(name: string): Promise<string> {
  if (uniCache.has(name)) return uniCache.get(name)!

  const existing = await prisma.university.findFirst({ where: { name } })
  if (existing) {
    uniCache.set(name, existing.id)
    return existing.id
  }

  let slug = makeUniversitySlug(name)
  const conflict = await prisma.university.findFirst({ where: { slug } })
  if (conflict) slug = slug + "-" + Date.now().toString(36)

  const created = await prisma.university.create({
    data: {
      slug,
      name,
      shortName: name,
      location:  "ไม่ระบุ",
      color:     "#16a34a",
    },
  })
  uniCache.set(name, created.id)
  return created.id
}

// Cache: `${universityId}:${programCode}:${normMajor}` → facultyId  (Path A)
//        `${universityId}:slug:${slug}`                 → facultyId  (Path B fallback)
const facCache = new Map<string, string>()

async function upsertFaculty(row: NormalizedRow, universityId: string): Promise<string> {
  const field       = detectField(row.facultyName, row.programName) as never
  const normMajor   = normalizeMajor(row.majorName)
  const normDetail  = normalizeDetail(row.detail, row.facultyName)
  const canonicalData = {
    name:      row.facultyName || row.programName,
    program:   row.programName,
    majorName: row.majorName || null,
    detail:    row.detail    || null,
    field,
  }

  // ── Path A: programCode lookup (stable identity, ~85% of cases) ─────────────
  // Find an existing Faculty in this university that already has a TcasScore
  // with the same programCode + normalizedMajor.  Handles program/detail string
  // changes across TCAS years without creating duplicate Faculty rows.
  if (row.programCode) {
    const cacheKeyA = `${universityId}:${row.programCode}:${normMajor}`
    if (facCache.has(cacheKeyA)) return facCache.get(cacheKeyA)!

    const existingScore = await prisma.tcasScore.findFirst({
      where: {
        programCode: row.programCode,
        faculty: { universityId },
      },
      select: {
        facultyId: true,
        faculty: { select: { majorName: true, programCode: true } },
      },
    })

    if (existingScore) {
      const existNormMajor = normalizeMajor(existingScore.faculty.majorName)
      // Accept if normalizedMajor matches, OR if one side has no major
      // (handles TCAS64 null → TCAS65+ "ภาษาไทย" for programs with no international track)
      if (existNormMajor === normMajor || !existNormMajor || !normMajor) {
        // Update canonical fields to the latest import's strings
        await prisma.faculty.update({
          where: { id: existingScore.facultyId },
          data: { ...canonicalData, programCode: row.programCode },
        })
        facCache.set(cacheKeyA, existingScore.facultyId)
        return existingScore.facultyId
      }
    }
  }

  // ── Path B: slug-based upsert (fallback for COTMES / unstable codes) ─────────
  const slug     = makeFacultySlug(row.universityName, row.facultyName, row.programName, row.majorName, row.detail)
  const cacheKeyB = `${universityId}:slug:${slug}`
  if (facCache.has(cacheKeyB)) return facCache.get(cacheKeyB)!

  const faculty = await prisma.faculty.upsert({
    where:  { universityId_slug: { universityId, slug } },
    update: { ...canonicalData, programCode: row.programCode || null },
    create: {
      universityId,
      slug,
      programCode: row.programCode || null,
      ...canonicalData,
    },
  })

  // Cache under both Path B key AND Path A key (so next row with same code reuses it)
  facCache.set(cacheKeyB, faculty.id)
  if (row.programCode) {
    const cacheKeyA = `${universityId}:${row.programCode}:${normMajor}`
    facCache.set(cacheKeyA, faculty.id)
  }
  return faculty.id
}

async function upsertScore(row: NormalizedRow, facultyId: string): Promise<void> {
  await prisma.tcasScore.upsert({
    where:  { facultyId_year_round: { facultyId, year: row.year, round: 3 } },
    update: {
      programCode: row.programCode || null,
      minScore:    row.minScore,
      avgScore:    row.avgScore,
      maxScore:    row.maxScore,
      seats:       row.seats > 0 ? row.seats : null,
    },
    create: {
      facultyId,
      year:        row.year,
      round:       3,
      programCode: row.programCode || null,
      minScore:    row.minScore,
      avgScore:    row.avgScore,
      maxScore:    row.maxScore,
      seats:       row.seats > 0 ? row.seats : null,
    },
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

const DATA_DIR = join(process.cwd(), "src/data/tcas64-69")

const FILES = [
  { path: join(DATA_DIR, "TCAS64_maxmin - Sheet1.csv"),                  normalize: normalize64, year: 2564 },
  { path: join(DATA_DIR, "TCAS65_maxmin - Sheet1.csv"),                  normalize: normalize65, year: 2565 },
  { path: join(DATA_DIR, "TCAS66_maxmin - maxmin66.csv"),                normalize: normalize66, year: 2566 },
  { path: join(DATA_DIR, "TCAS67_maxmin - Sheet2.csv"),                  normalize: normalize67, year: 2567 },
  { path: join(DATA_DIR, "T68-stat-r3_2-maxmin-24May25 - Sheet1.csv"),   normalize: normalize68, year: 2568 },
]

async function main() {
  console.log("🚀 TCAS Import (v2) — เริ่มต้น\n")

  // Pre-load existing universities
  const existingUnis = await prisma.university.findMany()
  for (const u of existingUnis) uniCache.set(u.name, u.id)
  console.log(`📚 Pre-loaded ${existingUnis.length} universities\n`)

  const grandTotal = { rows: 0, universities: new Set<string>(), faculties: 0, scores: 0 }

  for (const file of FILES) {
    console.log(`📂 Processing TCAS${file.year - 2500}...`)
    const raw        = readCsv(file.path)
    const normalized = file.normalize(raw)
    const cleaned    = clean(normalized, file.year)

    let fileScores = 0
    for (const row of cleaned) {
      grandTotal.universities.add(row.universityName)
      const universityId = await upsertUniversity(row.universityName)
      const facultyId    = await upsertFaculty(row, universityId)
      await upsertScore(row, facultyId)
      fileScores++
    }

    console.log(`  ✅ Imported ${fileScores} scores\n`)
    grandTotal.rows   += cleaned.length
    grandTotal.scores += fileScores
  }

  grandTotal.faculties = facCache.size

  console.log("═══════════════════════════════════")
  console.log("✅ Import เสร็จสมบูรณ์!")
  console.log(`   มหาวิทยาลัย    : ${grandTotal.universities.size}`)
  console.log(`   หลักสูตร/สาขา  : ${grandTotal.faculties}`)
  console.log(`   คะแนนที่นำเข้า : ${grandTotal.scores} records (5 ปี)`)
  console.log("═══════════════════════════════════")
}

main()
  .catch(e => { console.error("❌ Import failed:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
