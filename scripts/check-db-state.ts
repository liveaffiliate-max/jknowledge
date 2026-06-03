import { config } from "dotenv"; config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { normalizeDetail, normalizeMajor, normalizeProgram } from "../src/lib/normalize-faculty"
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const [fac, score, req] = await Promise.all([
    prisma.faculty.count(),
    prisma.tcasScore.count(),
    prisma.facultyRequirement.count(),
  ])
  console.log("═══ DB Summary ═══════════════════════════")
  console.log("Faculty           :", fac, " (เดิม 7,688)")
  console.log("TcasScore         :", score)
  console.log("FacultyRequirement:", req)

  const years = await prisma.tcasScore.groupBy({ by: ["year"], _count: { id: true }, orderBy: { year: "asc" } })
  console.log("\nScores per year:")
  for (const y of years) console.log(`  TCAS${y.year - 2500}: ${y._count.id}`)

  // Faculty ที่มีข้อมูลครบ 5 ปี (64-68)
  const full5 = await prisma.faculty.count({
    where: {
      AND: [
        { scores: { some: { year: 2564 } } },
        { scores: { some: { year: 2565 } } },
        { scores: { some: { year: 2568 } } },
      ],
    },
  })
  console.log("\nFaculty ที่มีข้อมูล ≥3 ปี (TCAS64, 65, 68):", full5)

  // Faculty ที่มี programCode
  const withCode = await prisma.faculty.count({ where: { programCode: { not: null } } })
  console.log("Faculty ที่มี programCode:", withCode, `(${((withCode/fac)*100).toFixed(1)}%)`)

  // ═══ Case study: ทันต จุฬา (COTMES) ════════════════════════════
  console.log("\n═══ ทันตแพทย์ จุฬา (COTMES case) ════════")
  const dent = await prisma.faculty.findMany({
    where: { name: { contains: "ทันตแพทยศาสตร์ จุฬา" } },
    include: { scores: { select: { year: true }, orderBy: { year: "asc" } } },
  })
  console.log(`Rows: ${dent.length}  (ควรเป็น 1–2)`)
  for (const d of dent) {
    console.log(`  code=${d.programCode} program="${d.program}" major="${d.majorName}" years=[${d.scores.map(s=>s.year).join(",")}]`)
  }

  // ═══ Case study: วิศวะ จุฬา (regular uni, should be 1 row) ════
  console.log("\n═══ วิศวกรรมคอมพิวเตอร์ จุฬา (regular case) ═")
  const cs = await prisma.faculty.findMany({
    where: { name: { contains: "วิศวกรรมศาสตร์" }, university: { slug: "chulalongkorn-university" }, program: { contains: "คอมพิวเตอร์" } },
    include: { scores: { select: { year: true }, orderBy: { year: "asc" } } },
  })
  for (const d of cs) {
    console.log(`  code=${d.programCode} program="${d.program}" major="${d.majorName}" years=[${d.scores.map(s=>s.year).join(",")}]`)
  }

  // ═══ Duplicate check: Faculty ที่มี programCode เหมือนกันใน uni เดียวกัน ════
  console.log("\n═══ Remaining duplicates (same uni+code+normMajor) ═")
  const allFacs = await prisma.faculty.findMany({
    select: { id: true, universityId: true, programCode: true, majorName: true, name: true, program: true },
    where: { programCode: { not: null } },
  })
  const groups = new Map<string, typeof allFacs>()
  for (const f of allFacs) {
    const key = `${f.universityId}:${f.programCode}:${normalizeMajor(f.majorName)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(f)
  }
  const dups = [...groups.values()].filter(g => g.length > 1)
  console.log(`Duplicate groups: ${dups.length}`)
  for (const g of dups.slice(0, 5)) {
    console.log(`  code=${g[0].programCode} major="${g[0].majorName}"`)
    for (const f of g) console.log(`    name="${f.name}" prog="${f.program}"`)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
