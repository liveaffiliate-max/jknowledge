"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { getFacultiesByUniversityId, getFacultyRequirement, getFacultyWithScores } from "./queries"
import { calculateAdmissionChance, calculateTrend } from "@/utils/analyze"
import { prisma } from "@/lib/prisma"
import type { AdmissionResult, Faculty, RequirementData } from "@/types/tcas"

// ── Save an analysis result that was done while anonymous (called after sign-up) ─

export async function savePendingHistoryAction(
  facultyId: string,
  userScore: number
): Promise<void> {
  if (!facultyId || isNaN(userScore)) return

  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return

    const faculty = await getFacultyWithScores(facultyId)
    if (!faculty || faculty.scores.length === 0) return

    const sorted = [...faculty.scores].sort((a, b) => b.year - a.year)
    const latest = sorted[0]
    const chance = calculateAdmissionChance(userScore, latest.minScore, latest.avgScore)
    const gap    = userScore - latest.minScore

    const user = await prisma.user.upsert({
      where:  { clerkId },
      update: {},
      create: { clerkId },
    })
    await prisma.predictionHistory.create({
      data: { userId: user.id, facultyId, userScore, chance, gap },
    })
    revalidatePath("/dashboard")
    revalidatePath("/profile")
  } catch {
    // Don't surface errors — this is best-effort migration
  }
}

// ── Delete account (called from Profile, before Clerk user.delete) ───────────
//
// Wipes the user's rows from our DB. Caller is responsible for revoking the
// Clerk account on the client (via user.delete()) and signing out.

export async function deleteAccountAction(): Promise<{ ok: boolean }> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return { ok: false }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      // No DB rows existed — nothing to wipe, treat as success
      return { ok: true }
    }

    // Cascading deletes on PredictionHistory + MBTIResult via FK onDelete: Cascade
    // (PredictionHistory already cascades; MBTIResult.userId has no cascade,
    // so we explicitly unlink it instead of deleting MBTI history — they're anonymous data points)
    await prisma.$transaction([
      prisma.predictionHistory.deleteMany({ where: { userId: user.id } }),
      prisma.mBTIResult.updateMany({ where: { userId: user.id }, data: { userId: null } }),
      prisma.user.delete({ where: { id: user.id } }),
    ])

    revalidatePath("/dashboard")
    revalidatePath("/profile")
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// ── Delete a prediction (called from Dashboard) ───────────────────────────────

export async function deletePredictionAction(predictionId: string): Promise<{ ok: boolean }> {
  if (!predictionId) return { ok: false }

  const { userId: clerkId } = await auth()
  if (!clerkId) return { ok: false }

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return { ok: false }

  // Verify ownership before deleting
  const prediction = await prisma.predictionHistory.findUnique({
    where:  { id: predictionId },
    select: { userId: true },
  })
  if (!prediction || prediction.userId !== user.id) return { ok: false }

  await prisma.predictionHistory.delete({ where: { id: predictionId } })
  revalidatePath("/dashboard")
  revalidatePath("/profile")
  return { ok: true }
}

// ── Get faculties for a university (called when user picks university) ─────────

export async function fetchFacultiesAction(
  universityId: string,
  filterYear?: number
): Promise<Pick<Faculty, "id" | "name" | "program" | "majorName" | "detail">[]> {
  if (!universityId) return []
  return getFacultiesByUniversityId(universityId, filterYear)
}

// ── Get faculty requirement weights (called when user picks faculty) ───────────

export async function getFacultyRequirementAction(
  facultyId: string
): Promise<RequirementData | null> {
  if (!facultyId) return null
  return getFacultyRequirement(facultyId)
}

// ── Run analysis (called on form submit) ──────────────────────────────────────

export async function analyzeAction(
  facultyId: string,
  userScore: number
): Promise<AdmissionResult | null> {
  if (!facultyId || isNaN(userScore)) return null

  const faculty = await getFacultyWithScores(facultyId)
  if (!faculty || faculty.scores.length === 0) return null

  const sorted = [...faculty.scores].sort((a, b) => b.year - a.year)
  const latest = sorted[0]

  const chance = calculateAdmissionChance(userScore, latest.minScore, latest.avgScore)
  const gap    = userScore - latest.minScore

  // ── Save PredictionHistory (ถ้า user ล็อกอินอยู่) ──────────────────────────
  try {
    const { userId: clerkId } = await auth()
    if (clerkId) {
      const user = await prisma.user.upsert({
        where:  { clerkId },
        update: {},
        create: { clerkId },
      })
      await prisma.predictionHistory.create({
        data: { userId: user.id, facultyId, userScore, chance, gap },
      })
      revalidatePath("/dashboard")
      revalidatePath("/profile")
    }
  } catch {
    // ไม่ block ผลลัพธ์ถ้า save ไม่ได้
  }

  return {
    faculty,
    userScore,
    chance,
    gap,
    latestMinScore: latest.minScore,
    latestAvgScore: latest.avgScore,
    trend: calculateTrend(faculty.scores),
  }
}
