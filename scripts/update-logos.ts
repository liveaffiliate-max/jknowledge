/**
 * Update University logoUrl จาก Supabase Storage
 * Run: npx tsx scripts/update-logos.ts
 *
 * เมื่อ upload logo ใหม่ใน Supabase Storage → bucket "University logo"
 * ให้เพิ่ม entry ใน LOGO_MAP แล้วรัน script นี้
 *
 * URL pattern:
 *   https://tvtrcoxvpfepztpkjyfs.supabase.co/storage/v1/object/public/University%20logo/[filename]
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

const STORAGE_BASE =
  "https://tvtrcoxvpfepztpkjyfs.supabase.co/storage/v1/object/public/University%20logo"

// ── Mapping: universitySlug → filename ใน bucket ─────────────────────────────
// เพิ่ม entry ใหม่เมื่อ upload logo
const LOGO_MAP: Record<string, string> = {
  "จุฬาลงกรณ์":           "chula.png",
  // ตัวอย่างที่จะเพิ่มในอนาคต:
  // "เกษตรศาสตร์":         "kasetsart.png",
  // "ธรรมศาสตร์":          "thammasat.png",
  // "มหิดล":               "mahidol.png",
  // "ขอนแก่น":             "kku.png",
  // "เชียงใหม่":           "cmu.png",
  // "สงขลานครินทร์":      "psu.png",
  // "ศิลปากร":             "su.png",
  // "บูรพา":               "buu.png",
  // "นเรศวร":              "nu.png",
  // "มหาสารคาม":           "msu.png",
  // "เทคโนโลยีพระจอมเกล้า": "kmutt.png",
  // "สถาบันเทคโนโลยีพระจอ": "kmitl.png",
  // "ศรีนครินทรวิโรฒ":    "swu.png",
  // "นวมินทราธิราช":       "nmu.png",
  // "มหาจุฬาลงกรณราชวิทยา": "mcu.png",
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🖼️  Update University Logos\n")

  let updated = 0
  let skipped = 0

  for (const [slug, filename] of Object.entries(LOGO_MAP)) {
    const logoUrl = `${STORAGE_BASE}/${filename}`

    // ตรวจสอบ URL ก่อน update
    const res = await fetch(logoUrl, { method: "HEAD" }).catch(() => null)
    if (!res || !res.ok) {
      console.warn(`  ⚠️  ${slug} — URL ไม่สามารถเข้าถึง: ${logoUrl}`)
      skipped++
      continue
    }

    const result = await prisma.university.updateMany({
      where:  { slug },
      data:   { logoUrl },
    })

    if (result.count > 0) {
      console.log(`  ✅ ${slug} → ${filename}`)
      updated++
    } else {
      console.warn(`  ❓ ${slug} — ไม่พบ university slug นี้ใน DB`)
      skipped++
    }
  }

  console.log(`\n✅ อัปเดต: ${updated}  ข้าม: ${skipped}`)
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
