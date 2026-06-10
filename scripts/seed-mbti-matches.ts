/**
 * scripts/seed-mbti-matches.ts
 *
 * Generate FacultyMBTIMatch rows that LINK real Faculty rows
 * to each of the 16 MBTI types.
 *
 * Strategy:
 *  - Pull all faculties that have at least one TcasScore
 *  - For each MBTI type, score every faculty via matchFacultyToType()
 *  - Keep top N per type (default 20) — sorted by score desc, then latest minScore asc
 *  - Insert as new rows with facultyId set
 *  - Leave existing field-label-only rows (facultyId=null) untouched as fallback
 *
 * Run: npx tsx scripts/seed-mbti-matches.ts
 *      npx tsx scripts/seed-mbti-matches.ts --wipe   ← also delete linked rows first
 *      npx tsx scripts/seed-mbti-matches.ts --top 30 ← override top N
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  ALL_MBTI_TYPES,
  matchFacultyToType,
  type MBTIType,
} from "../src/server/mbti-matching"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const TOP_N = (() => {
  const idx = process.argv.indexOf("--top")
  if (idx === -1) return 20
  return parseInt(process.argv[idx + 1] ?? "20", 10)
})()

const WIPE = process.argv.includes("--wipe")

async function main() {
  console.log(`\n=== SEED FacultyMBTIMatch — top ${TOP_N} per type ===\n`)

  if (WIPE) {
    const { count } = await prisma.facultyMBTIMatch.deleteMany({
      where: { facultyId: { not: null } },
    })
    console.log(`Wiped ${count} existing linked rows.\n`)
  }

  // 1. Fetch faculties with latest TcasScore (for sorting)
  console.log("Loading faculties + latest scores …")
  const faculties = await prisma.faculty.findMany({
    where: { scores: { some: {} } },
    select: {
      id:        true,
      field:     true,
      name:      true,
      program:   true,
      majorName: true,
      scores: {
        select:  { year: true, minScore: true },
        orderBy: { year: "desc" },
        take:    1,
      },
    },
  })
  console.log(`  Loaded ${faculties.length} faculties\n`)

  // 2. For each type, score all faculties and keep top N
  let totalInserted = 0
  for (const type of ALL_MBTI_TYPES) {
    const scored = faculties.map((f) => {
      const m = matchFacultyToType(type as MBTIType, {
        field:     f.field,
        name:      f.name,
        program:   f.program,
        majorName: f.majorName,
      })
      return {
        facultyId: f.id,
        score:     m.score,
        reason:    m.reason,
        field:     f.field,
        minScore:  f.scores[0]?.minScore ?? Number.POSITIVE_INFINITY,
      }
    })

    // Sort: highest match score first; ties broken by competitive (higher minScore) first
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.minScore - a.minScore
    })

    const top = scored.slice(0, TOP_N)

    // 3. Upsert each as a linked row
    let typeInserted = 0
    for (let i = 0; i < top.length; i++) {
      const row = top[i]
      await prisma.facultyMBTIMatch.upsert({
        where: { mbtiType_facultyId: { mbtiType: type, facultyId: row.facultyId } },
        create: {
          mbtiType:  type,
          facultyId: row.facultyId,
          field:     row.field, // keep field label for display fallback
          score:     row.score,
          reason:    row.reason,
          rank:      i + 1,
        },
        update: {
          score:  row.score,
          reason: row.reason,
          rank:   i + 1,
          field:  row.field,
        },
      })
      typeInserted++
    }
    totalInserted += typeInserted
    const topScore = top[0]?.score.toFixed(3) ?? "-"
    const bottomScore = top[top.length - 1]?.score.toFixed(3) ?? "-"
    console.log(`  ${type}: ${typeInserted} matches (score range ${bottomScore} → ${topScore})`)
  }

  console.log(`\nTotal inserted/updated: ${totalInserted} rows`)
  console.log("\n=== DONE ===\n")

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
