/**
 * Detection-only script — finds Faculty rows that are semantically the same
 * across years even though their raw fields differ slightly. Surfaced after
 * a user reported COTMES rows like:
 *   • "ทันตแพทยศาสตรบัณฑิต" + detail=null  (1 ปี · TCAS64)
 *   • "หลักสูตรทันตแพทยศาสตรบัณฑิต จุฬาลงกรณ์มหาวิทยาลัย" + detail="ภาษาไทย" (6 ปี)
 *
 * The current display dedup (queries.ts/deduplicateFacultyRows) keys on:
 *   name + normalizeProgram(program) + normalizeMajor(majorName) + normalizeDetail(detail)
 *
 * `normalizeProgram` doesn't strip "หลักสูตร" or trailing embedded uni name,
 * so the keys differ → no merge. This script applies a LOOSER key to detect
 * what would merge if we tightened the rules.
 *
 * Run: npx tsx scripts/find-duplicate-faculties.ts
 *
 * Output: console table per uni + sample groups for manual review.
 * Does NOT modify the database.
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { normalizeDetail, normalizeMajor } from "../src/lib/normalize-faculty"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

// ── Loose key derivation ────────────────────────────────────────────────────
// More aggressive than the production normalizer — strips "หลักสูตร" and any
// trailing embedded university name (common in TCAS65+ data). Treats the
// default Thai detail as empty so it doesn't break dedup.

const THAI_DEFAULT_DETAILS = new Set(["ภาษาไทย", "ปกติ", "ภาคปกติ"])
const THAI_DEFAULT_MAJORS  = new Set(["ภาษาไทย"])

function stripEmbeddedUniSuffix(s: string, uniName: string): string {
  // Try to remove the parent university's name if it appears at the end.
  // Falls back to a generic "...มหาวิทยาลัยX" pattern if exact match fails.
  let out = s.trim()
  if (uniName && out.endsWith(uniName)) {
    out = out.slice(0, -uniName.length).trim()
  }
  // Generic catch-all: "...มหาวิทยาลัยฯลฯ", "...จุฬาลงกรณ์มหาวิทยาลัย"
  out = out
    .replace(/\s*(จุฬาลงกรณ์มหาวิทยาลัย|มหาวิทยาลัย[^\s]+|สถาบัน[^\s]+|วิทยาลัย[^\s]+)$/u, "")
    .trim()
  return out
}

/**
 * Loose-normalize program string while PRESERVING the actual major info.
 *
 * Why not reuse `normalizeProgram`?
 *   normalizeProgram extracts text from "(...)" parens — which collapses
 *   "หลักสูตรศิลปศาสตรบัณฑิต (ศศ.บ.) สาขาวิชาสารสนเทศศึกษา ภาคปกติ"
 *   to just "ศศ.บ.", losing "สารสนเทศศึกษา". That over-merges sibling majors.
 *
 * This version instead:
 *   1. DELETES "(ศศ.บ.)" / "(วท.บ.)" / "(วศ.บ.)" parens — they're degree-type
 *      abbreviations, not identity. Same degree-type, different major → still
 *      different rows.
 *   2. Strips leading boilerplate "หลักสูตร" / "สาขาวิชา"
 *   3. Strips trailing embedded university name
 *   4. Strips trailing "ภาคปกติ" / "ภาคพิเศษ" / etc — section labels are detail-level
 *   5. Collapses whitespace
 */
function looseProgram(program: string, uniName: string): string {
  let s = program.trim()
  // 1. Drop parenthetical degree-type abbreviations like "(ศศ.บ.)" "(วท.บ.)"
  s = s.replace(/\s*\([฀-๿.]+\.[฀-๿]\.\)\s*/gu, " ")
  // 2. Strip leading boilerplate
  s = s.replace(/^(หลักสูตร|สาขาวิชา|สาขา|วิชา|วิชาเอก)\s*/u, "")
  // 3. Strip DEFAULT section labels only — "ภาคปกติ" is the implicit baseline
  //    and contributes nothing to identity. KEEP ภาคพิเศษ / นานาชาติ / etc
  //    because they DO indicate distinct programs (different fees/schedule).
  s = s.replace(/\s*(ภาคปกติ|หลักสูตรปกติ|โครงการปกติ)$/u, "")
  // 4. Strip embedded uni name suffix (eg. "...จุฬาลงกรณ์มหาวิทยาลัย")
  s = stripEmbeddedUniSuffix(s, uniName)
  // 5. Collapse whitespace
  s = s.replace(/\s+/g, " ").trim()
  return s
}

function looseDetail(detail: string | null | undefined, facultyName: string): string {
  const norm = normalizeDetail(detail ?? "", facultyName)
  if (!norm) return ""
  return THAI_DEFAULT_DETAILS.has(norm.trim()) ? "" : norm
}

function looseMajor(majorName: string | null | undefined): string {
  const norm = normalizeMajor(majorName ?? "")
  if (!norm) return ""
  return THAI_DEFAULT_MAJORS.has(norm.trim()) ? "" : norm
}

function looseKey(faculty: {
  name:       string
  program:    string
  majorName:  string | null
  detail:     string | null
  university: { name: string }
}): string {
  return [
    faculty.name.trim(),
    looseProgram(faculty.program, faculty.university.name),
    looseMajor(faculty.majorName),
    looseDetail(faculty.detail, faculty.name),
  ].join("|")
}

// ── Main ────────────────────────────────────────────────────────────────────

