/**
 * scripts/test-mbti-flow.ts
 *
 * End-to-end test of the new MBTI redesign queries & data.
 * Hits the real DB but does not mutate any data.
 *
 * Run: npx tsx scripts/test-mbti-flow.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

// ── Test helpers ─────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function ok(name: string) {
  console.log(`  ✅ ${name}`)
  passed++
}

function fail(name: string, reason: string) {
  console.log(`  ❌ ${name}`)
  console.log(`     → ${reason}`)
  failed++
}

function assert(cond: boolean, name: string, reason: string = "") {
  if (cond) ok(name)
  else fail(name, reason || "assertion failed")
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function testMatchCoverage() {
  console.log("\n📊 Test 1: Match coverage per type")
  const counts = await prisma.facultyMBTIMatch.groupBy({
    by:      ["mbtiType"],
    where:   { facultyId: { not: null } },
    _count:  true,
    orderBy: { mbtiType: "asc" },
  })

  assert(counts.length === 16, "All 16 types have matches", `got ${counts.length}`)
  counts.forEach((c) => {
    assert(c._count >= 10, `  ${c.mbtiType} ≥ 10 matches`, `got ${c._count}`)
  })

  const total = counts.reduce((s, c) => s + c._count, 0)
  assert(total >= 320, "Total matches ≥ 320", `got ${total}`)
}

async function testRanksAreUnique() {
  console.log("\n🎯 Test 2: Ranks unique within each type (for facultyId-linked rows)")
  for (const type of ["INTJ", "ENFP", "ESTP"]) {
    const rows = await prisma.facultyMBTIMatch.findMany({
      where:   { mbtiType: type, facultyId: { not: null } },
      orderBy: { rank: "asc" },
      select:  { rank: true },
    })
    const ranks = rows.map((r) => r.rank)
    const uniq = new Set(ranks).size
    assert(uniq === ranks.length, `${type}: no duplicate ranks`, `${ranks.length} rows, ${uniq} unique`)
  }
}

async function testFacultiesExist() {
  console.log("\n🔗 Test 3: Every facultyId points to a real Faculty row")
  const matches = await prisma.facultyMBTIMatch.findMany({
    where:   { facultyId: { not: null } },
    include: { faculty: { select: { id: true } } },
  })
  const orphans = matches.filter((m) => m.faculty === null)
  assert(orphans.length === 0, `All ${matches.length} facultyId references resolve`,
    `${orphans.length} orphan rows`)
}

async function testTopFacultiesQuery() {
  console.log("\n🎓 Test 4: getTopFacultiesForType — INTJ top 5 shape")
  const matches = await prisma.facultyMBTIMatch.findMany({
    where:   { mbtiType: "INTJ", facultyId: { not: null } },
    orderBy: { rank: "asc" },
    take:    5,
    include: {
      faculty: {
        include: {
          university: { select: { slug: true, shortName: true, name: true, logoUrl: true, color: true } },
          scores: { select: { year: true, minScore: true }, orderBy: { year: "desc" }, take: 1 },
        },
      },
    },
  })

  assert(matches.length === 5, "Got 5 matches")
  matches.forEach((m, i) => {
    const f = m.faculty!
    assert(typeof f.id === "string", `  Row ${i + 1}: faculty.id is string`)
    assert(typeof f.university.shortName === "string", `  Row ${i + 1}: university.shortName ok`)
    assert(typeof f.university.color === "string", `  Row ${i + 1}: university.color ok (Phase 2 fix)`)
    assert(f.scores.length === 1, `  Row ${i + 1}: has latest score`)
    assert(m.score >= 0 && m.score <= 1, `  Row ${i + 1}: score in [0,1]`)
    assert(m.rank === i + 1, `  Row ${i + 1}: rank matches order`)
  })

  console.log(`     Sample: #1 ${matches[0].faculty!.university.shortName} — ${matches[0].faculty!.name}`)
}

async function testProfileLinkage() {
  console.log("\n🧩 Test 5: MBTIProfile + FacultyMBTIMatch linkage")
  const profile = await prisma.mBTIProfile.findUnique({
    where:   { type: "INTJ" },
    include: { facultyMatches: { where: { facultyId: { not: null } }, take: 3 } },
  })
  assert(profile !== null, "INTJ profile exists")
  assert(profile!.facultyMatches.length >= 3, "INTJ has ≥ 3 linked matches",
    `got ${profile!.facultyMatches.length}`)
}

async function testCrossReferencePrediction() {
  console.log("\n🔀 Test 6: Cross-reference data shape (simulates Phase 3.1)")
  // Find a faculty that's both in top INTJ matches and has any predictionHistory row
  const intjFaculties = await prisma.facultyMBTIMatch.findMany({
    where:  { mbtiType: "INTJ", facultyId: { not: null } },
    select: { facultyId: true },
    take:   20,
  })
  const facultyIds = intjFaculties.map((m) => m.facultyId!)
  const predictions = await prisma.predictionHistory.findMany({
    where:  { facultyId: { in: facultyIds } },
    take:   3,
  })
  console.log(`     Found ${predictions.length} prediction(s) overlapping INTJ recommendations`)
  assert(true, "Cross-reference query executes without error")
}

async function testMBTIResultStructure() {
  console.log("\n💾 Test 7: MBTIResult records have valid scores JSON")
  const recent = await prisma.mBTIResult.findFirst({
    orderBy: { createdAt: "desc" },
    select:  { id: true, mbtiType: true, scores: true },
  })
  assert(recent !== null, "At least one MBTIResult exists")
  if (recent) {
    const scores = recent.scores as Record<string, number>
    const requiredKeys = ["E", "I", "S", "N", "T", "F", "J", "P"]
    requiredKeys.forEach((k) => {
      assert(typeof scores[k] === "number", `  scores.${k} is number`, `got ${typeof scores[k]}`)
    })
    // Verify type letters match scores
    const computed =
      ((scores.E ?? 0) >= (scores.I ?? 0) ? "E" : "I") +
      ((scores.S ?? 0) >= (scores.N ?? 0) ? "S" : "N") +
      ((scores.T ?? 0) >= (scores.F ?? 0) ? "T" : "F") +
      ((scores.J ?? 0) >= (scores.P ?? 0) ? "J" : "P")
    assert(computed === recent.mbtiType,
      "scores → type consistency",
      `computed ${computed} vs stored ${recent.mbtiType}`)
    console.log(`     id=${recent.id.slice(0, 8)}… type=${recent.mbtiType}`)
  }
}

async function testReasonsAreDiverse() {
  console.log("\n💬 Test 8: Reason strings are not all identical")
  const reasons = await prisma.facultyMBTIMatch.findMany({
    where:   { mbtiType: "ENFP", facultyId: { not: null } },
    select:  { reason: true },
    orderBy: { rank: "asc" },
    take:    20,
  })
  const uniqueReasons = new Set(reasons.map((r) => r.reason)).size
  assert(uniqueReasons >= 2, "ENFP top 20 use at least 2 different reason templates",
    `only ${uniqueReasons} unique`)
  console.log(`     ${uniqueReasons} unique reasons across 20 rows`)
}

async function testFallbackRowsStillExist() {
  console.log("\n🛟 Test 9: Old field-only fallback rows preserved")
  const fallback = await prisma.facultyMBTIMatch.count({ where: { facultyId: null } })
  assert(fallback === 64, "64 fallback rows (facultyId=null) preserved", `got ${fallback}`)
}

async function testScoreOrdering() {
  console.log("\n📈 Test 10: Top matches are ordered by score desc within type")
  const matches = await prisma.facultyMBTIMatch.findMany({
    where:   { mbtiType: "ESTJ", facultyId: { not: null } },
    orderBy: { rank: "asc" },
    take:    10,
    select:  { rank: true, score: true },
  })
  let monotonic = true
  for (let i = 1; i < matches.length; i++) {
    if (matches[i].score > matches[i - 1].score + 0.001) {
      monotonic = false
      break
    }
  }
  assert(monotonic, "ESTJ scores are non-increasing by rank",
    `rank 1=${matches[0]?.score.toFixed(3)} … rank ${matches.length}=${matches[matches.length - 1]?.score.toFixed(3)}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n══════════════════════════════════════════════════")
  console.log("  MBTI Redesign — End-to-End Data Test")
  console.log("══════════════════════════════════════════════════")

  try {
    await testMatchCoverage()
    await testRanksAreUnique()
    await testFacultiesExist()
    await testTopFacultiesQuery()
    await testProfileLinkage()
    await testCrossReferencePrediction()
    await testMBTIResultStructure()
    await testReasonsAreDiverse()
    await testFallbackRowsStillExist()
    await testScoreOrdering()
  } catch (e) {
    console.error("\n💥 Unexpected error during tests:", e)
    failed++
  }

  console.log("\n══════════════════════════════════════════════════")
  console.log(`  Result: ${passed} passed, ${failed} failed`)
  console.log("══════════════════════════════════════════════════\n")

  await prisma.$disconnect()
  process.exit(failed === 0 ? 0 : 1)
}

main()
