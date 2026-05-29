import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const unis = await prisma.university.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true, shortName: true },
  })
  console.log("=== University Slugs ===")
  unis.forEach(u => {
    console.log(`slug="${u.slug}" | name="${u.name}" | short="${u.shortName}"`)
  })

  // Check first faculty slug too
  const fac = await prisma.faculty.findFirst({
    select: { slug: true, name: true, universityId: true },
  })
  console.log("\n=== Sample Faculty Slug ===")
  console.log(`slug="${fac?.slug}" | name="${fac?.name}"`)
}

main().finally(() => prisma.$disconnect())
