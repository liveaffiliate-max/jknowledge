/**
 * Subject utilities — shared between frontend and import scripts
 */

// ── Labels ────────────────────────────────────────────────────────────────────

// ── Subject code mapping จาก mytcas.com (verified จาก JS bundle, 2569) ────────
// ⚠️  mytcas ใช้ numbering ที่ต่างจาก NIETS อย่างสิ้นเชิง
export const SUBJECT_LABELS: Record<string, string> = {
  // TGAT
  tgat:    "TGAT รวม",
  tgat1:   "TGAT1 การสื่อสารภาษาอังกฤษ",
  tgat2:   "TGAT2 การคิดอย่างมีเหตุผล",
  tgat3:   "TGAT3 สมรรถนะการทำงาน",
  // TPAT
  tpat1:   "TPAT1 ความถนัดแพทย์",
  tpat11:  "TPAT11 เชาว์ปัญญา",
  tpat12:  "TPAT12 จริยธรรมทางการแพทย์",
  tpat13:  "TPAT13 ทักษะการเชื่อมโยง",
  tpat2:   "TPAT2 ความถนัดศิลปกรรมศาสตร์",
  tpat21:  "TPAT21 ทัศนศิลป์",
  tpat22:  "TPAT22 ดนตรี",
  tpat23:  "TPAT23 นาฏศิลป์",
  tpat3:   "TPAT3 ความถนัดวิทย์/เทคโนโลยี/วิศวะ",
  tpat4:   "TPAT4 ความถนัดสถาปัตยกรรมศาสตร์",
  tpat5:   "TPAT5 ความถนัดครุศาสตร์/ศึกษาศาสตร์",
  // A-Level (mytcas internal codes — ต่างจาก NIETS official codes)
  a_lv_61: "A-Level คณิตศาสตร์ประยุกต์ 1",
  a_lv_62: "A-Level คณิตศาสตร์ประยุกต์ 2",
  a_lv_63: "A-Level วิทยาศาสตร์ประยุกต์",
  a_lv_64: "A-Level ฟิสิกส์",
  a_lv_65: "A-Level เคมี",
  a_lv_66: "A-Level ชีววิทยา",
  a_lv_70: "A-Level สังคมศาสตร์",
  a_lv_81: "A-Level ภาษาไทย",
  a_lv_82: "A-Level ภาษาอังกฤษ",
  a_lv_83: "A-Level ภาษาฝรั่งเศส",
  a_lv_84: "A-Level ภาษาเยอรมัน",
  a_lv_85: "A-Level ภาษาญี่ปุ่น",
  a_lv_86: "A-Level ภาษาเกาหลี",
  a_lv_87: "A-Level ภาษาจีน",
  a_lv_88: "A-Level ภาษาบาลี",
  a_lv_89: "A-Level ภาษาสเปน",
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubjectGroup = "TGAT" | "TPAT" | "A-Level"

export interface SubjectWeight {
  code:    string
  label:   string
  weight:  number
  group:   SubjectGroup
  /** BestOf = กรณี cal_type: ระบบเลือกคะแนนสูงสุดจากรายวิชาเหล่านี้ */
  bestOf?: {
    codes:  string[]
    labels: string[]
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getSubjectGroup(code: string): SubjectGroup {
  if (code.startsWith("tgat")) return "TGAT"
  if (code.startsWith("tpat")) return "TPAT"
  return "A-Level"
}

export function getSubjectLabel(code: string): string {
  return SUBJECT_LABELS[code] ?? code
}

/**
 * แปลง weights JSON → SubjectWeight[]
 *
 * รองรับ 2 formats จาก mytcas API:
 *   1. Regular:  { "tgat3": 20, "a_lv_82": 14, ... }
 *   2. BestOf:   { ...regular, "cal_type": "1",
 *                  "cal_score_sum": 40,
 *                  "cal_subject_name": "a_lv_64 a_lv_65 a_lv_66" }
 *      → เลือกคะแนนสูงสุดจาก cal_subject_name มาคิดเป็น cal_score_sum %
 */
export function weightsToSubjects(weights: Record<string, unknown>): SubjectWeight[] {
  const result: SubjectWeight[] = []
  const groupOrder: Record<SubjectGroup, number> = { TGAT: 0, TPAT: 1, "A-Level": 2 }

  // ── Parse BestOf group (cal_* keys) ────────────────────────────────────────
  const calSum      = weights["cal_score_sum"]
  const calSubjects = weights["cal_subject_name"]
  const hasCal      = calSum !== undefined && calSubjects !== undefined

  let bestOfCodes: string[] = []
  if (hasCal && typeof calSubjects === "string") {
    // separator: "|" หรือ space
    bestOfCodes = calSubjects.split(/[|\s]+/).filter(Boolean)
  }

  const skipKeys = new Set(["cal_type", "cal_score_sum", "cal_subject_name", ...bestOfCodes])

  // ── Regular subjects ────────────────────────────────────────────────────────
  for (const [code, weight] of Object.entries(weights)) {
    if (skipKeys.has(code)) continue
    if (typeof weight !== "number") continue
    result.push({
      code,
      label: getSubjectLabel(code),
      weight,
      group: getSubjectGroup(code),
    })
  }

  // ── BestOf virtual subject ──────────────────────────────────────────────────
  if (hasCal && typeof calSum === "number" && bestOfCodes.length > 0) {
    const shortNames = bestOfCodes.map((c) =>
      getSubjectLabel(c).replace(/^A-Level\s*/i, "")
    )
    result.push({
      code:   "__bestof__",
      label:  `เลือกดีที่สุด (${shortNames.join(" / ")})`,
      weight: calSum,
      group:  "A-Level",
      bestOf: {
        codes:  bestOfCodes,
        labels: bestOfCodes.map((c) => getSubjectLabel(c)),
      },
    })
  }

  return result.sort((a, b) => {
    const diff = groupOrder[a.group] - groupOrder[b.group]
    return diff !== 0 ? diff : a.code.localeCompare(b.code)
  })
}

/** คำนวณคะแนนรวมสัดส่วน (0–100)
 *  BestOf subjects: ใช้คะแนนสูงสุดจาก choices */
export function calculateWeightedScore(
  subjects: SubjectWeight[],
  scores: Record<string, string>
): number {
  return subjects.reduce((total, s) => {
    let val: number
    if (s.bestOf) {
      val = Math.max(0, ...s.bestOf.codes.map((c) => parseFloat(scores[c] ?? "") || 0))
    } else {
      val = parseFloat(scores[s.code] ?? "") || 0
    }
    return total + (val * s.weight) / 100
  }, 0)
}

/** short code สำหรับแสดงใน badge เช่น "T1", "TP3", "ไทย" */
export function getSubjectShortCode(code: string): string {
  if (code === "tgat") return "TG"
  const tgat = code.match(/^tgat(\d)$/)
  if (tgat) return `T${tgat[1]}`
  const tpat = code.match(/^tpat(\d)$/)
  if (tpat) return `P${tpat[1]}`
  const alv = code.match(/^a_lv_(\d+)$/)
  if (alv) {
    const n = parseInt(alv[1])
    const m: Record<number, string> = {
      61: "คณ1", 62: "คณ2", 63: "วิทย์",
      64: "ฟิส", 65: "เคมี", 66: "ชีว",
      70: "สค.",
      81: "ไทย", 82: "อัง",
      83: "ฝรั่ง", 84: "เยอ", 85: "ญี่",
      86: "เกา", 87: "จีน", 88: "บาลี", 89: "สเปน",
    }
    return m[n] ?? `A${n}`
  }
  return code.slice(0, 3).toUpperCase()
}
