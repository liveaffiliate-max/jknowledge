/**
 * src/server/mbti-matching.ts
 *
 * Rule-based MBTI ↔ Faculty matching engine.
 *
 * Strategy:
 *  1. Each MBTI type has 4 dimension preferences (E/I, S/N, T/F, J/P).
 *  2. Each faculty contributes dimension affinity from two sources:
 *     a. FacultyField enum (broad bucket — base score)
 *     b. Keyword matches in name/program/majorName (fine-grained boost)
 *  3. Final score = sigmoid(weighted dimension alignment).
 *  4. Reason text is templated from the top-matching dimension category.
 *
 * Used by `scripts/seed-mbti-matches.ts` to populate FacultyMBTIMatch table.
 */
import type { FacultyField } from "../generated/prisma/enums"

// ── Types ─────────────────────────────────────────────────────────────────────

export type MBTIType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP"

/** Per-dimension affinity in [-1, 1]. +1 = pure A-pole, -1 = pure B-pole. */
export interface DimensionAffinity {
  EI: number // +E ... -I
  SN: number // +S ... -N
  TF: number // +T ... -F
  JP: number // +J ... -P
}

const ZERO: DimensionAffinity = { EI: 0, SN: 0, TF: 0, JP: 0 }

// ── Type → preferred poles (from MBTI letters) ───────────────────────────────

function typeAffinity(type: MBTIType): DimensionAffinity {
  return {
    EI: type[0] === "E" ?  1 : -1,
    SN: type[1] === "S" ?  1 : -1,
    TF: type[2] === "T" ?  1 : -1,
    JP: type[3] === "J" ?  1 : -1,
  }
}

// ── FacultyField → dimension affinity ────────────────────────────────────────
// Editorial mapping. Magnitudes 0.3–0.9; higher = stronger pull.

const FIELD_AFFINITY: Record<FacultyField, DimensionAffinity> = {
  medicine:          { EI: 0,    SN:  0.4, TF:  0.6, JP:  0.8 }, // S-T-J leaning
  engineering:       { EI: 0,    SN: -0.3, TF:  0.8, JP:  0.5 }, // N-T-J
  law:               { EI: 0.3,  SN:  0.5, TF:  0.7, JP:  0.7 }, // E-S-T-J
  accounting:        { EI: 0,    SN:  0.7, TF:  0.7, JP:  0.8 }, // S-T-J
  nursing:           { EI: 0.3,  SN:  0.5, TF: -0.7, JP:  0.6 }, // E-S-F-J
  economics:         { EI: 0,    SN: -0.2, TF:  0.7, JP:  0.4 }, // N-T
  liberal_arts:      { EI: 0,    SN: -0.4, TF: -0.6, JP: -0.2 }, // N-F (humanities)
  science:           { EI: -0.3, SN: -0.3, TF:  0.7, JP:  0.3 }, // I-N-T
  political_science: { EI: 0.4,  SN: -0.3, TF: -0.2, JP:  0.2 }, // E-N
  architecture:      { EI: 0,    SN: -0.6, TF: -0.2, JP: -0.5 }, // N-P (creative)
  dentistry:         { EI: 0,    SN:  0.5, TF:  0.5, JP:  0.7 }, // S-T-J
  pharmacy:          { EI: -0.2, SN:  0.5, TF:  0.6, JP:  0.6 }, // I-S-T-J
  ict:               { EI: -0.4, SN: -0.4, TF:  0.7, JP:  0.2 }, // I-N-T
  business:          { EI: 0.5,  SN:  0.2, TF:  0.5, JP:  0.5 }, // E-T-J
  other:             ZERO,
}

// ── Keyword → dimension boost ────────────────────────────────────────────────
// Thai keywords matched against `name`, `program`, `majorName`. Cumulative.

interface KeywordRule {
  match: RegExp
  delta: Partial<DimensionAffinity>
  /** Optional override reason template */
  reasonCategory?: string
}

