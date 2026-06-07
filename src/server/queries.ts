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
    // Filter by relation in a single roundtrip instead of doing
    // findUnique(uni) → findMany(faculty).
    const rows = await prisma.faculty.findMany({
      where:   { university: { slug: uniSlug } },
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

// ── Profile stats ─────────────────────────────────────────────────────────────

export type ProfileStats = {
  totalAnalyses: number
  highChanceCount: number
  firstAnalysisAt: Date | null
  joinedAt: Date | null
}

export async function getProfileStats(clerkId: string): Promise<ProfileStats> {
  // Single roundtrip: pull the user, their createdAt, and an aggregate of
  // their predictions in one parallel batch. Avoids the previous 4-query chain
  // (findUnique → 2× count → findFirst).
  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true, createdAt: true },
  })
  if (!user) return { totalAnalyses: 0, highChanceCount: 0, firstAnalysisAt: null, joinedAt: null }

  // One groupBy gets both total and per-chance counts in a single query.
  // Parallel with firstAnalysisAt for minimum wall-clock time.
  const [grouped, first] = await Promise.all([
    prisma.predictionHistory.groupBy({
      by:      ["chance"],
      where:   { userId: user.id },
      _count:  { _all: true },
    }),
    prisma.predictionHistory.findFirst({
      where:   { userId: user.id },
      orderBy: { createdAt: "asc" },
      select:  { createdAt: true },
    }),
  ])

  let total = 0
  let highChance = 0
  for (const g of grouped) {
    total += g._count._all
    if (g.chance === "high") highChance = g._count._all
  }

  return {
    totalAnalyses:   total,
    highChanceCount: highChance,
    firstAnalysisAt: first?.createdAt ?? null,
    joinedAt:        user.createdAt,
  }
}

// ── Min-scores landing page ───────────────────────────────────────────────────

export type MinScoreEntry = {
  facultyId:     string
  facultyName:   string
  program:       string
  majorName:     string | null
  field:         string
  minScore:      number
  year:          number
  universitySlug: string
  universityName: string
  universityShortName: string
}

/** Lowest TCAS cutoff per faculty for the latest year — for SEO landing page */
export const getMinScoresLatest = unstable_cache(
  async (limit = 500): Promise<MinScoreEntry[]> => {
    const latestYear = await getLatestTcasYear()
    if (!latestYear) return []

    const rows = await prisma.tcasScore.findMany({
      where:   { year: latestYear, minScore: { gt: 0 } },
      orderBy: { minScore: "asc" },
      take:    limit,
      include: {
        faculty: {
          select: {
            id: true, name: true, program: true, majorName: true, field: true,
            university: { select: { slug: true, name: true, shortName: true } },
          },
        },
      },
    })

    return rows.map((r) => ({
      facultyId:           r.faculty.id,
      facultyName:         r.faculty.name,
      program:             normalizeProgram(r.faculty.program),
      majorName:           normalizeMajor(r.faculty.majorName) || null,
      field:               r.faculty.field as string,
      minScore:            r.minScore,
      year:                r.year,
      universitySlug:      r.faculty.university.slug,
      universityName:      r.faculty.university.name,
      universityShortName: r.faculty.university.shortName,
    }))
  },
  ["min-scores-latest"],
  { revalidate: 3600, tags: ["tcas-scores"] }
)

// ── Latest MBTI for a user ────────────────────────────────────────────────────

export async function getLatestMBTIForUser(clerkId: string): Promise<{
  type: string
  nickname: string
  emoji: string
  color: string
  takenAt: Date
} | null> {
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return null

  const result = await prisma.mBTIResult.findFirst({
    where:   { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { profile: { select: { nickname: true, emoji: true, color: true } } },
  })
  if (!result) return null

  return {
    type:     result.mbtiType,
    nickname: result.profile.nickname,
    emoji:    result.profile.emoji,
    color:    result.profile.color,
    takenAt:  result.createdAt,
  }
}

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

// Not cached — user-specific, changes on each prediction.
// Single nested query: get the user and their 20 latest predictions in 1 roundtrip.
export async function getDashboardHistory(clerkId: string): Promise<PredictionHistoryItem[]> {
  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: {
      predictions: {
        take:    20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, userScore: true, chance: true, gap: true, createdAt: true,
          faculty: {
            select: {
              id: true, name: true, program: true, majorName: true, detail: true,
              university: { select: { name: true, slug: true, color: true } },
            },
          },
        },
      },
    },
  })
  if (!user) return []

  return user.predictions.map((r) => ({
    id:        r.id,
    userScore: r.userScore,
    chance:    r.chance as "high" | "competitive" | "low",
    gap:       r.gap,
    createdAt: r.createdAt,
    faculty:   r.faculty,
  }))
}
