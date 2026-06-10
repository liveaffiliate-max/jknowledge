import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { MBTIProfile, MBTIQuestion } from "@/types/mbti"
import { getMBTIProfile } from "@/data/mbti-types"
import type { LucideIcon } from "lucide-react"
import { Brain } from "lucide-react"

// ── Questions ─────────────────────────────────────────────────────────────────

export const getMBTIQuestions = unstable_cache(
  async (): Promise<MBTIQuestion[]> => {
    const rows = await prisma.mBTIQuestion.findMany({
      where:   { active: true },
      orderBy: { order: "asc" },
    })
    return rows.map((q) => ({
      id:        q.order,
      dimension: q.dimension as MBTIQuestion["dimension"],
      text:      q.text,
      optionA:   q.optionA,
      optionB:   q.optionB,
    }))
  },
  ["mbti-questions"],
  { revalidate: 86400, tags: ["mbti"] }
)

// ── Profile ───────────────────────────────────────────────────────────────────

// unstable_cache serialises return values to JSON.
// LucideIcon is a React function component → cannot be serialised.
// Solution: cache only the serialisable fields, then inject `icon` at call-time
// from the local mbti-types data file (never goes to the network).

type SerializableMBTIProfile = Omit<MBTIProfile, "icon">

async function _getMBTIProfileByType(
  type: string
): Promise<SerializableMBTIProfile | null> {
  const row = await prisma.mBTIProfile.findUnique({
    where:   { type: type.toUpperCase() },
    include: { facultyMatches: { orderBy: { rank: "asc" } } },
  })
  if (!row) return null

  const localProfile = getMBTIProfile(row.type)
  const facultiesFromDB = row.facultyMatches.map((m) => ({
    field:  m.field,
    reason: m.reason,
  }))

  if (localProfile) {
    // Spread local profile (has role, weaknesses, studyStyle) but exclude icon
    const { icon: _icon, ...localRest } = localProfile
    return {
      ...localRest,
      nickname:    row.nickname,
      tagline:     row.tagline,
      description: row.description,
      strengths:   row.strengths as string[],
      careers:     row.careers as string[],
      color:       row.color,
      faculties:   facultiesFromDB.length > 0 ? facultiesFromDB : localProfile.faculties,
    }
  }

  // Fallback: local profile missing — safe defaults
  return {
    type:        row.type as MBTIProfile["type"],
    nickname:    row.nickname,
    tagline:     row.tagline,
    description: row.description,
    strengths:   row.strengths as string[],
    weaknesses:  [],
    studyStyle:  "",
    role:        "Analyst",
    careers:     row.careers as string[],
    color:       row.color,
    faculties:   facultiesFromDB,
  }
}

const _cachedProfileByType = unstable_cache(
  _getMBTIProfileByType,
  ["mbti-profile-by-type"],
  { revalidate: 86400, tags: ["mbti"] }
)

/** Public API — re-attaches `icon` from local data after cache retrieval */
export async function getMBTIProfileByType(
  type: string
): Promise<MBTIProfile | null> {
  const profile = await _cachedProfileByType(type)
  if (!profile) return null
  const localData = getMBTIProfile(profile.type)
  const icon: LucideIcon = localData?.icon ?? Brain
  return { ...profile, icon }
}

/** Fetch all 16 profiles (for listing pages) */
export async function getAllMBTIProfiles(): Promise<
  Pick<MBTIProfile, "type" | "nickname" | "icon" | "tagline" | "color">[]
> {
  const rows = await prisma.mBTIProfile.findMany({ orderBy: { type: "asc" } })
  return rows.map((r) => {
    const localProfile = getMBTIProfile(r.type)
    const icon: LucideIcon = localProfile?.icon ?? Brain
    return {
      type:     r.type as MBTIProfile["type"],
      nickname: r.nickname,
      icon,
      tagline:  r.tagline,
      color:    r.color,
    }
  })
}

// ── Top faculties per type (DB-linked) ───────────────────────────────────────

export interface MBTIFacultyMatch {
  matchId:        string
  rank:           number
  score:          number   // 0-1 affinity
  reason:         string
  field:          string
  faculty: {
    id:           string
    slug:         string
    name:         string
    program:      string
    majorName:    string | null
    university: {
      slug:       string
      shortName:  string
      name:       string
      logoUrl:    string | null
      color:      string
    }
    latestScore: {
      year:       number
      minScore:   number
      round:      number
    } | null
  }
}

async function _getTopFacultiesForType(
  type:  string,
  limit: number
): Promise<MBTIFacultyMatch[]> {
  const rows = await prisma.facultyMBTIMatch.findMany({
    where:   { mbtiType: type.toUpperCase(), facultyId: { not: null } },
    orderBy: { rank: "asc" },
    take:    limit,
    include: {
      faculty: {
        include: {
          university: {
            select: { slug: true, shortName: true, name: true, logoUrl: true, color: true },
          },
          scores: {
            select:  { year: true, minScore: true, round: true },
            orderBy: { year: "desc" },
            take:    1,
          },
        },
      },
    },
  })

  return rows
    .filter((r) => r.faculty !== null)
    .map((r) => ({
      matchId: r.id,
      rank:    r.rank,
      score:   r.score,
      reason:  r.reason,
      field:   r.field,
      faculty: {
        id:        r.faculty!.id,
        slug:      r.faculty!.slug,
        name:      r.faculty!.name,
        program:   r.faculty!.program,
        majorName: r.faculty!.majorName,
        university: {
          slug:      r.faculty!.university.slug,
          shortName: r.faculty!.university.shortName,
          name:      r.faculty!.university.name,
          logoUrl:   r.faculty!.university.logoUrl,
          color:     r.faculty!.university.color,
        },
        latestScore: r.faculty!.scores[0]
          ? {
              year:     r.faculty!.scores[0].year,
              minScore: r.faculty!.scores[0].minScore,
              round:    r.faculty!.scores[0].round,
            }
          : null,
      },
    }))
}