const KEYWORD_RULES: KeywordRule[] = [
  // Creative / arts
  { match: /ศิลปะ|ออกแบบ|นิเทศ|ภาพยนตร์|ดนตรี|การแสดง|แฟชั่น/, delta: { SN: -0.5, JP: -0.4, TF: -0.3 }, reasonCategory: "creative" },
  // Computing / data
  { match: /คอมพิวเตอร์|ดิจิทัล|ปัญญาประดิษฐ์|วิทยาการข้อมูล|ซอฟต์แวร์|เกม|cyber|AI|data/i, delta: { SN: -0.4, TF: 0.5, EI: -0.3 }, reasonCategory: "tech" },
  // Language / international
  { match: /ภาษา|อักษร|วรรณ|literature|linguistic|international/i, delta: { SN: -0.3, TF: -0.4 }, reasonCategory: "language" },
  // Education
  { match: /ครุ|ศึกษาศาสตร์|การสอน|education/i, delta: { TF: -0.5, JP: 0.3, EI: 0.3 }, reasonCategory: "education" },
  // Psychology / counseling
  { match: /จิตวิทยา|psycho/i, delta: { TF: -0.6, SN: -0.3 }, reasonCategory: "psychology" },
  // Communication / media
  { match: /สื่อสาร|วารสาร|โฆษณา|ประชาสัมพันธ์|broadcasting|journalism/i, delta: { EI: 0.5, SN: -0.3 }, reasonCategory: "communication" },
  // Management / leadership
  { match: /บริหาร|จัดการ|management|leadership/i, delta: { EI: 0.4, JP: 0.4, TF: 0.3 }, reasonCategory: "management" },
  // Research / theoretical
  { match: /วิจัย|ทฤษฎี|research|theoretical|พื้นฐาน/, delta: { EI: -0.4, SN: -0.4, TF: 0.4 }, reasonCategory: "research" },
  // Hands-on / technical / practical
  { match: /อุตสาหกรรม|ช่าง|เทคโนโลยี|industrial|technician/i, delta: { SN: 0.4, TF: 0.3 }, reasonCategory: "technical" },
  // Healthcare / care
  { match: /สุขภาพ|กายภาพ|สาธารณสุข|health|therapy/i, delta: { TF: -0.4, JP: 0.3, SN: 0.3 }, reasonCategory: "healthcare" },
  // Tourism / hospitality
  { match: /ท่องเที่ยว|โรงแรม|tourism|hospitality/i, delta: { EI: 0.5, TF: -0.3 }, reasonCategory: "hospitality" },
  // Finance / accounting variants
  { match: /การเงิน|บัญชี|finance|banking/i, delta: { SN: 0.4, TF: 0.5, JP: 0.5 }, reasonCategory: "finance" },
  // Agriculture / environment
  { match: /เกษตร|สิ่งแวดล้อม|ประมง|ป่าไม้|environment|agriculture/i, delta: { SN: 0.3, JP: 0.2 }, reasonCategory: "agriculture" },
  // Social work
  { match: /สังคมสงเคราะห์|พัฒนาสังคม|social work/i, delta: { TF: -0.6, EI: 0.3 }, reasonCategory: "social-work" },
]

// ── Reason templates (Thai) — keyed by category ──────────────────────────────

