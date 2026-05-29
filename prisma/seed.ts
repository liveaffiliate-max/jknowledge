/**
 * Seed script — imports mock data into real Supabase database.
 * Run: npx tsx prisma/seed.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── Data ──────────────────────────────────────────────────────────────────────

const universities = [
  { slug: "cu",    name: "จุฬาลงกรณ์มหาวิทยาลัย",        shortName: "จุฬาฯ",   location: "กรุงเทพฯ", color: "#8B1A1A" },
  { slug: "tu",    name: "มหาวิทยาลัยธรรมศาสตร์",          shortName: "มธ.",     location: "กรุงเทพฯ", color: "#E31937" },
  { slug: "mu",    name: "มหาวิทยาลัยมหิดล",               shortName: "มหิดล",   location: "นครปฐม",   color: "#003087" },
  { slug: "ku",    name: "มหาวิทยาลัยเกษตรศาสตร์",         shortName: "มก.",     location: "กรุงเทพฯ", color: "#007A33" },
  { slug: "cmu",   name: "มหาวิทยาลัยเชียงใหม่",           shortName: "มช.",     location: "เชียงใหม่", color: "#800000" },
  { slug: "kku",   name: "มหาวิทยาลัยขอนแก่น",            shortName: "มข.",     location: "ขอนแก่น",  color: "#C8A400" },
  { slug: "psu",   name: "มหาวิทยาลัยสงขลานครินทร์",      shortName: "ม.อ.",    location: "สงขลา",    color: "#006633" },
  { slug: "kmitl", name: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง", shortName: "สจล.", location: "กรุงเทพฯ", color: "#003580" },
]

type FacultyInput = {
  universitySlug: string
  slug: string
  name: string
  program: string
  field: string
  scores: { year: number; minScore: number; avgScore: number; seats: number }[]
}

const faculties: FacultyInput[] = [
  {
    universitySlug: "cu",
    slug: "cu-medicine",
    name: "คณะแพทยศาสตร์",
    program: "แพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 91.2, avgScore: 93.5, seats: 270 },
      { year: 2564, minScore: 90.8, avgScore: 93.1, seats: 275 },
      { year: 2565, minScore: 91.5, avgScore: 93.8, seats: 270 },
      { year: 2566, minScore: 92.0, avgScore: 94.2, seats: 265 },
      { year: 2567, minScore: 92.5, avgScore: 94.5, seats: 270 },
    ],
  },
  {
    universitySlug: "cu",
    slug: "cu-engineering",
    name: "คณะวิศวกรรมศาสตร์",
    program: "วิศวกรรมคอมพิวเตอร์",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 82.3, avgScore: 85.6, seats: 120 },
      { year: 2564, minScore: 83.1, avgScore: 86.2, seats: 120 },
      { year: 2565, minScore: 83.8, avgScore: 86.9, seats: 115 },
      { year: 2566, minScore: 84.5, avgScore: 87.3, seats: 120 },
      { year: 2567, minScore: 85.2, avgScore: 88.1, seats: 120 },
    ],
  },
  {
    universitySlug: "cu",
    slug: "cu-law",
    name: "คณะนิติศาสตร์",
    program: "นิติศาสตรบัณฑิต",
    field: "law",
    scores: [
      { year: 2563, minScore: 78.5, avgScore: 81.2, seats: 350 },
      { year: 2564, minScore: 79.2, avgScore: 81.8, seats: 350 },
      { year: 2565, minScore: 79.8, avgScore: 82.3, seats: 340 },
      { year: 2566, minScore: 80.1, avgScore: 82.7, seats: 350 },
      { year: 2567, minScore: 80.5, avgScore: 83.2, seats: 350 },
    ],
  },
  {
    universitySlug: "tu",
    slug: "tu-law",
    name: "คณะนิติศาสตร์",
    program: "นิติศาสตรบัณฑิต",
    field: "law",
    scores: [
      { year: 2563, minScore: 75.3, avgScore: 78.6, seats: 400 },
      { year: 2564, minScore: 76.1, avgScore: 79.2, seats: 400 },
      { year: 2565, minScore: 76.8, avgScore: 79.8, seats: 390 },
      { year: 2566, minScore: 77.2, avgScore: 80.3, seats: 400 },
      { year: 2567, minScore: 77.8, avgScore: 81.0, seats: 400 },
    ],
  },
  {
    universitySlug: "tu",
    slug: "tu-accounting",
    name: "คณะพาณิชยศาสตร์และการบัญชี",
    program: "การบัญชี",
    field: "accounting",
    scores: [
      { year: 2563, minScore: 77.8, avgScore: 80.5, seats: 200 },
      { year: 2564, minScore: 78.4, avgScore: 81.1, seats: 200 },
      { year: 2565, minScore: 79.0, avgScore: 81.6, seats: 195 },
      { year: 2566, minScore: 79.5, avgScore: 82.1, seats: 200 },
      { year: 2567, minScore: 80.0, avgScore: 82.6, seats: 200 },
    ],
  },
  {
    universitySlug: "mu",
    slug: "mu-medicine",
    name: "คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี",
    program: "แพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 89.5, avgScore: 92.1, seats: 200 },
      { year: 2564, minScore: 90.1, avgScore: 92.5, seats: 205 },
      { year: 2565, minScore: 90.6, avgScore: 92.9, seats: 200 },
      { year: 2566, minScore: 91.0, avgScore: 93.2, seats: 200 },
      { year: 2567, minScore: 91.5, avgScore: 93.6, seats: 200 },
    ],
  },
  {
    universitySlug: "mu",
    slug: "mu-nursing",
    name: "คณะพยาบาลศาสตร์",
    program: "พยาบาลศาสตรบัณฑิต",
    field: "nursing",
    scores: [
      { year: 2563, minScore: 68.2, avgScore: 71.5, seats: 120 },
      { year: 2564, minScore: 69.0, avgScore: 72.1, seats: 120 },
      { year: 2565, minScore: 69.8, avgScore: 72.8, seats: 115 },
      { year: 2566, minScore: 70.3, avgScore: 73.2, seats: 120 },
      { year: 2567, minScore: 70.8, avgScore: 73.6, seats: 120 },
    ],
  },
  {
    universitySlug: "ku",
    slug: "ku-engineering",
    name: "คณะวิศวกรรมศาสตร์",
    program: "วิศวกรรมไฟฟ้า",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 70.5, avgScore: 74.2, seats: 150 },
      { year: 2564, minScore: 71.3, avgScore: 74.9, seats: 150 },
      { year: 2565, minScore: 72.0, avgScore: 75.5, seats: 145 },
      { year: 2566, minScore: 72.5, avgScore: 76.0, seats: 150 },
      { year: 2567, minScore: 73.0, avgScore: 76.5, seats: 150 },
    ],
  },
  {
    universitySlug: "cmu",
    slug: "cmu-medicine",
    name: "คณะแพทยศาสตร์",
    program: "แพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 87.8, avgScore: 90.5, seats: 195 },
      { year: 2564, minScore: 88.3, avgScore: 91.0, seats: 200 },
      { year: 2565, minScore: 88.9, avgScore: 91.5, seats: 195 },
      { year: 2566, minScore: 89.4, avgScore: 91.9, seats: 195 },
      { year: 2567, minScore: 90.0, avgScore: 92.3, seats: 195 },
    ],
  },
  {
    universitySlug: "cmu",
    slug: "cmu-engineering",
    name: "คณะวิศวกรรมศาสตร์",
    program: "วิศวกรรมซอฟต์แวร์",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 69.8, avgScore: 73.4, seats: 100 },
      { year: 2564, minScore: 70.6, avgScore: 74.1, seats: 100 },
      { year: 2565, minScore: 71.3, avgScore: 74.8, seats: 95 },
      { year: 2566, minScore: 72.0, avgScore: 75.4, seats: 100 },
      { year: 2567, minScore: 72.8, avgScore: 76.1, seats: 100 },
    ],
  },
  {
    universitySlug: "kku",
    slug: "kku-medicine",
    name: "คณะแพทยศาสตร์",
    program: "แพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 86.5, avgScore: 89.3, seats: 220 },
      { year: 2564, minScore: 87.0, avgScore: 89.8, seats: 225 },
      { year: 2565, minScore: 87.5, avgScore: 90.2, seats: 220 },
      { year: 2566, minScore: 88.0, avgScore: 90.6, seats: 220 },
      { year: 2567, minScore: 88.5, avgScore: 91.0, seats: 220 },
    ],
  },
  {
    universitySlug: "psu",
    slug: "psu-medicine",
    name: "คณะแพทยศาสตร์",
    program: "แพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 85.0, avgScore: 88.2, seats: 180 },
      { year: 2564, minScore: 85.5, avgScore: 88.7, seats: 180 },
      { year: 2565, minScore: 86.0, avgScore: 89.1, seats: 175 },
      { year: 2566, minScore: 86.5, avgScore: 89.5, seats: 180 },
      { year: 2567, minScore: 87.0, avgScore: 90.0, seats: 180 },
    ],
  },
  {
    universitySlug: "kmitl",
    slug: "kmitl-engineering",
    name: "คณะวิศวกรรมศาสตร์",
    program: "วิศวกรรมคอมพิวเตอร์",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 65.2, avgScore: 69.8, seats: 140 },
      { year: 2564, minScore: 66.0, avgScore: 70.5, seats: 140 },
      { year: 2565, minScore: 66.8, avgScore: 71.2, seats: 135 },
      { year: 2566, minScore: 67.5, avgScore: 71.9, seats: 140 },
      { year: 2567, minScore: 68.2, avgScore: 72.5, seats: 140 },
    ],
  },
  {
    universitySlug: "cu",
    slug: "cu-pharmacy",
    name: "คณะเภสัชศาสตร์",
    program: "เภสัชศาสตรบัณฑิต",
    field: "pharmacy",
    scores: [
      { year: 2563, minScore: 80.5, avgScore: 83.8, seats: 110 },
      { year: 2564, minScore: 81.2, avgScore: 84.4, seats: 110 },
      { year: 2565, minScore: 81.9, avgScore: 85.0, seats: 105 },
      { year: 2566, minScore: 82.5, avgScore: 85.5, seats: 110 },
      { year: 2567, minScore: 83.0, avgScore: 86.0, seats: 110 },
    ],
  },
  {
    universitySlug: "cu",
    slug: "cu-architecture",
    name: "คณะสถาปัตยกรรมศาสตร์",
    program: "สถาปัตยกรรมศาสตรบัณฑิต",
    field: "architecture",
    scores: [
      { year: 2563, minScore: 75.8, avgScore: 79.3, seats: 80 },
      { year: 2564, minScore: 76.5, avgScore: 80.0, seats: 80 },
      { year: 2565, minScore: 77.2, avgScore: 80.6, seats: 75 },
      { year: 2566, minScore: 77.9, avgScore: 81.2, seats: 80 },
      { year: 2567, minScore: 78.5, avgScore: 81.8, seats: 80 },
    ],
  },
  {
    universitySlug: "ku",
    slug: "ku-ict",
    name: "คณะวิทยาการจัดการ",
    program: "วิทยาการคอมพิวเตอร์",
    field: "ict",
    scores: [
      { year: 2563, minScore: 62.5, avgScore: 66.8, seats: 130 },
      { year: 2564, minScore: 63.3, avgScore: 67.5, seats: 130 },
      { year: 2565, minScore: 64.1, avgScore: 68.2, seats: 125 },
      { year: 2566, minScore: 64.8, avgScore: 68.9, seats: 130 },
      { year: 2567, minScore: 65.5, avgScore: 69.5, seats: 130 },
    ],
  },
  {
    universitySlug: "tu",
    slug: "tu-economics",
    name: "คณะเศรษฐศาสตร์",
    program: "เศรษฐศาสตรบัณฑิต",
    field: "economics",
    scores: [
      { year: 2563, minScore: 74.2, avgScore: 77.8, seats: 250 },
      { year: 2564, minScore: 75.0, avgScore: 78.5, seats: 250 },
      { year: 2565, minScore: 75.7, avgScore: 79.1, seats: 245 },
      { year: 2566, minScore: 76.3, avgScore: 79.7, seats: 250 },
      { year: 2567, minScore: 77.0, avgScore: 80.3, seats: 250 },
    ],
  },
  {
    universitySlug: "mu",
    slug: "mu-pharmacy",
    name: "คณะเภสัชศาสตร์",
    program: "เภสัชศาสตรบัณฑิต",
    field: "pharmacy",
    scores: [
      { year: 2563, minScore: 78.0, avgScore: 81.5, seats: 100 },
      { year: 2564, minScore: 78.8, avgScore: 82.1, seats: 100 },
      { year: 2565, minScore: 79.5, avgScore: 82.7, seats: 95 },
      { year: 2566, minScore: 80.1, avgScore: 83.2, seats: 100 },
      { year: 2567, minScore: 80.8, avgScore: 83.8, seats: 100 },
    ],
  },
  {
    universitySlug: "kmitl",
    slug: "kmitl-ict",
    name: "คณะเทคโนโลยีสารสนเทศ",
    program: "เทคโนโลยีสารสนเทศ",
    field: "ict",
    scores: [
      { year: 2563, minScore: 60.5, avgScore: 65.2, seats: 120 },
      { year: 2564, minScore: 61.3, avgScore: 66.0, seats: 120 },
      { year: 2565, minScore: 62.1, avgScore: 66.8, seats: 115 },
      { year: 2566, minScore: 62.8, avgScore: 67.5, seats: 120 },
      { year: 2567, minScore: 63.5, avgScore: 68.2, seats: 120 },
    ],
  },
  {
    universitySlug: "cmu",
    slug: "cmu-nursing",
    name: "คณะพยาบาลศาสตร์",
    program: "พยาบาลศาสตรบัณฑิต",
    field: "nursing",
    scores: [
      { year: 2563, minScore: 65.5, avgScore: 69.2, seats: 110 },
      { year: 2564, minScore: 66.3, avgScore: 69.9, seats: 110 },
      { year: 2565, minScore: 67.0, avgScore: 70.5, seats: 105 },
      { year: 2566, minScore: 67.6, avgScore: 71.0, seats: 110 },
      { year: 2567, minScore: 68.2, avgScore: 71.6, seats: 110 },
    ],
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...")

  // Upsert universities
  for (const uni of universities) {
    await prisma.university.upsert({
      where: { slug: uni.slug },
      update: uni,
      create: uni,
    })
    console.log(`  ✓ University: ${uni.shortName}`)
  }

  // Upsert faculties + scores
  for (const fac of faculties) {
    const university = await prisma.university.findUnique({
      where: { slug: fac.universitySlug },
    })
    if (!university) {
      console.warn(`  ⚠ University not found: ${fac.universitySlug}`)
      continue
    }

    const faculty = await prisma.faculty.upsert({
      where: { universityId_slug: { universityId: university.id, slug: fac.slug } },
      update: {
        name: fac.name,
        program: fac.program,
        field: fac.field as never,
      },
      create: {
        universityId: university.id,
        slug: fac.slug,
        name: fac.name,
        program: fac.program,
        field: fac.field as never,
      },
    })

    for (const score of fac.scores) {
      await prisma.tcasScore.upsert({
        where: {
          facultyId_year_round: {
            facultyId: faculty.id,
            year: score.year,
            round: 3,
          },
        },
        update: {
          minScore: score.minScore,
          avgScore: score.avgScore,
          seats: score.seats,
        },
        create: {
          facultyId: faculty.id,
          year: score.year,
          round: 3,
          minScore: score.minScore,
          avgScore: score.avgScore,
          seats: score.seats,
        },
      })
    }
    console.log(`  ✓ Faculty: ${fac.name} (${fac.scores.length} years)`)
  }

  console.log("\n✅ Seed complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
