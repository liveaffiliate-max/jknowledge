import { prisma } from "@/lib/prisma"
import type {
  FacultyField,
  FacultyPreview,
  FacultyWithScores,
  RequirementData,
  University,
  UniversityWithStats,
} from "@/types/tcas"

// ── Normalizers for messy CSV data ───────────────────────────────────────────

/**
 * Normalize program field for clean display:
 * "วท.บ. สาขาวิชาเกษตรศาสตร์"                     → "เกษตรศาสตร์"
 * "ค.บ. หลักสูตรปกติ"                              → "หลักสูตรปกติ"
 * "วิทยาศาสตรบัณฑิต (เกษตรศาสตร์) เกษตรศาสตร์"    → "เกษตรศาสตร์"
 * "พ.บ."                                           → "" (abbreviation only)
 */
function normalizeProgram(s: string | null | undefined): string {
  if (!s) return ""
  const p = s.trim()
  // Case 1: degree abbreviation (วท.บ. / ค.บ. / วศ.บ. etc.)
  // Use afterAbbrev !== p to catch bare abbrevs like "พ.บ." (afterAbbrev = "")
  const afterAbbrev = p.replace(/^[฀-๿.]+\.[฀-๿]\.\s*/u, "").trim()
  if (afterAbbrev !== p) {
    return afterAbbrev
      .replace(/^สาขาวิชา\s*/, "")
      .replace(/^สาขา\s*/, "")
      .trim()
    // Returns "" for bare abbreviations (filtered by .filter(Boolean) in display)
  }
  // Case 2: full Thai degree name with parenthesised subject
  // e.g. "วิทยาศาสตรบัณฑิต (เกษตรศาสตร์) เกษตรศาสตร์" → "เกษตรศาสตร์"
  const parenMatch = p.match(/\(([^)]+)\)/)
  if (parenMatch) return parenMatch[1].trim()
  return p
}

/**
 * Normalize majorName for clean display:
 * "วิชาเอกพืชสวน"                       → "พืชสวน"   (leading วิชาเอก stripped)
 * "เกษตรศาสตร์ วิชาเอกพืชสวน แผนที่ 1" → "พืชสวน แผนที่ 1" (mid-string วิชาเอก)
 * "หลักสูตรนานาชาติ"                    → "หลักสูตรนานาชาติ" (no วิชาเอก, keep as-is)
 */
function normalizeMajor(s: string | null | undefined): string {
  if (!s) return ""
  // Strip leading วิชาเอก / เอก prefix (มก.-style)
  const stripped = s.replace(/^(วิชาเอก|เอก)\s*/u, "").trim()
  // Handle "SUBJECT วิชาเอกSPEC [แผนที่N]" pattern (มข.-style)
  // e.g. "เกษตรศาสตร์ วิชาเอกพืชสวน แผนที่ 1" → "พืชสวน แผนที่ 1"
  const match = stripped.match(/^.+?\s+วิชาเอก\s*(.+)$/)
  if (match) return match[1].trim()
  return stripped
}

/**
 * Normalize detail field — strip noise for display:
 * • Removes admission-method boilerplate (Admission, ใช้คะแนน, การรับตรง, ...)
 * • Removes redundant major concatenations (contains วิชาเอก)
 * • Removes strings that are just a prefix of the faculty name
 *
 * "การรับตรงร่วมกัน (รหัส 431613124-เศรษฐศาสตร์)" → "เศรษฐศาสตร์"
 * "Admission-หลักสูตร วิชาเอกภาษาไทย"              → "" (contains วิชาเอก)
 * "คณะเกษตรศาสตร์ เกษตรศาสตร์ วิชาเอกพืชสวน"      → "" (contains วิชาเอก)
 * "โครงการปกติ"                                    → "โครงการปกติ" ✓
 */
function normalizeDetail(
  s: string | null | undefined,
  facultyName?: string
): string {
  if (!s) return ""
  let d = s.trim()
  // Format normalisation
  d = d.replace(/^Admission-\s*/u, "")
  const m = d.match(/การรับตรงร่วมกัน\s*\(รหัส\s*[\w-]+-([^)]+?)\s*\)?$/u)
  if (m) d = m[1].replace(/\)$/, "").trim()
  // Filter: admission-method boilerplate
  if (/^Admission(\s|$|\()/iu.test(d)) return ""
  if (/^ใช้คะแนน/.test(d))             return ""
  if (/^การคัดเลือก/.test(d))          return ""
  if (/^การรับตรง/.test(d))            return ""
  if (/^รับตรง/.test(d))               return ""
  // Filter: redundant concatenation that STARTS with the faculty name
  // e.g. "คณะเกษตรศาสตร์ เกษตรศาสตร์ วิชาเอกพืชสวน แผนที่ 1" (มข.-style)
  // NOTE: do NOT filter just because it contains "วิชาเอก" — that's a valid
  // specialisation differentiator at e.g. จุฬา ("วิชาเอกเคมี", "วิชาเอกฟิสิกส์")
  if (facultyName && d.startsWith(facultyName)) return ""
  return d
}

// ── Latest TCAS year ──────────────────────────────────────────────────────────

/** ปีล่าสุดที่มีข้อมูลใน TcasScore */
export async function getLatestTcasYear(): Promise<number | null> {
  const result = await prisma.tcasScore.aggregate({ _max: { year: true } })
  return result._max.year ?? null
}

// ── Universities ──────────────────────────────────────────────────────────────

export async function getUniversities(): Promise<University[]> {
  const rows = await prisma.university.findMany({ orderBy: { name: "asc" } })
  return rows.map((u) => ({
    id: u.id,
    slug: u.slug,
    name: u.name,
    shortName: u.shortName,
    location: u.location,
    color: u.color,
    logoUrl: u.logoUrl ?? undefined,
  }))
}