const REASON_BY_CATEGORY: Record<string, string> = {
  creative:      "เปิดพื้นที่ให้ความคิดสร้างสรรค์ที่เป็นเอกลักษณ์ของคุณได้แสดงออก",
  tech:          "ใช้ตรรกะและแก้ปัญหาเชิงระบบ — แนวที่คุณถนัด",
  language:      "ได้สำรวจวิธีคิดและวัฒนธรรมหลากหลายซึ่งตรงกับสไตล์คุณ",
  education:     "ได้ใช้ความเข้าใจคนและการสื่อสารช่วยพัฒนาผู้อื่น",
  psychology:    "เข้าใจความรู้สึกของคนได้ลึก — เหมาะกับสายงานนี้มาก",
  communication: "สื่อสารและสร้างความเชื่อมต่อกับผู้คน — จุดแข็งของคุณ",
  management:    "ใช้ทักษะวางแผนและนำทีมเพื่อบรรลุเป้าหมาย",
  research:      "ลงลึกในแนวคิดและค้นหาความจริงเชิงทฤษฎี",
  technical:     "ทำงานเชิงปฏิบัติที่จับต้องและเห็นผลลัพธ์ชัด",
  healthcare:    "ได้ใช้ความใส่ใจช่วยเหลือคนอย่างเป็นรูปธรรม",
  hospitality:   "พลังในการทำงานกับผู้คนหลากหลายของคุณจะเปล่งประกาย",
  finance:       "ใส่ใจรายละเอียดและตรรกะ — ทักษะหลักของสายนี้",
  agriculture:   "ทำงานกับสิ่งที่จับต้องได้ในระยะยาว",
  "social-work": "ใช้ความเข้าใจคนเพื่อสร้างผลกระทบในสังคม",
  // Field-based fallbacks
  medicine:      "ใช้ความรอบคอบและความรับผิดชอบสูง — สไตล์ของคุณ",
  engineering:   "วิเคราะห์ระบบและออกแบบแก้ปัญหาเชิงตรรกะ",
  law:           "ใช้หลักการและเหตุผลในการตัดสิน — ตรงสไตล์คุณ",
  accounting:    "แม่นยำในรายละเอียดและข้อมูล — จุดแข็งของคุณ",
  nursing:       "ดูแลผู้อื่นด้วยความเข้าใจและมีระบบ",
  economics:     "วิเคราะห์ pattern ระดับใหญ่และคิดเชิงนามธรรม",
  liberal_arts:  "สำรวจความคิด ภาษา และความหมาย — เหมาะกับสไตล์คุณ",
  science:       "อยากเข้าใจหลักการของจักรวาล — แนวคุณเลย",
  political_science: "วิเคราะห์โครงสร้างสังคมและความสัมพันธ์ของอำนาจ",
  architecture:  "ผสมผสานความคิดสร้างสรรค์กับการคิดเชิงระบบ",
  dentistry:     "ใส่ใจรายละเอียดและทำงานละเอียดด้วยมือ",
  pharmacy:      "ทำงานกับข้อมูลและรายละเอียดอย่างแม่นยำ",
  ict:           "ออกแบบและสร้างระบบดิจิทัล — แนวคุณ",
  business:      "ใช้ทักษะคิดเชิงกลยุทธ์และนำผู้คน",
  other:         "ตรงกับความสนใจและสไตล์การทำงานของคุณ",
}

// ── Core scoring ──────────────────────────────────────────────────────────────

export interface FacultyMatchInput {
  field: FacultyField
  name: string
  program: string
  majorName: string | null
}

export interface MatchResult {
  score:    number  // 0-1
  reason:   string
  affinity: DimensionAffinity
}

/** Combine field-affinity + keyword-rule deltas into a single affinity vector. */
function facultyAffinity(f: FacultyMatchInput): { affinity: DimensionAffinity; category: string } {
  const base = { ...FIELD_AFFINITY[f.field] }
  let category = f.field as string
  let maxBoost = 0

  const haystack = [f.name, f.program, f.majorName].filter(Boolean).join(" ")
  for (const rule of KEYWORD_RULES) {
    if (rule.match.test(haystack)) {
      base.EI += rule.delta.EI ?? 0
      base.SN += rule.delta.SN ?? 0
      base.TF += rule.delta.TF ?? 0
      base.JP += rule.delta.JP ?? 0
      // Track the strongest keyword for reason text
      const strength = Object.values(rule.delta).reduce((s, v) => s + Math.abs(v ?? 0), 0)
      if (rule.reasonCategory && strength > maxBoost) {
        maxBoost = strength
        category = rule.reasonCategory
      }
    }
  }

  // Clamp to [-1, 1]
  return {
    affinity: {
      EI: Math.max(-1, Math.min(1, base.EI)),
      SN: Math.max(-1, Math.min(1, base.SN)),
      TF: Math.max(-1, Math.min(1, base.TF)),
      JP: Math.max(-1, Math.min(1, base.JP)),
    },
    category,
  }
}

/**
 * Compute (faculty × type) match score in [0, 1].
 *
 * Algorithm: dot-product of type affinity (±1 per dim) with faculty affinity,
 * normalised to [0, 1]. A faculty fully aligned on all 4 dims with the type
 * gives 1.0; opposite gives 0.0; orthogonal (all zeros) gives 0.5.
 */
export function matchFacultyToType(
  type: MBTIType,
  f: FacultyMatchInput
): MatchResult {
  const t = typeAffinity(type)
  const { affinity, category } = facultyAffinity(f)

  const dot = t.EI * affinity.EI + t.SN * affinity.SN + t.TF * affinity.TF + t.JP * affinity.JP
  // dot ∈ [-4, 4] → normalise to [0, 1]
  const score = (dot + 4) / 8

  return {
    score,
    reason: REASON_BY_CATEGORY[category] ?? REASON_BY_CATEGORY.other,
    affinity,
  }
}

export const ALL_MBTI_TYPES: MBTIType[] = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
]
