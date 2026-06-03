/**
 * Phase 3 — Pre-reimport: snapshot FacultyRequirement, then truncate Faculty+TcasScore.
 * Run ONCE before re-importing. Saves requirements to JSON so they can be restored after.
 *
 * Usage: npx tsx scripts/pre-reimport.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { writeFileSync } from "fs"
import { join } from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  // ── 1. Count everything ─────────────────────────────────────────────────────
  const [facCount, scoreCount, reqCount, predCount] = await Promise.all([
    prisma.faculty.count(),
    prisma.tcasScore.count(),
    prisma.facultyRequirement.count(),
    prisma.predictionHistory.count(),
  ])
  console.log("Current DB state:")
  console.log(`  Faculty           : ${facCount}`)
  console.log(`  TcasScore         : ${scoreCount}`)
  console.log(`  FacultyRequirement: ${reqCount}`)
  console.log(`  PredictionHistory : ${predCount}`)

  // ── 2. Snapshot FacultyRequirement → JSON ───────────────────────────────────
  // Keyed by programCode of the Faculty (if available) so we can restore later.
  const reqs = await prisma.facultyRequirement.findMany({
    include: { faculty: { select: { programCode: true, name: true, program: true, majorName: true } } },
  })

  const snapshot = reqs.map(r => ({
    programCode: r.faculty.programCode,
    facultyName: r.faculty.name,
    program:     r.faculty.program,
    majorName:   r.faculty.majorName,
    year:        r.year,
    weights:     r.weights,
    estMinScore: r.estMinScore,
  }))

  const outPath = join(process.cwd(), "src/data/faculty-requirements-backup.json")
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf-8")
  console.log(`\n✅ Saved ${snapshot.length} FacultyRequirement records → ${outPath}`)

  const withCode    = snapshot.filter(r => r.programCode).length
  const withoutCode = snapshot.filter(r => !r.programCode).length
  console.log(`   With programCode   : ${withCode}  (will be auto-restored)`)
  console.log(`   Without programCode: ${withoutCode}  (needs manual restore)`)

  if (predCount > 0) {
    console.log(`\n⚠️  PredictionHistory: ${predCount} records will be LOST (linked to old Faculty IDs)`)
  }

  // ── 3. Truncate TcasScore then Faculty ──────────────────────────────────────
  console.log("\nTruncating TcasScore...")
  const deletedScores = await prisma.tcasScore.deleteMany()
  console.log(`  Deleted ${deletedScores.count} TcasScore rows`)

  console.log("Truncating FacultyRequirement...")
  const deletedReqs = await prisma.facultyRequirement.deleteMany()
  console.log(`  Deleted ${deletedReqs.count} FacultyRequirement rows`)

  console.log("Truncating PredictionHistory...")
  const deletedPreds = await prisma.predictionHistory.deleteMany()
  console.log(`  Deleted ${deletedPreds.count} PredictionHistory rows`)

  console.log("Truncating Faculty...")
  const deletedFacs = await prisma.faculty.deleteMany()
  console.log(`  Deleted ${deletedFacs.count} Faculty rows`)

  // ── 4. Verify ────────────────────────────────────────────────────────────────
  const [facAfter, scoreAfter] = await Promise.all([
    prisma.faculty.count(),
    prisma.tcasScore.count(),
  ])
  console.log(`\n✅ DB clear — Faculty: ${facAfter}, TcasScore: ${scoreAfter}`)
  console.log("\nNext step: npx tsx scripts/import-tcas.ts")
}

main()
  .catch(e => { console.error("❌ Error:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
