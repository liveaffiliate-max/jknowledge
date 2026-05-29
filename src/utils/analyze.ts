import type { AdmissionChance, AdmissionResult, FacultyWithScores, YearlyScore } from "@/types/tcas"
import { getUniversityById } from "@/data/universities"
import { facultyScores } from "@/data/scores"

/**
 * คำนวณโอกาสรับจากคะแนนผู้ใช้เทียบกับข้อมูลย้อนหลัง
 */
export function calculateAdmissionChance(
  userScore: number,
  minScore: number,
  avgScore: number
): AdmissionChance {
  if (userScore >= avgScore) return "high"
  if (userScore >= minScore) return "competitive"
  return "low"
}

/**
 * คำนวณแนวโน้มคะแนน (เพิ่ม / ลด / คงที่)
 */
export function calculateTrend(scores: YearlyScore[]): "rising" | "falling" | "stable" {
  if (scores.length < 2) return "stable"
  const sorted = [...scores].sort((a, b) => a.year - b.year)
  const first = sorted[0].minScore
  const last = sorted[sorted.length - 1].minScore
  const diff = last - first
  if (diff > 1.5) return "rising"
  if (diff < -1.5) return "falling"
  return "stable"
}

/**
 * วิเคราะห์คณะเดียว — คืนผลพร้อมข้อมูลครบ
 */
export function analyzeFaculty(
  facultyId: string,
  userScore: number
): AdmissionResult | null {
  const faculty = facultyScores.find((f) => f.id === facultyId)
  if (!faculty) return null

  const university = getUniversityById(faculty.universityId)
  if (!university) return null

  const sorted = [...faculty.scores].sort((a, b) => b.year - a.year)
  const latest = sorted[0]

  const facultyWithScores: FacultyWithScores = {
    ...faculty,
    university,
  }

  return {
    faculty: facultyWithScores,
    userScore,
    chance: calculateAdmissionChance(userScore, latest.minScore, latest.avgScore),
    gap: userScore - latest.minScore,
    latestMinScore: latest.minScore,
    latestAvgScore: latest.avgScore,
    trend: calculateTrend(faculty.scores),
  }
}

/**
 * วิเคราะห์หลายคณะพร้อมกัน — เรียงตามโอกาสรับ
 */
export function analyzeMultipleFaculties(
  facultyIds: string[],
  userScore: number
): AdmissionResult[] {
  const results = facultyIds
    .map((id) => analyzeFaculty(id, userScore))
    .filter((r): r is AdmissionResult => r !== null)

  const order: Record<AdmissionChance, number> = { high: 0, competitive: 1, low: 2 }
  return results.sort((a, b) => order[a.chance] - order[b.chance])
}

/**
 * แปลง AdmissionChance เป็นข้อความภาษาไทย
 */
export function chanceLabel(chance: AdmissionChance): string {
  const map: Record<AdmissionChance, string> = {
    high: "โอกาสสูง",
    competitive: "แข่งขันได้",
    low: "โอกาสน้อย",
  }
  return map[chance]
}

/**
 * สีสำหรับแสดงผล chance (Tailwind classes)
 */
export function chanceColor(chance: AdmissionChance): {
  bg: string
  text: string
  border: string
} {
  const map: Record<AdmissionChance, { bg: string; text: string; border: string }> = {
    high: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    competitive: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    low: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
  }
  return map[chance]
}
