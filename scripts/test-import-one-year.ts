/**
 * Test new programCode-based import logic on TCAS68 only (dry-run, in-memory).
 * Preloads existing TcasScore programCodes from DB, then simulates Path A/B matching.
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { parse } from "csv-parse/sync"
import { readFileSync } from "fs"
import { join } from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { normalizeMajor } from "../src/lib/normalize-faculty"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Row = Record<string, string>
function str(v: string | undefined) { const s = String(v ?? "").trim(); return s === "0" ? "" : s }
function num(v: string | undefined) { return parseFloat(String(v ?? "").replace(/,/g, "").trim()) || 0 }

function readCsv(file: string): Row[] {
  return parse(readFileSync(file, "utf-8"), {
    columns: true, skip_empty_lines: true, trim: true,
    relax_column_count: true, bom: true,
  }) as Row[]
}

function norm68(rows: Row[]) {
  return rows.map(r => ({
    programCode: str(r["รหัสหลักสูตร"]),
    university:  str(r["สถาบัน"]),
    program:     str(r["หลักสูตร"]),
    major:       str(r["สาขา/วิชาเอก"]),
    min2: num(r["คะแนนต่ำสุด ประมวลผลครั้งที่ 2"]),
    min1: num(r["คะแนนต่ำสุด ประมวลผลครั้งที่ 1"]),
    max2: num(r["คะแนนสูงสุด ประมวลผลครั้งที่ 2"]),
    max1: num(r["คะแนนสูงสุด ประมวลผลครั้งที่ 1"]),
  })).map(r => ({ ...r, minScore: r.min2 || r.min1, maxScore: r.max2 || r.max1 }))
    .filter(r => r.programCode && r.minScore > 0 && r.maxScore > 0 && r.maxScore <= 100 && r.minScore < r.maxScore)
}

async function main() {
  const DATA_DIR = join(process.cwd(), "src/data/tcas64-69")
  const rows = norm68(readCsv(join(DATA_DIR, "T68-stat-r3_2-maxmin-24May25 - Sheet1.csv")))
  console.log(`TCAS68 clean rows: ${rows.length}`)

  // ── Preload all existing data into memory ─────────────────────────────────
  console.log("Loading existing Faculty + TcasScore from DB...")

  const unis = await prisma.university.findMany({ select: { id: true, name: true } })
  const uniMap = new Map(unis.map(u => [u.name, u.id]))

  // key: `${universityId}:${programCode}` → Set of normalized major names
  const existingIndex = new Map<string, Set<string>>()

  const scores = await prisma.tcasScore.findMany({
    where: { programCode: { not: null } },
    select: {
      programCode: true,
      faculty: { select: { universityId: true, majorName: true } },
    },
  })
  for (const s of scores) {
    if (!s.programCode) continue
    const key = `${s.faculty.universityId}:${s.programCode}`
    if (!existingIndex.has(key)) existingIndex.set(key, new Set())
    existingIndex.get(key)!.add(normalizeMajor(s.faculty.majorName))
  }
  console.log(`Loaded ${existingIndex.size} unique (uni, programCode) pairs\n`)

  // ── Simulate Path A / B for each TCAS68 row ───────────────────────────────
  let pathA = 0
  let pathB = 0
  let pathX = 0

  const pathBSamples: string[] = []

  for (const r of rows) {
    const uniId = uniMap.get(r.university)
    if (!uniId) { pathX++; continue }

    const normMajor = normalizeMajor(r.major)
    const key = `${uniId}:${r.programCode}`
    const existingMajors = existingIndex.get(key)

    if (existingMajors) {
      // Check if normalizedMajor matches (or either side is empty)
      const matches = [...existingMajors].some(m => m === normMajor || !m || !normMajor)
      if (matches) {
        pathA++
        continue
      }
    }

    pathB++
    if (pathBSamples.length < 8) {
      pathBSamples.push(`  [${r.university}] code=${r.programCode} program="${r.program}" major="${r.major}"`)
    }
  }

  const total = pathA + pathB + pathX
  console.log(`Path A (programCode hit) : ${pathA.toString().padStart(5)}  (${((pathA/total)*100).toFixed(1)}%)  ← reuses existing Faculty`)
  console.log(`Path B (slug fallback)   : ${pathB.toString().padStart(5)}  (${((pathB/total)*100).toFixed(1)}%)  ← creates/updates by slug`)
  console.log(`Path X (new university)  : ${pathX.toString().padStart(5)}`)
  console.log(`\nPath B samples (would use slug fallback):`)
  pathBSamples.forEach(s => console.log(s))

  await prisma.$disconnect()
}
main().catch(console.error)
