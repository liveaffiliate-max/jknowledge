// Standard MBTI 4 dimensions
export type EI = "E" | "I" // Extraversion / Introversion
export type SN = "S" | "N" // Sensing / iNtuition
export type TF = "T" | "F" // Thinking / Feeling
export type JP = "J" | "P" // Judging / Perceiving

export type MBTIType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP"

export type MBTIDimension = "EI" | "SN" | "TF" | "JP"

export interface MBTIQuestion {
  id: number
  dimension: MBTIDimension
  /**
   * Single declarative statement starting with "ฉัน…", e.g.
   * "ฉันรู้สึกมีพลังเมื่อได้พูดคุยกับคนหลายๆ คน".
   * The user answers on a 5-point agree Likert scale.
   */
  statement: string
  /** Discrimination weight, default 1.0. Higher = more influential in scoring. */
  weight?: number
  /** When true, "agree" drives the score toward the B-pole (I/N/F/P) instead of A. */
  isReverse?: boolean
  /** Topic bucket for analytics: "social" | "planning" | "decision" | "perception" | "stress" | "emotion" */
  category?: string
}

export interface MBTIAnswer {
  questionId: number
  dimension: MBTIDimension
  /**
   * Likert scale — 1 = strongly A (toward A-pole), 3 = neutral, 5 = strongly B (toward B-pole).
   * For reverse questions the engine flips the direction automatically.
   * Maps to net weight: 1→+2, 2→+1, 3→0, 4→-1, 5→-2
   */
  likert: 1 | 2 | 3 | 4 | 5
  /** Snapshot of question.weight at answer time (default 1.0) */
  weight: number
  /** Snapshot of question.isReverse at answer time */
  isReverse: boolean
  /** Milliseconds from question display to submission — used for analytics */
  responseTimeMs: number
}

export type FacultyRecommendation = {
  field: string
  reason: string
}

/** 4 meta-groups from the 16personalities framework */
export type MBTIRole = "Analyst" | "Diplomat" | "Sentinel" | "Explorer"

export const MBTI_ROLE_META: Record<MBTIRole, { label: string; color: string; bg: string }> = {
  Analyst:  { label: "นักวิเคราะห์", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  Diplomat: { label: "นักการทูต",    color: "text-teal-700",   bg: "bg-teal-50   border-teal-200"   },
  Sentinel: { label: "ผู้พิทักษ์",   color: "text-blue-700",   bg: "bg-blue-50   border-blue-200"   },
  Explorer: { label: "นักสำรวจ",     color: "text-amber-700",  bg: "bg-amber-50  border-amber-200"  },
}

export interface MBTIProfile {
  type: MBTIType
  nickname: string        // e.g. "สถาปนิก"
  icon: import("lucide-react").LucideIcon
  tagline: string         // one-line description in Thai
  description: string     // paragraph in Thai
  role: MBTIRole
  strengths: string[]
  weaknesses: string[]    // blind spots / growth areas (in Thai)
  studyStyle: string      // how this type learns best — student-focused (in Thai)
  careers: string[]
  faculties: FacultyRecommendation[]
  color: string           // tailwind color class
}

export interface MBTIResult {
  type: MBTIType
  scores: {
    E: number; I: number
    S: number; N: number
    T: number; F: number
    J: number; P: number
  }
}
