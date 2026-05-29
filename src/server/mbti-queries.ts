import { prisma } from "@/lib/prisma"
import type { MBTIProfile, MBTIQuestion } from "@/types/mbti"
import { getMBTIProfile } from "@/data/mbti-types"
import type { LucideIcon } from "lucide-react"
import { Brain } from "lucide-react"

// ── Questions ─────────────────────────────────────────────────────────────────

/** Fetch all active quiz questions ordered by display order */
export async function getMBTIQuestions(): Promise<MBTIQuestion[]> {
  const rows = await prisma.mBTIQuestion.findMany({
    where:   { active: true },
    orderBy: { order: "asc" },
  })
  return rows.map((q) => ({
    id:        q.order,           // keep numeric id that scoring engine expects
    dimension: q.dimension as MBTIQuestion["dimension"],
    text:      q.text,
    optionA:   q.optionA,
    optionB:   q.optionB,
  }))
}

// ── Profile ───────────────────────────────────────────────────────────────────

/** Fetch a single MBTI profile with its faculty matches, ordered by rank */
export async function getMBTIProfileByType(type: string): Promise<MBTIProfile | null> {
  const row = await prisma.mBTIProfile.findUnique({
    where:   { type: type.toUpperCase() },
    include: { facultyMatches: { orderBy: { rank: "asc" } } },
  })
  if (!row) return null

  const localProfile = getMBTIProfile(row.type)
  const icon: LucideIcon = localProfile?.icon ?? Brain

  const facultiesFromDB = row.facultyMatches.map((m) => ({
    field:  m.field,
    reason: m.reason,
  }))

  // Prefer local profile (has role, weaknesses, studyStyle) and override with DB
  // text fields which can be updated without a deploy.
  if (localProfile) {
    return {
      ...localProfile,
      nickname:    row.nickname,
      tagline:     row.tagline,
      description: row.description,
      strengths:   row.strengths as string[],
      careers:     row.careers as string[],
      color:       row.color,
      faculties:   facultiesFromDB.length > 0 ? facultiesFromDB : localProfile.faculties,
    }
  }

  // Fallback (local profile missing) — provide safe defaults for new fields
  return {
    type:        row.type as MBTIProfile["type"],
    nickname:    row.nickname,
    icon,
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

/** Fetch all 16 profiles (for listing pages) */
export async function getAllMBTIProfiles(): Promise<Pick<MBTIProfile, "type" | "nickname" | "icon" | "tagline" | "color">[]> {
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
  mbtiType:      string
  scores:        Record<string, number>
  answers?:      unknown[]   // MBTIAnswer[] — serialised as JSON
  answeredCount?: number
  durationMs?:   number
  userId?:       string
}

export async function saveMBTIResult(input: SaveMBTIResultInput): Promise<string> {
  const result = await prisma.mBTIResult.create({
    data: {
      mbtiType:      input.mbtiType,
      scores:        input.scores,
      answers:       input.answers       ?? undefined,
      answeredCount: input.answeredCount ?? undefined,
      durationMs:    input.durationMs    ?? undefined,
      userId:        input.userId        ?? null,
    },
  })
  return result.id
}