/**
 * Top N real faculties recommended for a given MBTI type, ordered by match rank.
 * Each row includes the faculty's university + latest cutoff score for display.
 * Cached for 24h since match data is regenerated only on seed runs.
 */
export const getTopFacultiesForType = unstable_cache(
  _getTopFacultiesForType,
  ["mbti-top-faculties"],
  { revalidate: 86400, tags: ["mbti"] }
)

/** Quick check: which MBTI types (if any) list this faculty as a recommendation? */
export async function getMBTITypesForFaculty(facultyId: string): Promise<string[]> {
  const rows = await prisma.facultyMBTIMatch.findMany({
    where:  { facultyId },
    select: { mbtiType: true },
  })
  return rows.map((r) => r.mbtiType)
}

/** Match strength for a specific (type, faculty) pair — used for badges. */
export async function getMBTIMatchScore(
  type:      string,
  facultyId: string
): Promise<{ score: number; reason: string; rank: number } | null> {
  const row = await prisma.facultyMBTIMatch.findUnique({
    where:  { mbtiType_facultyId: { mbtiType: type.toUpperCase(), facultyId } },
    select: { score: true, reason: true, rank: true },
  })
  return row
}

// ── User MBTI history ─────────────────────────────────────────────────────────

/**
 * Latest MBTI result for a given user (by Clerk id).
 * Used to display "your personality" badge on /analyze and dashboard.
 */
export async function getLatestMBTIResultForClerkUser(
  clerkId: string
): Promise<{ id: string; mbtiType: string; createdAt: Date } | null> {
  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true },
  })
  if (!user) return null

  const result = await prisma.mBTIResult.findFirst({
    where:   { userId: user.id },
    orderBy: { createdAt: "desc" },
    select:  { id: true, mbtiType: true, createdAt: true },
  })
  return result
}

// ── Cross-feature: MBTI matches × user predictions ───────────────────────────

export interface MBTIMatchWithUserPrediction extends MBTIFacultyMatch {
  /** User's prior analysis for this faculty, if any */
  userPrediction: {
    id:        string
    userScore: number
    chance:    "high" | "competitive" | "low"
    gap:       number
    createdAt: Date
  } | null
}

/**
 * Top faculties for a type + cross-reference with the signed-in user's prediction history.
 *
 * For each recommended faculty:
 *   - If user has analyzed it before → attach their userScore + chance
 *   - Otherwise → userPrediction = null (UI shows CTA to analyze)
 *
 * Powers the post-quiz "เหมาะกับคุณ + คะแนนของคุณถึงไหม" hero section.
 */
export async function getMBTIRecommendationsWithPredictions(
  type:    string,
  clerkId: string,
  limit:   number = 8
): Promise<MBTIMatchWithUserPrediction[]> {
  const [matches, user] = await Promise.all([
    getTopFacultiesForType(type, limit),
    prisma.user.findUnique({ where: { clerkId }, select: { id: true } }),
  ])
  if (!user) return matches.map((m) => ({ ...m, userPrediction: null }))

  const facultyIds = matches.map((m) => m.faculty.id)
  const predictions = await prisma.predictionHistory.findMany({
    where:   { userId: user.id, facultyId: { in: facultyIds } },
    orderBy: { createdAt: "desc" },
    select:  { id: true, facultyId: true, userScore: true, chance: true, gap: true, createdAt: true },
  })

  // Keep most recent prediction per faculty
  const byFaculty = new Map<string, (typeof predictions)[number]>()
  for (const p of predictions) {
    if (!byFaculty.has(p.facultyId)) byFaculty.set(p.facultyId, p)
  }

  return matches.map((m) => {
    const p = byFaculty.get(m.faculty.id)
    return {
      ...m,
      userPrediction: p
        ? {
            id:        p.id,
            userScore: p.userScore,
            chance:    p.chance as "high" | "competitive" | "low",
            gap:       p.gap,
            createdAt: p.createdAt,
          }
        : null,
    }
  })
}

// ── Save result ───────────────────────────────────────────────────────────────

export interface SaveMBTIResultInput {
  mbtiType:       string
  scores:         Record<string, number>
  answers?:       Record<string, unknown>[]
  answeredCount?: number
  durationMs?:    number
  userId?:        string
}

export async function saveMBTIResult(input: SaveMBTIResultInput): Promise<string> {
  const result = await prisma.mBTIResult.create({
    data: {
      mbtiType:      input.mbtiType,
      scores:        input.scores,
      answers:       input.answers ? JSON.parse(JSON.stringify(input.answers)) : undefined,
      answeredCount: input.answeredCount ?? undefined,
      durationMs:    input.durationMs    ?? undefined,
      userId:        input.userId        ?? null,
    },
  })
  return result.id
}
