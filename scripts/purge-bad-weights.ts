/**
 * Purge Bad Weights — ลบ FacultyRequirement ที่ weights ไม่ตรงกับ field ของ faculty
 *
 * Schema v2: programCode อยู่ใน TcasScore (per-year) ไม่อยู่ใน Faculty แล้ว
 *
 * Logic: เช็ค subject codes ใน weights เทียบกับ field ของ faculty
 *        ถ้า "ไม่น่าจะใช่" → ลบ FacultyRequirement
 *
 * Run: npx tsx scripts/purge-bad-weights.ts [--dry-run]
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

const DRY_RUN = process.argv.includes("--dry-run")

// ── Subject groups ────────────────────────────────────────────────────────────

/**
 * วิชาภาษาต่างประเทศเฉพาะ (ไม่ใช่ไทย/อังกฤษ)
 * ไม่ควรอยู่ใน STEM fields เป็น fixed weight
 * Note: mytcas ใช้ code ต่างจาก NIETS — 83=French, 84=German, 85=Japanese, ...
 */
const LANG_SUBJECTS = new Set([
  "a_lv_83",  // ภาษาฝรั่งเศส
  "a_lv_84",  // ภาษาเยอรมัน
  "a_lv_85",  // ภาษาญี่ปุ่น
  "a_lv_86",  // ภาษาเกาหลี
  "a_lv_87",  // ภาษาจีน
  "a_lv_88",  // ภาษาบาลี
  "a_lv_89",  // ภาษาสเปน
])

/** วิชาที่เฉพาะสำหรับสายวิทย์/วิศวะ (ไม่ควรอยู่ใน lib arts/lang) */
const STEM_SUBJECTS = new Set([
  "tpat3",    // ความถนัดวิทย์/เทคโนโลยี/วิศวะ
  "a_lv_70",  // ฟิสิกส์
  "a_lv_71",  // เคมี
  "a_lv_72",  // ชีววิทยา
  "a_lv_73",  // คณิตศาสตร์ (สายวิทย์)
  "a_lv_66",  // วิทยาศาสตร์ประยุกต์
])

/**
 * STEM fields เหล่านี้ไม่ควรมี specific language subjects (a_lv_81–86) เลย
 * ยกเว้น international programs
 */
const STRICT_STEM_FIELDS = new Set([
  "medicine", "dentistry", "pharmacy", "nursing",
  "engineering", "science",
])

/**
 * Fields เหล่านี้ใช้ threshold ผ่อนปรนกว่า (อาจมี language subject บ้าง เช่น ICT นานาชาติ)
 * flag เฉพาะถ้า lang ≥ 30%
 */
const SOFT_STEM_FIELDS = new Set([
  "architecture", "ict",
])

/** field ที่ไม่ควรมี STEM-only weights */
const LANG_FIELDS = new Set([
  "liberal_arts",
])

// keyword ที่บอกว่า program นี้อาจใช้ภาษาต่างประเทศจริง
const INTERNATIONAL_RE = /นานาชาติ|international|inter\b/i

// ── Heuristic check ───────────────────────────────────────────────────────────

function isMismatch(
  field: string,
  weights: Record<string, number>,
  name: string,
  program: string,
): { bad: boolean; reason: string } {
  const keys = Object.keys(weights)
  if (keys.length === 0) return { bad: false, reason: "" }

  const isInternational = INTERNATIONAL_RE.test(`${name} ${program}`)

  const langKeys = keys.filter(k => LANG_SUBJECTS.has(k))
  const langPct  = langKeys.reduce((s, k) => s + (weights[k] ?? 0), 0)

  // Rule 1: Strict STEM — ห้ามมี specific language subject เลย (ยกเว้น international)
  if (STRICT_STEM_FIELDS.has(field) && langPct > 0 && !isInternational) {
    return {
      bad: true,
      reason: `STEM field="${field}" มี lang subjects=${langPct}% (${langKeys.join(", ")})`,
    }
  }

  // Rule 2: Soft STEM — flag ถ้า lang ≥ 30%
  if (SOFT_STEM_FIELDS.has(field) && langPct >= 30 && !isInternational) {
    return {
      bad: true,
      reason: `field="${field}" มี lang weights=${langPct}% (${langKeys.join(", ")}) ≥ 30%`,
    }
  }

  // Rule 3: Non-lang field มี specific language ≥ 60% → ผิด
  if (!LANG_FIELDS.has(field) && langPct >= 60) {
    return {
      bad: true,
      reason: `field="${field}" แต่ weights เป็น language subjects ${langPct}%`,
    }
  }

  return { bad: false, reason: "" }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔍 Purge Bad Weights${DRY_RUN ? " [DRY RUN]" : ""}\n`)

  const rows = await prisma.facultyRequirement.findMany({
    select: {
      facultyId: true,
      year:      true,
      weights:   true,
      faculty: {
        select: { id: true, name: true, program: true, field: true },
      },
    },
  })

  console.log(`📊 FacultyRequirement records: ${rows.length}\n`)

  const toDelete: string[] = []

  for (const row of rows) {
    const f = row.faculty
    const weights = row.weights as Record<string, number>
    const { bad, reason } = isMismatch(f.field, weights, f.name, f.program)

    if (bad) {
      console.log(`❌ BAD: ${f.name} | ${f.program} | field=${f.field}`)
      console.log(`   year=${row.year} | ${reason}`)
      console.log(`   weights: ${JSON.stringify(weights)}\n`)
      toDelete.push(row.facultyId)
    }
  }

  console.log(`\n═══════════════════════════════════`)
  console.log(`พบ weights ที่น่าสงสัย: ${toDelete.length} / ${rows.length} records`)

  if (toDelete.length === 0) {
    console.log("✅ ไม่พบ weights ที่ผิด — data quality ดี!")
    return
  }

  if (DRY_RUN) {
    console.log(`🛑 Dry run — ไม่ได้ลบจริง ลอง run โดยไม่มี --dry-run เพื่อลบ`)
    return
  }

  // Delete bad FacultyRequirement rows
  const deleted = await prisma.facultyRequirement.deleteMany({
    where: { facultyId: { in: toDelete } },
  })

  console.log(`🗑️  ลบ FacultyRequirement: ${deleted.count} records`)
  console.log(`✅ เสร็จ — faculties เหล่านี้จะแสดง fallback input แทน`)
}

main()
  .catch(e => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
