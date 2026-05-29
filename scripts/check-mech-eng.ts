import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

const HEADERS = { "Referer": "https://course.mytcas.com/", "User-Agent": "Mozilla/5.0" }

async function main() {
  // หา faculties ที่มี weights ผิดปกติ (มี a_lv_81 หรือ a_lv_82 เป็น key หลัก)
  const rows = await prisma.facultyRequirement.findMany({
    select: {
      weights: true,
      faculty: {
        select: {
          name: true, program: true, field: true,
          university: { select: { name: true } },
          scores: { where: { programCode: { not: null } }, orderBy: { year: "desc" }, take: 1, select: { programCode: true, year: true } },
        },
      },
    },
  })

  const bad = rows.filter(r => {
    const w = r.weights as Record<string, unknown>
    return (typeof w["a_lv_81"] === "number" || typeof w["a_lv_82"] === "number")
      && ["engineering", "science", "medicine", "nursing"].includes(r.faculty.field)
  }).slice(0, 5)

  console.log(`\nตัวอย่าง bad weights (a_lv_81/82 เป็น key หลัก ใน STEM field)\n`)

  for (const row of bad) {
    const f = row.faculty
    const code = f.scores[0]?.programCode
    console.log(`📌 ${f.university.name} | ${f.name} | ${f.program} | field=${f.field}`)
    console.log(`   DB weights: ${JSON.stringify(row.weights)}`)

    if (code) {
      const url = `https://my-tcas.s3.ap-southeast-1.amazonaws.com/mytcas/ly-programs/${code}.json?state=update`
      const res = await fetch(url, { headers: HEADERS })
      if (res.ok) {
        const data = await res.json() as any
        const item = Array.isArray(data) ? data[0] : data
        console.log(`   programCode: ${code}`)
        console.log(`   API program_id: ${item?.program_id}`)
        console.log(`   API scores: ${JSON.stringify(item?.scores)}`)
        if (item?.program_id !== code) {
          console.log(`   ⚠️  MISMATCH program_id ≠ code!`)
        }
      } else {
        console.log(`   API: HTTP ${res.status}`)
      }
    }
    console.log()
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
