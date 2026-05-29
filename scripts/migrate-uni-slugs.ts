/**
 * Migrate University Slugs → English SEO-friendly
 *
 * กฎ: lowercase, kebab-case, English only, stable, unique
 * Run: npx tsx scripts/migrate-uni-slugs.ts [--dry-run]
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
const DRY_RUN = process.argv.includes("--dry-run")

// ── Mapping: ชื่อเต็มภาษาไทย → English slug ─────────────────────────────────
const SLUG_MAP: Record<string, string> = {
  // กลุ่มสถาบัน / Consortiums
  "กลุ่มสถาบันแพทยศาสตร์แห่งประเทศไทย": "thai-medical-schools-consortium",

  // จุฬา / CU
  "จุฬาลงกรณ์มหาวิทยาลัย": "chulalongkorn-university",

  // มหาวิทยาลัย ก–ข
  "มหาวิทยาลัยกาฬสินธุ์":           "kalasin-university",
  "มหาวิทยาลัยเกษตรศาสตร์":         "kasetsart-university",
  "มหาวิทยาลัยเกษมบัณฑิต":          "kasem-bundit-university",
  "มหาวิทยาลัยขอนแก่น":             "khon-kaen-university",

  // เชียงใหม่ / เทคโนโลยี
  "มหาวิทยาลัยเชียงใหม่":           "chiang-mai-university",
  "มหาวิทยาลัยทักษิณ":              "thaksin-university",

  // พระจอมเกล้า
  "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี":    "kmutt",
  "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ": "kmutnb",
  "มหาวิทยาลัยเทคโนโลยีมหานคร":                "mahanakorn-university-of-technology",

  // ราชมงคล (RMUT)
  "มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ":    "rmut-krungthep",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก":   "rmut-tawanok",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี":    "rmut-thanyaburi",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร":     "rmut-phranakhon",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลรัตนโกสินทร์": "rmut-rattanakosin",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา":     "rmut-lanna",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย":   "rmut-srivijaya",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ": "rmut-suvarnabhumi",
  "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน":      "rmut-isan",

  "มหาวิทยาลัยเทคโนโลยีสุรนารี": "suranaree-university-of-technology",

  // ธ
  "มหาวิทยาลัยธรรมศาสตร์":    "thammasat-university",
  "มหาวิทยาลัยธุรกิจบัณฑิตย์": "dhurakij-pundit-university",

  // น
  "มหาวิทยาลัยนครพนม":              "nakhon-phanom-university",
  "มหาวิทยาลัยนราธิวาสราชนครินทร์": "narathiwat-university",
  "มหาวิทยาลัยนเรศวร":              "naresuan-university",
  "มหาวิทยาลัยนวมินทราธิราช":       "navamindradhiraj-university",
  "มหาวิทยาลัยนานาชาติเอเชีย-แปซิฟิก": "asia-pacific-international-university",
  "มหาวิทยาลัยเนชั่น":              "nation-university",

  // บ–ป
  "มหาวิทยาลัยบูรพา":   "burapha-university",
  "มหาวิทยาลัยปทุมธานี": "pathumthani-university",
  "มหาวิทยาลัยพะเยา":   "phayao-university",
  "มหาวิทยาลัยพายัพ":   "payap-university",

  // ม
  "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย": "mcu",
  "มหาวิทยาลัยมหามกุฏราชวิทยาลัย":      "mbu",
  "มหาวิทยาลัยมหาสารคาม":              "mahasarakham-university",
  "มหาวิทยาลัยมหิดล":                  "mahidol-university",
  "มหาวิทยาลัยแม่โจ้":                 "maejo-university",
  "มหาวิทยาลัยแม่ฟ้าหลวง":             "mae-fah-luang-university",

  // ร
  "มหาวิทยาลัยรังสิต":   "rangsit-university",
  "มหาวิทยาลัยราชธานี":  "rajathanee-university",
  "มหาวิทยาลัยราชพฤกษ์": "ratchaphruek-university",

  // ราชภัฏ (Rajabhat)
  "มหาวิทยาลัยราชภัฎพระนคร":                          "phranakhon-rajabhat-university-b",   // ฎ = typo variant in DB
  "มหาวิทยาลัยราชภัฏจันทรเกษม":                        "chandrakasem-rajabhat-university",
  "มหาวิทยาลัยราชภัฏชัยภูมิ":                          "chaiyaphum-rajabhat-university",
  "มหาวิทยาลัยราชภัฏเชียงใหม่":                        "chiang-mai-rajabhat-university",
  "มหาวิทยาลัยราชภัฏธนบุรี":                           "thonburi-rajabhat-university",
  "มหาวิทยาลัยราชภัฏนครราชสีมา":                       "nakhon-ratchasima-rajabhat-university",
  "มหาวิทยาลัยราชภัฏนครศรีธรรมราช":                    "nakhon-si-thammarat-rajabhat-university",
  "มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา":              "bansomdej-rajabhat-university",
  "มหาวิทยาลัยราชภัฏพระนคร":                           "phranakhon-rajabhat-university",
  "มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา":                  "phranakhon-si-ayutthaya-rajabhat-university",
  "มหาวิทยาลัยราชภัฏพิบูลสงคราม":                      "pibulsongkram-rajabhat-university",
  "มหาวิทยาลัยราชภัฏเพชรบุรี":                         "phetchaburi-rajabhat-university",
  "มหาวิทยาลัยราชภัฏยะลา":                             "yala-rajabhat-university",
  "มหาวิทยาลัยราชภัฏวไลยอลงกรณ์ ในพระบรมราชูปถัมภ์":  "valaya-alongkorn-rajabhat-university",
  "มหาวิทยาลัยราชภัฏสงขลา":                            "songkhla-rajabhat-university",
  "มหาวิทยาลัยราชภัฏสวนสุนันทา":                       "suan-sunandha-rajabhat-university",
  "มหาวิทยาลัยราชภัฏสุราษฎร์ธานี":                     "suratthani-rajabhat-university",
  "มหาวิทยาลัยราชภัฏอุบลราชธานี":                      "ubon-ratchathani-rajabhat-university",

  // ร–ว
  "มหาวิทยาลัยรามคำแหง": "ramkhamhaeng-university",
  "มหาวิทยาลัยวลัยลักษณ์": "walailak-university",
  "มหาวิทยาลัยเวสเทิร์น":  "western-university",

  // ศ
  "มหาวิทยาลัยศรีนครินทรวิโรฒ": "srinakharinwirot-university",
  "มหาวิทยาลัยศรีปทุม":         "sripatum-university",
  "มหาวิทยาลัยศิลปากร":         "silpakorn-university",

  // ส
  "มหาวิทยาลัยสงขลานครินทร์": "prince-of-songkla-university",
  "มหาวิทยาลัยสยาม":          "siam-university",
  "มหาวิทยาลัยสวนดุสิต":      "suan-dusit-university",

  // ห
  "มหาวิทยาลัยหอการค้าไทย":             "university-of-thai-chamber-of-commerce",
  "มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ": "huachiew-chalermprakiet-university",
  "มหาวิทยาลัยหาดใหญ่":                 "hatyai-university",

  // อ
  "มหาวิทยาลัยอิสเทิร์นเอเชีย": "eastern-asia-university-iat",  // ฝั่งอิสเทิร์น
  "มหาวิทยาลัยอีสเทิร์นเอเชีย": "eastern-asia-university",      // ฝั่งอีสเทิร์น
  "มหาวิทยาลัยอุบลราชธานี":     "ubon-ratchathani-university",

  // ราชวิทยาลัย / วิทยาลัย / สถาบัน
  "ราชวิทยาลัยจุฬาภรณ์":    "chulabhorn-royal-academy",
  "วิทยาลัยเซนต์หลุยส์":   "saint-louis-college",
  "วิทยาลัยดุสิตธานี":      "dusit-thani-college",
  "วิทยาลัยนครราชสีมา":     "nakhon-ratchasima-college",
  "วิทยาลัยนอร์ทเทิร์น":    "northern-college",

  "สถาบันการจัดการปัญญาภิวัฒน์":                              "panyapiwat-institute-of-management",
  "สถาบันการพยาบาลศรีสวรินทิรา":                              "srisavarindhira-institute-of-nursing",
  "สถาบันการพยาบาลศรีสวรินทิรา สภาชาดไทย":                   "srisavarindhira-thai-red-cross-institute",
  "สถาบันเทคโนโลยีจิตรลดา":                                   "chitralada-technology-institute",
  "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง":           "kmitl",
  "สถาบันพระบรมราชชนก":                                       "praboromarajchanok-institute",
}

async function main() {
  console.log(`🔄 Migrate University Slugs → English${DRY_RUN ? " [DRY RUN]" : ""}\n`)

  const unis = await prisma.university.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  console.log(`📊 Universities: ${unis.length}\n`)

  const updates: Array<{ id: string; oldSlug: string; newSlug: string; name: string }> = []
  const unmapped: string[] = []

  // ตรวจสอบ duplicate ใน SLUG_MAP ก่อน
  const slugValues = Object.values(SLUG_MAP)
  const dupes = slugValues.filter((s, i) => slugValues.indexOf(s) !== i)
  if (dupes.length > 0) {
    console.error("❌ Duplicate slugs in SLUG_MAP:", dupes)
    process.exit(1)
  }

  for (const uni of unis) {
    const newSlug = SLUG_MAP[uni.name]
    if (!newSlug) {
      unmapped.push(`  ❓ "${uni.name}" (current: ${uni.slug})`)
      continue
    }
    if (newSlug === uni.slug) continue  // ไม่ต้องเปลี่ยน
    updates.push({ id: uni.id, oldSlug: uni.slug, newSlug, name: uni.name })
  }

  // แสดง unmapped
  if (unmapped.length > 0) {
    console.log(`⚠️  ไม่มี mapping (${unmapped.length}):`)
    unmapped.forEach(u => console.log(u))
    console.log()
  }

  // แสดง preview
  console.log(`✏️  จะเปลี่ยน ${updates.length} slugs:\n`)
  for (const u of updates) {
    console.log(`  ${u.oldSlug.padEnd(45)} → ${u.newSlug}`)
  }

  if (DRY_RUN) {
    console.log(`\n🛑 Dry run — ไม่ได้แก้จริง`)
    return
  }

  if (updates.length === 0) {
    console.log("\n✅ ไม่มีอะไรต้องเปลี่ยน")
    return
  }

  // อัพเดท
  let done = 0
  for (const u of updates) {
    await prisma.university.update({
      where: { id: u.id },
      data:  { slug: u.newSlug },
    })
    done++
  }

  console.log(`\n✅ อัพเดทเสร็จ: ${done} universities`)
  console.log(`   slugs เปลี่ยนเป็น English SEO-friendly แล้ว`)
}

main()
  .catch(e => { console.error("❌ Error:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
