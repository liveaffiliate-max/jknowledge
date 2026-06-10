import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

  // Check both: faculty exists AND university slug
  const f = await prisma.faculty.findUnique({
    where: { id: "cmps8m5um00uer8e651iwt2p1" },
    include: { university: { select: { slug: true, shortName: true } } },
  })
  console.log("Direct lookup:", JSON.stringify(f, null, 2))

  // Check the KMUTT university
  const u = await prisma.university.findFirst({
    where: { slug: "kmutt" },
    select: { slug: true, shortName: true, _count: { select: { faculties: true } } },
  })
  console.log("\nKMUTT university:", u)

  await prisma.$disconnect()
}
main()
