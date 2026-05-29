import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

const LANG_KEYS = new Set(["a_lv_81","a_lv_82","a_lv_83","a_lv_84","a_lv_85","a_lv_86"])
const STEM_FIELDS = new Set(["engineering","science","medicine","nursing","pharmacy","dentistry","architecture","ict"])
const INTL_RE = /นานาชาติ|international/i

async function main() {
  const rows = await prisma.facultyRequirement.findMany({
    select: {
      weights: true,
      faculty: {
        select: {
          name: true,
          program: true,
          field: true,
          university: { select: { name: true } },
        },
      },
    },
  })

  const byUni = new Map<string, { bad: number; total: number; samples: string[] }>()

  for (const r of rows) {
    const uni = r.faculty.university.name
    const f = r.faculty
    const w = r.weights as Record<string, unknown>
    const isIntl = INTL_RE.test(`${f.name} ${f.program}`)
    const isStem = STEM_FIELDS.has(f.field)
    const langInKeys = Object.keys(w).some(k => LANG_KEYS.has(k) && typeof w[k] === "number")

    if (!byUni.has(uni)) byUni.set(uni, { bad: 0, total: 0, samples: [] })
    const entry = byUni.get(uni)!
    entry.total++
    if (isStem && langInKeys && !isIntl) {
      entry.bad++
      if (entry.samples.length < 2) {
        const langK = Object.keys(w).filter(k => LANG_KEYS.has(k) && typeof w[k] === "number")
        entry.samples.push(`${f.program} → ${langK.join(",")} (${langK.map(k => `${w[k]}%`).join(",")})`)
      }
    }
  }

  const sorted = [...byUni.entries()]
    .filter(([, v]) => v.bad > 0)
    .sort((a, b) => b[1].bad - a[1].bad)

  console.log("\nมหาวิทยาลัย | bad STEM | total | ตัวอย่าง")
  console.log("─".repeat(80))
  for (const [uni, { bad, total, samples }] of sorted) {
    console.log(`${uni}: ${bad}/${total}`)
    for (const s of samples) console.log(`    └ ${s}`)
  }
  const totalBad = sorted.reduce((s, [, v]) => s + v.bad, 0)
  console.log(`\n═══════════════════`)
  console.log(`รวม bad records: ${totalBad}`)
  console.log(`จำนวน uni ที่มีปัญหา: ${sorted.length}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
