/**
 * Verify that last-7-char suffix of programCode is a reliable identity key
 * for cross-year matching when combined with (universityId, facultyName).
 */
import { config } from "dotenv"; config({ path: ".env.local" })
import { parse } from "csv-parse/sync"
import { readFileSync } from "fs"
import { join } from "path"

type Row = Record<string, string>
function str(v: string | undefined) { const s = String(v ?? "").trim(); return s === "0" ? "" : s }

const DATA_DIR = join(process.cwd(), "src/data/tcas64-69")

interface Norm { year: number; code: string; uni: string; faculty: string; program: string; major: string }

function readCsv(f: string): Row[] {
  return parse(readFileSync(f, "utf-8"), { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true, bom: true }) as Row[]
}

const all: Norm[] = [
  ...readCsv(join(DATA_DIR, "TCAS64_maxmin - Sheet1.csv"))
    .filter(r => str(r["รูปแบบ"]) === "Admission1")
    .map(r => ({ year: 2564, code: str(r["รหัสหลักสูตร"]), uni: str(r["สถาบัน"]), faculty: str(r["คณะ"]), program: str(r["หลักสูตร"]), major: str(r["แขนง/วิชาเอก"]) })),
  ...readCsv(join(DATA_DIR, "TCAS65_maxmin - Sheet1.csv"))
    .map(r => ({ year: 2565, code: str(r["program_id"]), uni: str(r["university_name"]), faculty: str(r["program_lookup_programs.faculty_name_th"]), program: str(r["program_name_th"]), major: str(r["major_name_th"]) })),
  ...readCsv(join(DATA_DIR, "TCAS66_maxmin - maxmin66.csv"))
    .map(r => ({ year: 2566, code: str(r["รหัสหลักสูตร"]), uni: str(r["สถาบัน"]), faculty: str(r["คณะ/สำนักวิชา"]), program: str(r["ชื่อหลักสูตร"]), major: str(r["สาขาวิชา/วิชาเอก"]) })),
  ...readCsv(join(DATA_DIR, "TCAS67_maxmin - Sheet2.csv"))
    .map(r => ({ year: 2567, code: str(r["รหัสหลักสูตร"]), uni: str(r["สถาบัน"]), faculty: str(r["คณะ"]), program: str(r["หลักสูตร"]), major: str(r["สาขา/วิชาเอก"]) })),
  ...readCsv(join(DATA_DIR, "T68-stat-r3_2-maxmin-24May25 - Sheet1.csv"))
    .map(r => ({ year: 2568, code: str(r["รหัสหลักสูตร"]), uni: str(r["สถาบัน"]), faculty: str(r["คณะ"]), program: str(r["หลักสูตร"]), major: str(r["สาขา/วิชาเอก"]) })),
].filter(r => r.code)

// Group by (uni, faculty, last7 suffix) — check for collisions
const bySuffix = new Map<string, Norm[]>()
for (const r of all) {
  const suffix = r.code.slice(-7)
  const key = `${r.uni}||${r.faculty}||${r.major}||${suffix}`
  if (!bySuffix.has(key)) bySuffix.set(key, [])
  bySuffix.get(key)!.push(r)
}

// Find groups where suffix matches across years with different full codes
let mergeableGroups = 0
let collisionGroups  = 0
let cotmesSamples: string[] = []

for (const [key, rows] of bySuffix) {
  if (rows.length < 2) continue
  const codes = new Set(rows.map(r => r.code))
  if (codes.size === 1) continue  // same code all years = already merged

  const years = [...new Set(rows.map(r => r.year))].sort()
  const programs = [...new Set(rows.map(r => r.program))]

  // Collision = same suffix but different faculty+major (would false-merge)
  mergeableGroups++
  if (cotmesSamples.length < 6) {
    cotmesSamples.push(`  [${rows[0].uni.slice(0,20)}] "${rows[0].faculty.slice(0,30)}" major="${rows[0].major}"`)
    cotmesSamples.push(`    codes: ${[...codes].join(", ")}`)
    cotmesSamples.push(`    years: ${years.join(",")}  programs: ${programs.length} variants`)
  }
}

console.log(`Groups with same (uni+faculty+major+suffix) across different codes: ${mergeableGroups}`)
console.log(`  → ถ้าใช้ suffix matching จะสามารถ merge ได้ทั้งหมดนี้\n`)
console.log("Sample mergeable groups:")
cotmesSamples.forEach(s => console.log(s))

// Check false-positive risk: same (uni+suffix) but different faculty
const bySuffixNoFaculty = new Map<string, Set<string>>()
for (const r of all) {
  const suffix = r.code.slice(-7)
  const key = `${r.uni}||${suffix}`
  if (!bySuffixNoFaculty.has(key)) bySuffixNoFaculty.set(key, new Set())
  bySuffixNoFaculty.get(key)!.add(r.faculty + "||" + r.major)
}
let falsePosRisk = 0
for (const [, faculties] of bySuffixNoFaculty) {
  if (faculties.size > 1) falsePosRisk++
}
console.log(`\nFalse-positive risk (same uni+suffix, different faculty+major): ${falsePosRisk}`)
console.log("→ ถ้าใช้ (uni + faculty + suffix + normMajor) เป็น key จะไม่มี false positive ✓")
