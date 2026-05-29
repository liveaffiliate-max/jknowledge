/**
 * Import Weight Scores + TCAS69 Scores จาก mytcas API
 * Run: npx tsx scripts/import-weights.ts
 *
 * ดึงจาก 2 endpoints:
 *  1. rounds/[programCode].json  → subject weights ปี 2569 (round 3 official)
 *  2. ly-programs/[programCode].json → min_score / max_score ปี 2568 (historical)
 *
 * ⚠️  ly-programs = "last year programs" = weights + scores ปี 2568
 *     rounds       = weights ปี 2569 ที่ประกาศอย่างเป็นทางการ (type: "3_2569")
 *
 * Strategy:
 *   - weights → ดึงจาก rounds (2569) เป็นหลัก, fallback ไป ly-programs ถ้าไม่มี
 *   - min/max  → ดึงจาก ly-programs เท่านั้น (2568 historical actual scores)
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// ── Config ────────────────────────────────────────────────────────────────────

const SCORE_YEAR    = 2568  // ปีของ min_score/max_score ใน ly-programs (historical)
const WEIGHT_YEAR   = 2569  // ปีของ weights ใน rounds (official announced)
const ROUND3_TYPE   = `3_${WEIGHT_YEAR}`  // "3_2569" = round 3, year 2569

const BASE_URL      = "https://my-tcas.s3.ap-southeast-1.amazonaws.com/mytcas"
const TS_PARAM      = "19e6d54d971"   // cache-busting param (S3 ignores, required by CDN)
const BATCH_SIZE    = 20              // concurrent requests per batch
const DELAY_MS      = 200             // delay ระหว่าง batch (ms)

const FETCH_HEADERS = {
  "Referer":    "https://course.mytcas.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
}

// ── Prisma setup ──────────────────────────────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma   = new PrismaClient({ adapter })

// ── Types ─────────────────────────────────────────────────────────────────────

interface RoundsEntry {
  type:   string                        // e.g. "3_2569"
  scores?: Record<string, number>       // เฉพาะ round 3
  receive_student_number?: number | null
}

interface LyProgram {
  program_id:               string
  scores:                   Record<string, number>
  min_score:                number
  max_score:                number
  min_score_ds:             number | null
  max_score_ds:             number | null
  est_min_score_mean:       number | null
  est_min_score_mean_sd:    number | null
  est_min_score_regression: number | null
  receive_student_number:   number | null
}

interface FetchResult {
  weights:    Record<string, number> | null  // จาก rounds (2569) หรือ fallback ly-programs
  minScore:   number | null
  maxScore:   number | null
  seats:      number | null
  estMin:     number | null
  weightYear: number   // ปีของ weights ที่ได้ (2569 หรือ 2568)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/** ดึง weights ปี 2569 จาก rounds endpoint */
async function fetchRoundsWeights(programCode: string): Promise<{ weights: Record<string, number>; seats: number | null } | null> {
  const url = `${BASE_URL}/rounds/${programCode}.json?ts=${TS_PARAM}`
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS })
    if (!res.ok) return null
    const data = await res.json() as RoundsEntry[]
    if (!Array.isArray(data)) return null

    // หา round 3 ของปี 2569
    const round3 = data.find(r => r.type === ROUND3_TYPE)
    if (!round3?.scores || Object.keys(round3.scores).length === 0) return null

    return {
      weights: round3.scores,
      seats:   round3.receive_student_number ?? null,
    }
  } catch {
    return null
  }
}

/** ดึง historical scores + fallback weights จาก ly-programs */
async function fetchLyProgram(programCode: string): Promise<LyProgram | null> {
  const url = `${BASE_URL}/ly-programs/${programCode}.json?state=update`
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS })
    if (!res.ok) {
      if (res.status !== 404) console.warn(`  ⚠️  ${programCode} ly-programs HTTP ${res.status}`)
      return null
    }
    const data = await res.json() as LyProgram[]
    return Array.isArray(data) ? (data[0] ?? null) : data
  } catch (e) {
    console.warn(`  ⚠️  ${programCode} — ${(e as Error).message}`)
    return null
  }
}

