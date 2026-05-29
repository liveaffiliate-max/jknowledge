import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ดู distinct detail values ที่ไม่ใช่ Admission pattern
  const all = await prisma.faculty.findMany({
    select: { detail: true, name: true, program: true, majorName: true },
  })

  // จัด group ตาม prefix pattern
  const groups = new Map<string, number>()
  for (const r of all) {
    const d = r.detail?.trim() ?? ""
    if (!d) continue
    // เอาแค่ prefix 30 ตัวแรก
    const prefix = d.slice(0, 30)
    groups.set(prefix, (groups.get(prefix) ?? 0) + 1)
  }

  console.log("=== Top 30 Detail prefixes (non-empty) ===")
  ;[...groups.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([p, c]) => console.log(`  [${c}x] "${p}"`))

  console.log("\n=== Distinct detail values that are SHORT (≤30 chars) ===")
  const shorts = new Map<string, number>()
  for (const r of all) {
    const d = r.detail?.trim() ?? ""
    if (d && d.length <= 30) shorts.set(d, (shorts.get(d) ?? 0) + 1)
  }
  ;[...shorts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .forEach(([d, c]) => console.log(`  [${c}x] "${d}"`))
}

main().finally(() => prisma.$disconnect())
