/**
 * scripts/verify-mbti-matches.ts
 * Inspect top matches for sample MBTI types to sanity-check the algorithm.
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const SAMPLE_TYPES = ["INTJ", "ENFP", "ISFJ", "ESTP"]

async function main() {
  for (const type of SAMPLE_TYPES) {
    console.log(`\n=== ${type} — Top 8 matches ===`)
    const matches = await prisma.facultyMBTIMatch.findMany({
      where:   { mbtiType: type, facultyId: { not: null } },
      orderBy: { rank: "asc" },
      take:    8,
      include: {
        faculty: {
          include: {
            university: { select: { shortName: true } },
            scores: {
              select:  { year: true, minScore: true },
              orderBy: { year: "desc" },
              take:    1,
            },
          },
        },
      },
    })

    matches.forEach((m, i) => {
      const f = m.faculty
      if (!f) return
      const score = f.scores[0]
      const scoreStr = score ? `${score.minScore.toFixed(1)} (${score.year})` : "—"
      console.log(`  ${i + 1}. [${m.score.toFixed(2)}] ${f.university.shortName} — ${f.name}`)
      console.log(`     ${f.program.slice(0, 70)}`)
      console.log(`     cutoff: ${scoreStr}  ·  ${m.reason}`)
    })
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
