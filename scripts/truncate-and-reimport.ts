import { config } from "dotenv"; config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
async function main() {
  const s = await prisma.tcasScore.deleteMany()
  console.log("Deleted TcasScore:", s.count)
  const f = await prisma.faculty.deleteMany()
  console.log("Deleted Faculty  :", f.count)
  const [fc, sc] = await Promise.all([prisma.faculty.count(), prisma.tcasScore.count()])
  console.log("Faculty now:", fc, "| TcasScore now:", sc)
}
main().finally(() => prisma.$disconnect())
