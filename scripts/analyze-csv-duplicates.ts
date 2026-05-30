/**
 * Analyze cross-year naming inconsistencies in all TCAS CSVs.
 * Groups rows by programCode across years and shows what changed.
 */
import { parse } from "csv-parse/sync"
import { readFileSync } from "fs"
import { join } from "path"

const DATA_DIR = join(process.cwd(), "src/data/tcas64-69")

type Row = Record<string, string>

function str(v: string | undefined) {
  const s = String(v ?? "").trim()
  return s === "0" ? "" : s
}

// ── Parse each year into a unified shape ─────────────────────────────────────

interface Norm {
  year: number
  programCode: string
  university: string
  faculty: string
  program: string
  major: string
  detail: string
}

function readCsv(file: string): Row[] {
  return parse(readFileSync(file, "utf-8"), {
    columns: true, skip_empty_lines: true, trim: true,
    relax_column_count: true, bom: true,
  }) as Row[]
}

function norm64(rows: Row[]): Norm[] {
  return rows
    .filter(r => str(r["รูปแบบ"]) === "Admission1")
    .map(r => ({
      year: 2564,
      programCode: str(r["รหัสหลักสูตร"]),
      university:  str(r["สถาบัน"]),
      faculty:     str(r["คณะ"]),
      program:     str(r["หลักสูตร"]),
      major:       str(r["แขนง/วิชาเอก"]),
      detail:      str(r["โครงการ"]),
    }))
}

function norm65(rows: Row[]): Norm[] {
  return rows.map(r => ({
    year: 2565,
    programCode: str(r["program_id"]),
    university:  str(r["university_name"]),
    faculty:     str(r["program_lookup_programs.faculty_name_th"]),
    program:     str(r["program_name_th"]),
    major:       str(r["major_name_th"]),
    detail:      str(r["project_name_th"]),
  }))
}

function norm66(rows: Row[]): Norm[] {
  return rows.map(r => ({
    year: 2566,
    programCode: str(r["รหัสหลักสูตร"]),
    university:  str(r["สถาบัน"]),
    faculty:     str(r["คณะ/สำนักวิชา"]),
    program:     str(r["ชื่อหลักสูตร"]),
    major:       str(r["สาขาวิชา/วิชาเอก"]),
    detail:      str(r["รายละเอียด"]),
  }))
}

function norm67(rows: Row[]): Norm[] {
  return rows.map(r => ({
    year: 2567,
    programCode: str(r["รหัสหลักสูตร"]),
    university:  str(r["สถาบัน"]),
    faculty:     str(r["คณะ"]),
    program:     str(r["หลักสูตร"]),
    major:       str(r["สาขา/วิชาเอก"]),
    detail:      str(r["รายละเอียด"]),
  }))
}

function norm68(rows: Row[]): Norm[] {
  return rows.map(r => ({
    year: 2568,
    programCode: str(r["รหัสหลักสูตร"]),
    university:  str(r["สถาบัน"]),
    faculty:     str(r["คณะ"]),
    program:     str(r["หลักสูตร"]),
    major:       str(r["สาขา/วิชาเอก"]),
    detail:      str(r["รายละเอียด"]),
  }))
}

// ── Load all ─────────────────────────────────────────────────────────────────

const all: Norm[] = [
  ...norm64(readCsv(join(DATA_DIR, "TCAS64_maxmin - Sheet1.csv"))),
  ...norm65(readCsv(join(DATA_DIR, "TCAS65_maxmin - Sheet1.csv"))),
  ...norm66(readCsv(join(DATA_DIR, "TCAS66_maxmin - maxmin66.csv"))),
  ...norm67(readCsv(join(DATA_DIR, "TCAS67_maxmin - Sheet2.csv"))),
  ...norm68(readCsv(join(DATA_DIR, "T68-stat-r3_2-maxmin-24May25 - Sheet1.csv"))),
].filter(r => r.programCode)

console.log(`Total rows loaded: ${all.length}`)

// ── Group by (university, programCode) → track name changes ──────────────────

