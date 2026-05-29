import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── ปีที่มีใน DB ────────────────────────────────────────────────────────────
  console.log("=== ข้อมูลปีใน TcasScore ===")
  const yearRows = await prisma.tcasScore.groupBy({
    by: ["year", "round"],
    _count: { id: true },
    orderBy: [{ year: "asc" }, { round: "asc" }],
  })
  yearRows.forEach(r =>
    console.log(`  ปี ${r.year} (TCAS${r.year - 2500})  รอบ ${r.round}  →  ${r._count.id} records`)
  )
  const total = await prisma.tcasScore.count()
  console.log(`  รวม: ${total} records\n`)

  // Top 5 universities by faculty count
  const unis = await prisma.university.findMany({
    include: { _count: { select: { faculties: true } } },
    orderBy: { faculties: { _count: "desc" } },
    take: 5,
  })
  console.log("Top 5 universities by faculty count:")
  unis.forEach(u => console.log(" ", u._count.faculties, `\t${u.name}`))

  // Sample faculties ของมหาลัยที่มีเยอะสุด
  const topUni = unis[0]
  const faculties = await prisma.faculty.findMany({
    where: { universityId: topUni.id },
    orderBy: { name: "asc" },
    take: 40,
    include: { _count: { select: { scores: true } } },
  })
  console.log(`\nSample faculties of "${topUni.name}" (first 40):`)
  faculties.forEach(f => {
    console.log(`  [${f._count.scores}s] name="${f.name}" | prog="${f.program}" | major="${f.majorName ?? ""}" | detail="${f.detail ?? ""}"`)
  })

  // หา faculty ที่ name+program ซ้ำมากที่สุด (display duplicates)
  console.log("\n--- Display-level duplicates (same name+program) ---")
  const all = await prisma.faculty.findMany({
    orderBy: [{ universityId: "asc" }, { name: "asc" }],
    include: { _count: { select: { scores: true } } },
  })
  const displayMap = new Map<string, typeof all>()
  for (const f of all) {
    const key = `${f.universityId}||${f.name}||${f.program}`
    if (!displayMap.has(key)) displayMap.set(key, [])
    displayMap.get(key)!.push(f)
  }
  const dupDisplay = [...displayMap.entries()]
    .filter(([, v]) => v.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)

  if (dupDisplay.length === 0) {
    console.log("  ✅ ไม่มี display-level duplicates!")
  } else {
    for (const [key, group] of dupDisplay) {
      const [, name, program] = key.split("||")
      console.log(`\n  [${group.length}x] name="${name}" | prog="${program}"`)
      group.forEach(f => console.log(`       major="${f.majorName ?? ""}" | detail="${f.detail ?? ""}" | scores=${f._count.scores}`))
    }
  }
}

main().finally(() => prisma.$disconnect())
