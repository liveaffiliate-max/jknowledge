import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { normalizeDetail, normalizeMajor, normalizeProgram } from "../src/lib/normalize-faculty"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── หา university ที่มีคณะทันต ────────────────────────────────────────────
  const unis = await prisma.university.findMany({
    where: { faculties: { some: { name: { contains: "ทันต" } } } },
    select: { slug: true, name: true, id: true },
  })
  console.log("Universities with ทันต faculty:")
  for (const u of unis) console.log(" ", u.slug, "=", u.name)

  // ── ดู all ทันต rows ──────────────────────────────────────────────────────
  const rows = await prisma.faculty.findMany({
    where: { name: { contains: "ทันต" } },
    include: {
      university: { select: { name: true } },
      scores: { select: { year: true }, orderBy: { year: "asc" } },
    },
    orderBy: [{ universityId: "asc" }, { program: "asc" }],
  })

  console.log(`\nทันต rows ทั้งหมด: ${rows.length}`)
  for (const r of rows) {
    console.log("---")
    console.log("uni    :", r.university.name)
    console.log("program:", r.program, "→", normalizeProgram(r.program))
    console.log("major  :", r.majorName, "→", normalizeMajor(r.majorName))
    console.log("detail :", r.detail, "→", normalizeDetail(r.detail, r.name))
    console.log("years  :", r.scores.map((s) => s.year).join(", "))
  }

  // ── scan all faculties across all unis for remaining dups (norm program) ──
  const allFacs = await prisma.faculty.findMany({
    include: {
      scores: { select: { year: true } },
      university: { select: { name: true, id: true } },
    },
  })

  const groups = new Map<string, typeof allFacs>()
  for (const f of allFacs) {
    const key = [
      f.universityId,
      f.name,
      normalizeProgram(f.program),
      normalizeMajor(f.majorName),
      normalizeDetail(f.detail, f.name),
    ].join("|")
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(f)
  }

  const dupGroups = [...groups.values()].filter((g) => g.length > 1)
  console.log(`\n\nDuplicate groups (norm program+major+detail): ${dupGroups.length}`)
  for (const g of dupGroups.slice(0, 8)) {
    console.log(`\n  [${g[0].university.name}] name="${g[0].name}"`)
    for (const f of g) {
      console.log(`    prog="${f.program}" major="${f.majorName}" detail="${f.detail}" years=[${f.scores.map(s => s.year).join(",")}]`)
    }
  }

  await prisma.$disconnect()
}
main().catch(console.error)
