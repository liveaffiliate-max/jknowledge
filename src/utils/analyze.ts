import type { AdmissionChance, YearlyScore } from "@/types/tcas"

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
  // เปรียบ 2 ปีล่าสุดเท่านั้น — นักเรียนสนใจทิศทางปัจจุบัน ไม่ใช่ภาพรวม 6 ปี
  const prev = sorted[sorted.length - 2].minScore
  const last = sorted[sorted.length - 1].minScore
  const diff = last - prev
  if (diff > 1.5) return "rising"
  if (diff < -1.5) return "falling"
  return "stable"
}

/**
 * Config ครบสำหรับแต่ละระดับโอกาสรับ — label + Tailwind color classes
 */
export const CHANCE_CONFIG: Record<
  AdmissionChance,
  { label: string; bg: string; text: string; border: string }
> = {
  high:        { label: "โอกาสสูง",   bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  competitive: { label: "แข่งขันได้", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  low:         { label: "โอกาสน้อย", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
}
