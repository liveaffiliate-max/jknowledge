import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { normalizeDetail, normalizeMajor, normalizeProgram } from "@/lib/normalize-faculty"
import type {
  FacultyField,
  FacultyPreview,
  FacultyWithScores,
  RequirementData,
  University,
  UniversityWithStats,
} from "@/types/tcas"

// ── Latest TCAS year ──────────────────────────────────────────────────────────

export const getLatestTcasYear = unstable_cache(
  async (): Promise<number | null> => {
    const result = await prisma.tcasScore.aggregate({ _max: { year: true } })
    return result._max.year ?? null
  },
  ["tcas-latest-year"],
  { revalidate: 3600, tags: ["tcas-scores"] }
)

// ── Faculty helpers (internal) ────────────────────────────────────────────────

/** Deduplicate faculty rows by normalized display key, keeping the one with most scores */
function deduplicateFacultyRows<T extends {
  name: string
  program: string
  majorName: string | null
  detail: string | null
  _count: { scores: number }
}>(rows: T[]): T[] {
  const seen = new Map<string, T>()
  for (const f of rows) {
    const key = [
      f.name,
      normalizeProgram(f.program),
      normalizeMajor(f.majorName),
      normalizeDetail(f.detail, f.name),
    ].join("|")
    const existing = seen.get(key)
    if (!existing || f._count.scores > existing._count.scores) {
      seen.set(key, f)
    }
  }
  return [...seen.values()]
}

/** Sort faculty rows by name → program → majorName (Thai locale) */
function sortFacultyRows<T extends { name: string; program: string; majorName: string | null }>(
  rows: T[]
): T[] {
  return [...rows].sort((a, b) =>
    `${a.name}|${a.program}|${a.majorName ?? ""}`.localeCompare(
      `${b.name}|${b.program}|${b.majorName ?? ""}`,
      "th"
    )
  )
}

// ── Universities ──────────────────────────────────────────────────────────────

export const getUniversities = unstable_cache(
  async (): Promise<University[]> => {
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
  },
  ["universities-list"],
  { revalidate: 3600, tags: ["universities"] }
)

/** /scores — grid page: unis + faculty count */
export const getUniversitiesWithStats = unstable_cache(
  async (): Promise<UniversityWithStats[]> => {
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
  },
  ["universities-with-stats"],
  { revalidate: 3600, tags: ["universities"] }
)

/** /scores/[uniSlug] — university header */
export const getUniversityBySlug = unstable_cache(
  async (slug: string): Promise<University | null> => {
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
  },
  ["university-by-slug"],
  { revalidate: 3600, tags: ["universities"] }
)

/** /scores/[uniSlug] — faculty list with latest score only (not all historical scores) */
export const getFacultiesByUniSlug = unstable_cache(
  async (uniSlug: string): Promise<FacultyPreview[]> => {
    const uni = await prisma.university.findUnique({ where: { slug: uniSlug } })
    if (!uni) return []

    const rows = await prisma.faculty.findMany({
      where: { universityId: uni.id },
      orderBy: { name: "asc" },
      include: {
        scores: { orderBy: { year: "desc" }, take: 1 },
        _count: { select: { scores: true } },
      },
    })

    return sortFacultyRows(deduplicateFacultyRows(rows)).map((f) => {
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
          scoreCount: f._count.scores,
        }
      })
  },
  ["faculties-by-uni-slug"],
  { revalidate: 1800, tags: ["faculties"] }
)

// ── Faculties (for Analyze form) ──────────────────────────────────────────────

export const getFacultiesByUniversityId = unstable_cache(
  async (universityId: string, filterYear?: number) => {
    const rows = await prisma.faculty.findMany({
      where: {
        universityId,
        ...(filterYear ? { scores: { some: { year: filterYear } } } : {}),
      },
      orderBy: { name: "asc" },
      include: { _count: { select: { scores: true } } },
    })

    return sortFacultyRows(deduplicateFacultyRows(rows)).map((f) => ({
        id: f.id,
        universityId: f.universityId,
        name: f.name,
        program: normalizeProgram(f.program),
        majorName: normalizeMajor(f.majorName) || undefined,
        detail: normalizeDetail(f.detail, f.name) || undefined,
        field: f.field as unknown as FacultyField,
      }))
  },
  ["faculties-by-university-id"],
  { revalidate: 1800, tags: ["faculties"] }
)

// ── Faculty Requirement (weights) ─────────────────────────────────────────────

export const getFacultyRequirement = unstable_cache(
  async (facultyId: string): Promise<RequirementData | null> => {
    const row = await prisma.facultyRequirement.findUnique({
      where: { facultyId },
    })
    if (!row) return null
    return {
      weights:     row.weights as Record<string, number>,
      estMinScore: row.estMinScore ?? null,
    }
  },
  ["faculty-requirement"],
  { revalidate: 3600, tags: ["faculties"] }
)

// ── Faculty + Scores (for Analyze action) ────────────────────────────────────

export const getFacultyWithScores = unstable_cache(
  async (facultyId: string): Promise<FacultyWithScores | null> => {
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
  },
  ["faculty-with-scores"],
  { revalidate: 1800, tags: ["faculties", "tcas-scores"] }
)

// ── Dashboard ─────────────────────────────────────────────────────────────────

export type PredictionHistoryItem = {
  id:           string
  userScore:    number
  chance:       "high" | "competitive" | "low"
  gap:          number
  createdAt:    Date
  faculty: {
    id:         string
    name:       string
    program:    string
    majorName:  string | null
    detail:     string | null
    university: { name: string; slug: string; color: string }
  }
}

// Not cached — user-specific, changes on each prediction
export async function getDashboardHistory(clerkId: string): Promise<PredictionHistoryItem[]> {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return []

  const rows = await prisma.predictionHistory.findMany({
    where:   { userId: user.id },
    orderBy: { createdAt: "desc" },
    take:    20,
    include: {
      faculty: {
        select: {
          id: true, name: true, program: true, majorName: true, detail: true,
          university: { select: { name: true, slug: true, color: true } },
        },
      },
    },
  })

  return rows.map((r) => ({
    id:        r.id,
    userScore: r.userScore,
    chance:    r.chance as "high" | "competitive" | "low",
    gap:       r.gap,
    createdAt: r.createdAt,
    faculty:   r.faculty,
  }))
}
