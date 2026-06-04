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
