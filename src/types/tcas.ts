// ============================================================
// TCAS Types — Jknowledge
// ============================================================

export type AdmissionChance = "high" | "competitive" | "low"

// ── University ────────────────────────────────────────────────────────────────

export interface University {
  id: string
  slug: string       // e.g. "cu", "tu"
  name: string       // ชื่อเต็ม
  shortName: string  // ชื่อย่อ
  location: string   // จังหวัดที่ตั้ง
  color: string      // hex สีประจำมหาวิทยาลัย
  logoUrl?: string   // URL โลโก้ (optional)
}

/** University + stats สำหรับ /scores grid */
export interface UniversityWithStats extends University {
  facultyCount: number
  latestYear: number | null
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export interface Faculty {
  id: string
  universityId: string
  slug?: string      // programName[:majorName][:detail]
  name: string       // ชื่อคณะ เช่น "คณะแพทยศาสตร์"
  program: string    // ชื่อหลักสูตร
  majorName?: string // แขนง / วิชาเอก (ถ้ามี)
  detail?: string    // รายละเอียด/โครงการ (ถ้ามี)
  field: FacultyField
}

/** Faculty summary สำหรับ list ใน /scores/[uni] */
export interface FacultyPreview {
  id: string
  slug: string
  name: string
  program: string
  majorName?: string
  detail?: string
  field: FacultyField
  latestYear: number | null
  latestMinScore: number | null
  latestAvgScore: number | null
  latestSeats: number | null
  scoreCount: number   // จำนวนปีที่มีข้อมูล
}

// ── FacultyField ──────────────────────────────────────────────────────────────
// ตรงกับ enum ใน Prisma schema (underscore format)

export type FacultyField =
  | "medicine"
  | "engineering"
  | "law"
  | "accounting"
  | "nursing"
  | "economics"
  | "liberal_arts"
  | "science"
  | "political_science"
  | "architecture"
  | "dentistry"
  | "pharmacy"
  | "ict"
  | "business"
  | "other"

// ── Scores ────────────────────────────────────────────────────────────────────

export interface YearlyScore {
  year: number       // ปี พ.ศ. เช่น 2567
  minScore: number   // คะแนนต่ำสุด (0–100)
  avgScore: number   // คะแนนเฉลี่ย (0–100)
  maxScore?: number  // คะแนนสูงสุด (0–100, อาจไม่มีข้อมูล)
  seats?: number     // จำนวนที่นั่ง (อาจไม่มีข้อมูล)
}

export interface FacultyWithScores extends Faculty {
  scores: YearlyScore[]
  university: University
}

// ── Faculty Requirement (weights จาก mytcas) ──────────────────────────────────

export interface RequirementData {
  weights:     Record<string, number>  // { "tgat1": 30, "a_lv_63": 25, ... }
  estMinScore: number | null
}

// ── Admission Result ──────────────────────────────────────────────────────────

export interface AdmissionResult {
  faculty: FacultyWithScores
  userScore: number
  chance: AdmissionChance
  gap: number
  latestMinScore: number
  latestAvgScore: number
  trend: "rising" | "falling" | "stable"
}
