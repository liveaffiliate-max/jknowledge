import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
  const r = await prisma.mBTIResult.findFirst({ orderBy: { createdAt: "desc" } })
  console.log(r?.id)
  await prisma.$disconnect()
}
main()
