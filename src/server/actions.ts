"use server"

import { getFacultiesByUniversityId, getFacultyRequirement, getFacultyWithScores } from "./queries"
import { calculateAdmissionChance, calculateTrend } from "@/utils/analyze"
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

  return {
    faculty,
    userScore,
    chance: calculateAdmissionChance(userScore, latest.minScore, latest.avgScore),
    gap: userScore - latest.minScore,
    latestMinScore: latest.minScore,
    latestAvgScore: latest.avgScore,
    trend: calculateTrend(faculty.scores),
  }
}
