/**
 * scripts/audit-mbti.ts
 * Audit current MBTI data state in production DB
 * Run: npx tsx scripts/audit-mbti.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  console.log("\n=== MBTI DATA AUDIT ===\n")

  // 1. MBTIQuestion
  const qCount = await prisma.mBTIQuestion.count()
  const qActiveCount = await prisma.mBTIQuestion.count({ where: { active: true } })
  console.log(`MBTIQuestion: ${qCount} total (${qActiveCount} active)`)

  // 2. MBTIProfile
  const pCount = await prisma.mBTIProfile.count()
  const profiles = await prisma.mBTIProfile.findMany({
    select: { type: true, nickname: true },
    orderBy: { type: "asc" },
  })
  console.log(`MBTIProfile: ${pCount}/16 types`)
  if (pCount > 0 && pCount < 16) {
    const seeded = new Set(profiles.map((p) => p.type))
    const all16 = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
                   "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"]
    const missing = all16.filter((t) => !seeded.has(t))
    console.log(`  Missing: ${missing.join(", ")}`)
  }

  // 3. FacultyMBTIMatch
  const mCount = await prisma.facultyMBTIMatch.count()
  console.log(`FacultyMBTIMatch: ${mCount} rows`)
  if (mCount > 0) {
    const byType = await prisma.facultyMBTIMatch.groupBy({
      by: ["mbtiType"],
      _count: true,
      orderBy: { mbtiType: "asc" },
    })
    console.log("  By type:")
    byType.forEach((b) => console.log(`    ${b.mbtiType}: ${b._count} matches`))
    const sample = await prisma.facultyMBTIMatch.findFirst()
    console.log("  Sample row:", sample)
  }

  // 4. MBTIResult (user submissions)
  const rCount = await prisma.mBTIResult.count()
  const rAuthCount = await prisma.mBTIResult.count({ where: { userId: { not: null } } })
  console.log(`MBTIResult: ${rCount} total (${rAuthCount} from signed-in users)`)

  // 5. Faculty + scoring context
  const fCount = await prisma.faculty.count()
  const fWithScore = await prisma.faculty.count({
    where: { scores: { some: {} } },
  })
  console.log(`Faculty: ${fCount} total (${fWithScore} have TcasScore)`)

  // 6. FacultyField distribution (for matching algo)
  const fields = await prisma.faculty.groupBy({
    by: ["field"],
    _count: true,
    orderBy: { _count: { field: "desc" } },
  })
  console.log("\nFacultyField distribution:")
  fields.forEach((f) => console.log(`  ${f.field}: ${f._count}`))

  console.log("\n=== END AUDIT ===\n")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
