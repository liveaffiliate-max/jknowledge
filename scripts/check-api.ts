/**
 * ตรวจสอบข้อมูลจาก mytcas API โดยตรง
 * Run: npx tsx scripts/check-api.ts
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

const BASE_URL = "https://my-tcas.s3.ap-southeast-1.amazonaws.com/mytcas"
const HEADERS  = {
  "Referer":    "https://course.mytcas.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

async function main() {
  // 1. ดึง programCode ของ engineering + science + medicine จาก DB
  const rows = await prisma.faculty.findMany({
    where: {
      field: { in: ["engineering", "science", "medicine", "nursing"] },
    },
    select: {
      id: true,
      name: true,
      program: true,
      field: true,
      scores: {
        where:   { programCode: { not: null } },
        orderBy: { year: "desc" },
        take: 1,
        select:  { programCode: true, year: true },
      },
      requirement: { select: { weights: true } },
    },
    take: 20,
  })

  console.log(`\nตรวจ ${rows.length} faculties จาก DB\n`)
  console.log("═".repeat(60))

  for (const f of rows) {
    const score = f.scores[0]
    if (!score?.programCode) continue

    const url = `${BASE_URL}/ly-programs/${score.programCode}.json?state=update`
    const res  = await fetch(url, { headers: HEADERS })

    if (!res.ok) {
      console.log(`❌ ${score.programCode} → HTTP ${res.status}`)
      continue
    }

    const data = await res.json() as any
    const item = Array.isArray(data) ? data[0] : data

    console.log(`\n📌 DB: ${f.name} | ${f.program} | field=${f.field}`)
    console.log(`   programCode: ${score.programCode} (year=${score.year})`)
    console.log(`   DB weights:  ${JSON.stringify(f.requirement?.weights)}`)
    console.log(`   API program_id: ${item?.program_id}`)
    console.log(`   API scores:     ${JSON.stringify(item?.scores)}`)

    // ตรวจว่า program_id ตรงกับ programCode ไหม
    if (item?.program_id && item.program_id !== score.programCode) {
      console.log(`   ⚠️  MISMATCH: DB code=${score.programCode} ≠ API program_id=${item.program_id}`)
    }
  }

  console.log("\n" + "═".repeat(60))
  console.log("✅ เสร็จ")
}

main()
  .catch(e => { console.error("❌", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
