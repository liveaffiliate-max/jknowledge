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
