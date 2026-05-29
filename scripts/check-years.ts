import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

const rows = await prisma.tcasScore.groupBy({
  by: ["year", "round"],
  _count: { id: true },
  orderBy: [{ year: "asc" }, { round: "asc" }],
})

rows.forEach(r =>
  console.log(`ปี ${r.year} (TCAS${r.year - 2500}) รอบ ${r.round} → ${r._count.id} records`)
)

await prisma.$disconnect()
