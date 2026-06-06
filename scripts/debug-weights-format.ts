import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const reqs = await prisma.facultyRequirement.findMany({
    include: { faculty: { include: { university: true } } },
  })

  const withCal = reqs.filter(r => {
    const w = r.weights as Record<string, unknown>
    return Object.keys(w).some(k => k.startsWith("cal_"))
  })

  console.log(`Total FacultyRequirement: ${reqs.length}`)
  console.log(`With cal_* keys: ${withCal.length}`)

  // Show first 3 examples
  for (const r of withCal.slice(0, 3)) {
    console.log(`\n=== ${r.faculty.university.name.slice(0, 25)} · ${r.faculty.name.slice(0, 30)}`)
    console.log(JSON.stringify(r.weights, null, 2))
  }

  // Count distinct key patterns
  const keyPatterns = new Map<string, number>()
  for (const r of reqs) {
    const keys = Object.keys(r.weights as Record<string, unknown>)
      .filter(k => k.startsWith("cal_"))
      .sort().join("|")
    if (keys) keyPatterns.set(keys, (keyPatterns.get(keys) ?? 0) + 1)
  }
  console.log("\n=== cal_* key patterns ===")
  for (const [pattern, count] of [...keyPatterns.entries()].sort((a,b) => b[1]-a[1]).slice(0,5)) {
    console.log(`  ${count}x  ${pattern}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