/** รวมข้อมูลจากทั้งสอง endpoints */
async function fetchProgram(programCode: string): Promise<FetchResult | null> {
  // ดึงพร้อมกัน
  const [rounds, lyProg] = await Promise.all([
    fetchRoundsWeights(programCode),
    fetchLyProgram(programCode),
  ])

  // weights: ใช้ rounds (2569) ก่อน, fallback → ly-programs (2568)
  let weights: Record<string, number> | null = null
  let weightYear = WEIGHT_YEAR

  if (rounds?.weights) {
    weights = rounds.weights
    weightYear = WEIGHT_YEAR
  } else if (lyProg?.scores && Object.keys(lyProg.scores).length > 0) {
    weights = lyProg.scores
    weightYear = SCORE_YEAR
  }

  // min/max: ใช้จาก ly-programs เท่านั้น (historical actual scores)
  const minScore = lyProg && lyProg.min_score > 0 ? lyProg.min_score : null
  const maxScore = lyProg && lyProg.max_score > 0 ? lyProg.max_score : null
  const seats    = rounds?.seats ?? lyProg?.receive_student_number ?? null
  const estMin   = lyProg?.est_min_score_mean ?? null

  if (!weights && !minScore) return null

  return { weights, minScore, maxScore, seats, estMin, weightYear }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🚀 Import Weights (${WEIGHT_YEAR}) + Scores (${SCORE_YEAR}) — เริ่มต้น\n`)

  const faculties = await prisma.faculty.findMany({
    select: {
      id:   true,
      name: true,
      scores: {
        where:   { programCode: { not: null } },
        orderBy: { year: "desc" },
        take:    1,
        select:  { programCode: true, year: true },
      },
    },
  })

  const codeMap = new Map<string, { id: string; name: string }[]>()
  for (const f of faculties) {
    const latestScore = f.scores[0]
    if (!latestScore?.programCode) continue
    const code = latestScore.programCode
    if (!codeMap.has(code)) codeMap.set(code, [])
    codeMap.get(code)!.push({ id: f.id, name: f.name })
  }

  const codes = [...codeMap.keys()]
  console.log(`📚 Faculty records  : ${faculties.length}`)
  console.log(`🔑 Unique codes     : ${codes.length}`)
  console.log(`📅 Weights year     : ${WEIGHT_YEAR} (rounds endpoint)`)
  console.log(`📅 Scores year      : ${SCORE_YEAR} (ly-programs endpoint)\n`)

  const stats = {
    found: 0, notFound: 0,
    weightsFrom2569: 0, weightsFrom2568: 0,
    scoresSaved: 0, errors: 0,
  }

  for (let i = 0; i < codes.length; i += BATCH_SIZE) {
    const batch = codes.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(code => fetchProgram(code)))

    for (let j = 0; j < batch.length; j++) {
      const code = batch[j]
      const data = results[j]

      if (!data) { stats.notFound++; continue }

      stats.found++
      const facultyList = codeMap.get(code)!

      for (const fac of facultyList) {
        try {
          // ── 1. Upsert FacultyRequirement (weights) ────────────────────────
          if (data.weights) {
            await prisma.facultyRequirement.upsert({
              where:  { facultyId: fac.id },
              update: { year: data.weightYear, weights: data.weights, estMinScore: data.estMin },
              create: { facultyId: fac.id, year: data.weightYear, weights: data.weights, estMinScore: data.estMin },
            })
            if (data.weightYear === WEIGHT_YEAR) stats.weightsFrom2569++
            else stats.weightsFrom2568++
          }

          // ── 2. Upsert TcasScore ปี 2568 (historical) ──────────────────────
          if (data.minScore && data.maxScore) {
            const avgScore = parseFloat(((data.minScore + data.maxScore) / 2).toFixed(4))
            await prisma.tcasScore.upsert({
              where:  { facultyId_year_round: { facultyId: fac.id, year: SCORE_YEAR, round: 3 } },
              update: { programCode: code, minScore: data.minScore, avgScore, maxScore: data.maxScore, seats: data.seats },
              create: { facultyId: fac.id, year: SCORE_YEAR, round: 3, programCode: code, minScore: data.minScore, avgScore, maxScore: data.maxScore, seats: data.seats },
            })
            stats.scoresSaved++
          }
        } catch (e) {
          console.error(`\n  ❌ ${fac.id}: ${(e as Error).message}`)
          stats.errors++
        }
      }
    }

    await sleep(DELAY_MS)

    const done = Math.min(i + BATCH_SIZE, codes.length)
    const pct  = ((done / codes.length) * 100).toFixed(1)
    process.stdout.write(
      `\r  Progress: ${done}/${codes.length} (${pct}%) — found=${stats.found} notFound=${stats.notFound} w69=${stats.weightsFrom2569} w68=${stats.weightsFrom2568}`
    )
  }

  console.log("\n")
  console.log("═══════════════════════════════════════════════════════")
  console.log(`✅ Import เสร็จสมบูรณ์!`)
  console.log(`   พบข้อมูล                     : ${stats.found} codes`)
  console.log(`   ไม่พบ                         : ${stats.notFound} codes`)
  console.log(`   weights ปี 2569 (rounds)     : ${stats.weightsFrom2569} records`)
  console.log(`   weights ปี 2568 (fallback)   : ${stats.weightsFrom2568} records`)
  console.log(`   TcasScore ปี ${SCORE_YEAR} บันทึก   : ${stats.scoresSaved} records`)
  console.log(`   errors                        : ${stats.errors}`)
  console.log("═══════════════════════════════════════════════════════")
}

main()
  .catch(e => {
    console.error("\n❌ Import failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