interface DupGroup {
  key:        string
  uniName:    string
  uniSlug:    string
  faculties: Array<{
    id:          string
    name:        string
    program:     string
    majorName:   string | null
    detail:      string | null
    scoreCount:  number
    latestYear:  number | null
  }>
}

async function main() {
  console.log("Loading faculties + scores…")
  const rows = await prisma.faculty.findMany({
    include: {
      university: { select: { id: true, name: true, slug: true, shortName: true } },
      scores:     { select: { year: true }, orderBy: { year: "desc" } },
    },
  })
  console.log(`Loaded ${rows.length} faculties from ${new Set(rows.map(r => r.universityId)).size} universities.\n`)

  // Group by (universityId, looseKey)
  const buckets = new Map<string, DupGroup>()
  for (const f of rows) {
    const k = `${f.universityId}::${looseKey(f)}`
    let g = buckets.get(k)
    if (!g) {
      g = {
        key:       looseKey(f),
        uniName:   f.university.name,
        uniSlug:   f.university.slug,
        faculties: [],
      }
      buckets.set(k, g)
    }
    g.faculties.push({
      id:         f.id,
      name:       f.name,
      program:    f.program,
      majorName:  f.majorName,
      detail:     f.detail,
      scoreCount: f.scores.length,
      latestYear: f.scores[0]?.year ?? null,
    })
  }

  // Only groups with > 1 row are candidates
  const dupGroups = [...buckets.values()].filter((g) => g.faculties.length > 1)

  console.log("═══════════════════════════════════════════════════")
  console.log(`Found ${dupGroups.length} duplicate groups`)
  console.log("═══════════════════════════════════════════════════\n")

  if (dupGroups.length === 0) {
    console.log("No duplicates detected with the current loose-key rules.")
    return
  }

  // Per-uni breakdown
  const perUni = new Map<string, { name: string; slug: string; groups: number; rows: number }>()
  for (const g of dupGroups) {
    const e = perUni.get(g.uniSlug) ?? { name: g.uniName, slug: g.uniSlug, groups: 0, rows: 0 }
    e.groups += 1
    e.rows   += g.faculties.length
    perUni.set(g.uniSlug, e)
  }
  const ranked = [...perUni.values()].sort((a, b) => b.rows - a.rows)

  console.log("Per-university breakdown (top 15 by row count):")
  console.log("─".repeat(70))
  console.log(`${"University".padEnd(40)} ${"Groups".padStart(8)} ${"Dup rows".padStart(10)} ${"Saveable".padStart(10)}`)
  console.log("─".repeat(70))
  for (const u of ranked.slice(0, 15)) {
    // "Saveable" = how many rows would be removed if we merged each group to 1 winner
    const saveable = u.rows - u.groups
    console.log(
      `${u.name.slice(0, 38).padEnd(40)} ${String(u.groups).padStart(8)} ${String(u.rows).padStart(10)} ${String(saveable).padStart(10)}`,
    )
  }
  console.log("─".repeat(70))
  const totalSaveable = dupGroups.reduce((s, g) => s + (g.faculties.length - 1), 0)
  console.log(`Total saveable rows across all uni: ${totalSaveable}`)
  console.log()

  // Sample dup groups for manual review
  console.log("═══════════════════════════════════════════════════")
  console.log("Sample groups for manual review (showing 10):")
  console.log("═══════════════════════════════════════════════════\n")
  // Sort by group size desc, then by total scoreCount desc — surface the worst first
  const sorted = [...dupGroups].sort((a, b) => {
    const sa = a.faculties.length * 1000 + a.faculties.reduce((s, f) => s + f.scoreCount, 0)
    const sb = b.faculties.length * 1000 + b.faculties.reduce((s, f) => s + f.scoreCount, 0)
    return sb - sa
  })

  for (const g of sorted.slice(0, 10)) {
    console.log(`▸ [${g.uniName}]`)
    console.log(`  loose key: ${g.key.slice(0, 100)}${g.key.length > 100 ? "…" : ""}`)
    for (const f of g.faculties) {
      const program = f.program.length > 60 ? f.program.slice(0, 58) + "…" : f.program
      const detail  = f.detail ?? "—"
      console.log(
        `    · ${f.scoreCount}ปี · TCAS${f.latestYear ? f.latestYear - 2500 : "?"} · prog="${program}" · detail="${detail}" · id=${f.id.slice(-8)}`,
      )
    }
    console.log()
  }

  // Risk surfacing — groups where the "loose merge" might be wrong
  const ambiguousGroups = dupGroups.filter((g) => {
    // Flag: any pair where details look semantically different (international vs Thai)
    const details = g.faculties.map((f) => (f.detail ?? "").trim()).filter(Boolean)
    return details.some((d) =>
      /นานาชาติ|อังกฤษ|english|inter/i.test(d),
    )
  })
  if (ambiguousGroups.length > 0) {
    console.log("⚠️  Potentially over-merging — review these manually:")
    console.log(`(${ambiguousGroups.length} groups contain "นานาชาติ" or "ภาษาอังกฤษ" in detail)`)
    for (const g of ambiguousGroups.slice(0, 5)) {
      console.log(`  ▸ ${g.uniName} :: ${g.key.slice(0, 80)}`)
    }
    console.log()
  }

  // CSV-like export for full analysis
  console.log("═══════════════════════════════════════════════════")
  console.log(`Run with output > /tmp/dup-report.tsv for full data`)
  console.log("═══════════════════════════════════════════════════\n")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
