import { config } from "dotenv"; config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  // ── Full details of all ทันต จุฬา Faculty rows ──────────────────────────────
  const rows = await prisma.faculty.findMany({
    where: { name: { contains: "ทันตแพทยศาสตร์ จุฬา" } },
    include: { scores: { orderBy: { year: "asc" } } },
  })
  console.log(`Faculty rows matching "ทันตแพทยศาสตร์ จุฬา": ${rows.length}\n`)
  for (const r of rows) {
    console.log(`id=${r.id}`)
    console.log(`  name="${r.name}"`)
    console.log(`  program="${r.program}"`)
    console.log(`  majorName="${r.majorName}"`)
    console.log(`  programCode="${r.programCode}"`)
    console.log(`  slug="${r.slug}"`)
    console.log(`  scores=[${r.scores.map(s=>`${s.year}/${s.round}(code=${s.programCode})`).join(", ")}]`)
    console.log()
  }

  // ── COTMES university ID ──────────────────────────────────────────────────
  const cotmes = await prisma.university.findFirst({ where: { name: { contains: "กลุ่มสถาบันแพทย" } } })
  console.log(`COTMES uni: id=${cotmes?.id} slug=${cotmes?.slug}\n`)

  // ── All Faculty rows at COTMES with code ending in 120101A ───────────────
  const sfxRows = await prisma.faculty.findMany({
    where: {
      universityId: cotmes?.id,
      programCode: { endsWith: "120101A" },
    },
    include: { scores: { select: { year: true } } },
  })
  console.log(`COTMES Faculty rows with programCode ending in 120101A: ${sfxRows.length}`)
  for (const r of sfxRows) {
    console.log(`  code=${r.programCode} name="${r.name}" major="${r.majorName}" years=[${r.scores.map(s=>s.year).join(",")}]`)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
