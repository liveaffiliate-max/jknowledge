/**
 * Dedup + Reslug Script
 *
 * Phase 1 — Merge duplicate Faculty rows that share the same
 *            (universityId, name, program, majorName, detail)
 *            but have different slugs/programCodes (caused by
 *            programCode changing between TCAS years).
 *
 * Phase 2 — Re-slug every remaining Faculty to the new format:
 *            `programName:majorName:detail`
 *            (programCode is stored in the `programCode` field, not slug)
 *            This makes future imports idempotent regardless of programCode.
 *
 * Run: npx tsx scripts/dedupe-faculties.ts
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { normalizeDetail } from "../src/lib/normalize-faculty"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function makeNewSlug(program: string, majorName: string | null, detail: string | null, facultyName: string): string {
  const normDetail = normalizeDetail(detail, facultyName)
  return [program, majorName, normDetail].filter(Boolean).join(":")
}

async function main() {
  // ── Phase 1: Merge duplicates ───────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════")
  console.log("Phase 1 — Merge duplicate Faculty records")
  console.log("═══════════════════════════════════════════════════\n")

  const faculties = await prisma.faculty.findMany({
    include: {
      scores: { select: { id: true, year: true, round: true } },
      requirement: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  console.log(`Found ${faculties.length} total Faculty records\n`)

  // Group by (universityId, name, program, majorName, normalizedDetail).
  // Using normalizeDetail here is critical: the same logical faculty can have
  // different raw detail strings across TCAS years (e.g. a verbose
  // "คณะวิทยาศาสตร์ ... ภาคปกติ" in year A vs bare "" or "ภาคปกติ" in year B).
  // Normalizing before grouping catches these cross-year duplicates.
  const groups = new Map<string, typeof faculties>()
  for (const f of faculties) {
    const normDetail = normalizeDetail(f.detail, f.name)
    const key = [f.universityId, f.name, f.program, f.majorName ?? "", normDetail].join("|")
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(f)
  }

  const dupGroups = [...groups.values()].filter((g) => g.length > 1)
  console.log(`Duplicate groups: ${dupGroups.length}`)
  console.log(`Single records  : ${groups.size - dupGroups.length}\n`)

  let totalRemoved = 0
  let totalScoresMoved = 0

  for (const group of dupGroups) {
    // Canonical = has the most TcasScore records; ties → earliest createdAt
    const sorted = [...group].sort((a, b) => b.scores.length - a.scores.length)
    const canonical = sorted[0]
    const duplicates = sorted.slice(1)

    // Track which year+round the canonical already owns
    const canonicalKeys = new Set(canonical.scores.map((s) => `${s.year}:${s.round}`))

    console.log(
      `  [${canonical.program}${canonical.majorName ? ` · ${canonical.majorName}` : ""}]` +
        `  keep=${canonical.id.slice(-6)}(${canonical.scores.length} scores)` +
        `  remove=${duplicates.length}`
    )

    for (const dup of duplicates) {
      // ── Move TcasScore ────────────────────────────────────────────────────
      for (const score of dup.scores) {
        const key = `${score.year}:${score.round}`
        if (!canonicalKeys.has(key)) {
          await prisma.tcasScore.update({
            where: { id: score.id },
            data: { facultyId: canonical.id },
          })
          canonicalKeys.add(key)
          totalScoresMoved++
        } else {
          // Canonical already has this year/round — discard dup's score
          await prisma.tcasScore.delete({ where: { id: score.id } })
        }
      }

      // ── Move FacultyRequirement (if canonical lacks one) ──────────────────
      if (!canonical.requirement && dup.requirement) {
        await prisma.facultyRequirement.update({
          where: { id: dup.requirement.id },
          data: { facultyId: canonical.id },
        })
        // Mark canonical as now having a requirement so we don't try again
        ;(canonical as typeof canonical & { requirement: unknown }).requirement =
          dup.requirement
      }

      // ── Move PredictionHistory ─────────────────────────────────────────────
      await prisma.predictionHistory.updateMany({
        where: { facultyId: dup.id },
        data: { facultyId: canonical.id },
      })

      // ── Delete duplicate (deleteMany = no-throw if already gone) ──────────
      const deleted = await prisma.faculty.deleteMany({ where: { id: dup.id } })
      if (deleted.count > 0) totalRemoved++
    }
  }

  console.log(`\n✅ Phase 1 done — removed ${totalRemoved} duplicates, moved ${totalScoresMoved} scores\n`)

  // ── Phase 2: Re-slug to new format ─────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════")
  console.log("Phase 2 — Re-slug all faculties to name-based format")
  console.log("═══════════════════════════════════════════════════\n")

  const remaining = await prisma.faculty.findMany()
  let reslugCount = 0
  let skipCount = 0

  for (const f of remaining) {
    const newSlug = makeNewSlug(f.program, f.majorName, f.detail, f.name)
    if (f.slug === newSlug) continue

    // Guard against collision within same university
    const conflict = await prisma.faculty.findFirst({
      where: { universityId: f.universityId, slug: newSlug, id: { not: f.id } },
    })
    if (conflict) {
      console.log(`  ⚠️  Slug collision — skip: [${f.program}]  existing=${conflict.id.slice(-6)}`)
      skipCount++
      continue
    }

    await prisma.faculty.update({ where: { id: f.id }, data: { slug: newSlug } })
    reslugCount++
  }

  console.log(`  Re-slugged : ${reslugCount}`)
  console.log(`  Skipped    : ${skipCount} (collision — check manually)`)

  const finalCount = await prisma.faculty.count()
  console.log(`\n✅ Phase 2 done — ${finalCount} Faculty records remaining in DB`)
  console.log("\n🎉 All done! DB is clean. Run import-tcas.ts to re-import.\n")
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