const groups = new Map<string, Norm[]>()
for (const r of all) {
  const key = `${r.university}||${r.programCode}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key)!.push(r)
}

console.log(`Unique (university, programCode) combos: ${groups.size}`)

// ── Find groups with inconsistent names across years ─────────────────────────

type ChangeType =
  | "program_changed"   // program string differs between years
  | "major_changed"     // major added/removed
  | "detail_changed"    // detail changed
  | "faculty_changed"   // faculty name changed (e.g. rename)

interface InconsistentGroup {
  key: string
  university: string
  programCode: string
  changes: ChangeType[]
  rows: Norm[]
}

const inconsistent: InconsistentGroup[] = []

for (const [key, rows] of groups) {
  if (rows.length < 2) continue
  const programs = new Set(rows.map(r => r.program))
  const majors   = new Set(rows.map(r => r.major))
  const details  = new Set(rows.map(r => r.detail))
  const faculties = new Set(rows.map(r => r.faculty))

  const changes: ChangeType[] = []
  if (programs.size > 1)  changes.push("program_changed")
  if (majors.size > 1)    changes.push("major_changed")
  if (details.size > 1)   changes.push("detail_changed")
  if (faculties.size > 1) changes.push("faculty_changed")

  if (changes.length > 0) {
    inconsistent.push({
      key,
      university: rows[0].university,
      programCode: rows[0].programCode,
      changes,
      rows,
    })
  }
}

console.log(`\nGroups with same programCode but different names: ${inconsistent.length}`)

// ── Summarise change types ─────────────────────────────────────────────────

const changeCounts: Record<ChangeType, number> = {
  program_changed: 0, major_changed: 0, detail_changed: 0, faculty_changed: 0,
}
for (const g of inconsistent) {
  for (const c of g.changes) changeCounts[c]++
}
console.log("Change breakdown:")
for (const [type, count] of Object.entries(changeCounts)) {
  console.log(`  ${type}: ${count}`)
}

// ── Show sample of each change type ──────────────────────────────────────────

console.log("\n═══ Sample: program_changed ════════════════════════════════")
for (const g of inconsistent.filter(g => g.changes.includes("program_changed")).slice(0, 6)) {
  console.log(`\n  [${g.university}] code=${g.programCode}`)
  const seen = new Set<string>()
  for (const r of g.rows) {
    const sig = `${r.year}|${r.program}`
    if (!seen.has(sig)) { console.log(`    ${r.year}: "${r.program}"`); seen.add(sig) }
  }
}

console.log("\n═══ Sample: major_changed ══════════════════════════════════")
for (const g of inconsistent.filter(g => g.changes.includes("major_changed")).slice(0, 6)) {
  console.log(`\n  [${g.university}] code=${g.programCode}`)
  const seen = new Set<string>()
  for (const r of g.rows) {
    const sig = `${r.year}|${r.major}`
    if (!seen.has(sig)) { console.log(`    ${r.year}: major="${r.major}"`); seen.add(sig) }
  }
}

console.log("\n═══ Sample: detail_changed ═════════════════════════════════")
for (const g of inconsistent.filter(g => g.changes.includes("detail_changed")).slice(0, 6)) {
  console.log(`\n  [${g.university}] code=${g.programCode}`)
  const seen = new Set<string>()
  for (const r of g.rows) {
    const sig = `${r.year}|${r.detail}`
    if (!seen.has(sig)) { console.log(`    ${r.year}: detail="${r.detail}"`); seen.add(sig) }
  }
}

// ── Count affected universities ───────────────────────────────────────────────

const affectedUnis = new Set(inconsistent.map(g => g.university))
console.log(`\nUniversities affected: ${affectedUnis.size}`)
const uniCounts = new Map<string, number>()
for (const g of inconsistent) {
  uniCounts.set(g.university, (uniCounts.get(g.university) ?? 0) + 1)
}
const topUnis = [...uniCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
console.log("Top universities by number of inconsistent programs:")
for (const [uni, count] of topUnis) {
  console.log(`  ${count.toString().padStart(4)}  ${uni}`)
}

// ── Check: is programCode suffix (last 8 chars) stable? ──────────────────────

console.log("\n═══ programCode suffix stability (COTMES-style codes) ══════")
// Groups where FULL code changes but SUFFIX stays the same
const byUniSuffix = new Map<string, Set<string>>()
for (const r of all) {
  const suffix = r.programCode.slice(-8)
  const key = `${r.university}||${suffix}`
  if (!byUniSuffix.has(key)) byUniSuffix.set(key, new Set())
  byUniSuffix.get(key)!.add(r.programCode)
}
let suffixStableCount = 0
let suffixChangedCount = 0
for (const codes of byUniSuffix.values()) {
  if (codes.size > 1) suffixChangedCount++
  else suffixStableCount++
}
console.log(`  Suffix stable (same full code):   ${suffixStableCount}`)
console.log(`  Suffix reused by multiple codes:  ${suffixChangedCount}`)