/** /scores — grid page: unis + faculty count */
export async function getUniversitiesWithStats(): Promise<UniversityWithStats[]> {
  const [rows, latestYear] = await Promise.all([
    prisma.university.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { faculties: true } } },
    }),
    getLatestTcasYear(),
  ])
  return rows.map((u) => ({
    id: u.id,
    slug: u.slug,
    name: u.name,
    shortName: u.shortName,
    location: u.location,
    color: u.color,
    logoUrl: u.logoUrl ?? undefined,
    facultyCount: u._count.faculties,
    latestYear,
  }))
}

/** /scores/[uniSlug] — university header */
export async function getUniversityBySlug(slug: string): Promise<University | null> {
  const u = await prisma.university.findUnique({ where: { slug } })
  if (!u) return null
  return {
    id: u.id,
    slug: u.slug,
    name: u.name,
    shortName: u.shortName,
    location: u.location,
    color: u.color,
    logoUrl: u.logoUrl ?? undefined,
  }
}

/** /scores/[uniSlug] — faculty list with latest scores */
export async function getFacultiesByUniSlug(uniSlug: string): Promise<FacultyPreview[]> {
  const uni = await prisma.university.findUnique({ where: { slug: uniSlug } })
  if (!uni) return []

  const rows = await prisma.faculty.findMany({
    where: { universityId: uni.id },
    orderBy: { name: "asc" },
    include: { scores: { orderBy: { year: "desc" } } },
  })

  // Dedup by normalized display key — keeps canonical (most score records)
  const seen = new Map<string, (typeof rows)[number]>()
  for (const f of rows) {
    const key = [
      f.name,
      normalizeProgram(f.program),        // normalized — matches what's displayed
      normalizeMajor(f.majorName),
      normalizeDetail(f.detail, f.name),
    ].join("|")
    const existing = seen.get(key)
    if (!existing || f.scores.length > existing.scores.length) {
      seen.set(key, f)
    }
  }

  return [...seen.values()]
    .sort((a, b) =>
      `${a.name}|${a.program}|${a.majorName ?? ""}`.localeCompare(
        `${b.name}|${b.program}|${b.majorName ?? ""}`,
        "th"
      )
    )
    .map((f) => {
      const latest = f.scores[0] ?? null
      return {
        id: f.id,
        slug: f.slug,
        name: f.name,
        program: normalizeProgram(f.program),
        majorName: normalizeMajor(f.majorName) || undefined,
        detail: normalizeDetail(f.detail, f.name) || undefined,
        field: f.field as unknown as FacultyField,
        latestYear: latest?.year ?? null,
        latestMinScore: latest?.minScore ?? null,
        latestAvgScore: latest?.avgScore ?? null,
        latestSeats: latest?.seats ?? null,
        scoreCount: f.scores.length,
      }
    })
}

// ── Faculties (for Analyze form) ──────────────────────────────────────────────

export async function getFacultiesByUniversityId(
  universityId: string,
  filterYear?: number
) {
  const rows = await prisma.faculty.findMany({
    where: {
      universityId,
      ...(filterYear ? { scores: { some: { year: filterYear } } } : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { scores: true } } },
  })

  const seen = new Map<string, (typeof rows)[number]>()
  for (const f of rows) {
    const key = [
      f.name,
      normalizeProgram(f.program),        // normalized — matches what's displayed
      normalizeMajor(f.majorName),
      normalizeDetail(f.detail, f.name),
    ].join("|")
    const existing = seen.get(key)
    if (!existing || f._count.scores > existing._count.scores) {
      seen.set(key, f)
    }
  }

  return [...seen.values()]
    .sort((a, b) => {
      const ka = `${a.name}|${a.program}|${a.majorName ?? ""}`
      const kb = `${b.name}|${b.program}|${b.majorName ?? ""}`
      return ka.localeCompare(kb, "th")
    })
    .map((f) => ({
      id: f.id,
      universityId: f.universityId,
      name: f.name,
      program: normalizeProgram(f.program),
      majorName: normalizeMajor(f.majorName) || undefined,
      detail: normalizeDetail(f.detail, f.name) || undefined,
      field: f.field as unknown as FacultyField,
    }))
}

// ── Faculty Requirement (weights) ─────────────────────────────────────────────

export async function getFacultyRequirement(
  facultyId: string
): Promise<RequirementData | null> {
  const row = await prisma.facultyRequirement.findUnique({
    where: { facultyId },
  })
  if (!row) return null
  return {
    weights:     row.weights as Record<string, number>,
    estMinScore: row.estMinScore ?? null,
  }
}

// ── Faculty + Scores (for Analyze action) ────────────────────────────────────

export async function getFacultyWithScores(
  facultyId: string
): Promise<FacultyWithScores | null> {
  const f = await prisma.faculty.findUnique({
    where: { id: facultyId },
    include: {
      university: true,
      scores: { orderBy: { year: "asc" } },
    },
  })
  if (!f) return null

  return {
    id: f.id,
    universityId: f.universityId,
    slug: f.slug,
    name: f.name,
    program: normalizeProgram(f.program),
    majorName: normalizeMajor(f.majorName) || undefined,
    detail: normalizeDetail(f.detail, f.name) || undefined,
    field: f.field as unknown as FacultyField,
    university: {
      id: f.university.id,
      slug: f.university.slug,
      name: f.university.name,
      shortName: f.university.shortName,
      location: f.university.location,
      color: f.university.color,
      logoUrl: f.university.logoUrl ?? undefined,
    },
    scores: f.scores.map((s) => ({
      year: s.year,
      minScore: s.minScore,
      avgScore: s.avgScore,
      maxScore: s.maxScore ?? undefined,
      seats: s.seats ?? undefined,
    })),
  }
}
