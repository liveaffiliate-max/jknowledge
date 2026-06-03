"use server"

import { auth } from "@clerk/nextjs/server"
import { getFacultiesByUniversityId, getFacultyRequirement, getFacultyWithScores } from "./queries"
import { calculateAdmissionChance, calculateTrend } from "@/utils/analyze"
import { prisma } from "@/lib/prisma"
import type { AdmissionResult, Faculty, RequirementData } from "@/types/tcas"

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
