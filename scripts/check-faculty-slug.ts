import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

  const SUSPECT = "cmps8kwe9003gr8e6r9l45p3w"

  console.log("\n1. Check if SUSPECT is an id:")
  const byId = await prisma.faculty.findUnique({
    where:  { id: SUSPECT },
    select: { id: true, slug: true, name: true, universityId: true, university: { select: { slug: true } } },
  })
  console.log(byId ? `  ✅ found as id: ${JSON.stringify(byId, null, 2)}` : "  ❌ not found as id")

  console.log("\n2. Check if SUSPECT is a slug:")
  const bySlug = await prisma.faculty.findFirst({
    where:  { slug: SUSPECT },
    select: { id: true, slug: true, name: true, universityId: true, university: { select: { slug: true } } },
  })
  console.log(bySlug ? `  ✅ found as slug: ${JSON.stringify(bySlug, null, 2)}` : "  ❌ not found as slug")

  console.log("\n3. Sample faculty rows — what does slug normally look like?")
  const samples = await prisma.faculty.findMany({
    take: 5,
    select: { id: true, slug: true, name: true },
  })
  samples.forEach((s) => {
    console.log(`  id=${s.id.slice(0,10)}… slug=${s.slug.slice(0,40)} name=${s.name}`)
  })

  console.log("\n4. Sample top MBTI match for INTJ — what links would my list generate?")
  const matches = await prisma.facultyMBTIMatch.findMany({
    where: { mbtiType: "INTJ", facultyId: { not: null } },
    orderBy: { rank: "asc" },
    take: 3,
    include: { faculty: { select: { id: true, slug: true, name: true, university: { select: { slug: true } } } } },
  })
  matches.forEach((m) => {
    const f = m.faculty!
    console.log(`  rank=${m.rank}: /scores/${f.university.slug}/${f.slug}`)
    console.log(`           (correct ID-based: /scores/${f.university.slug}/${f.id})`)
  })

  await prisma.$disconnect()
}
main()
