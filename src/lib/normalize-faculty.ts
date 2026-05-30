/**
 * Faculty field normalizers — shared between queries.ts, import-tcas.ts, and dedupe-faculties.ts.
 * Keeping one source of truth prevents display vs. slug vs. dedup mismatches.
 */

// ── Program type keywords ────────────────────────────────────────────────────
// Order matters: more specific patterns must come before shorter ones that
// would otherwise match first (e.g. "หลักสูตรนานาชาติ" before "นานาชาติ").
const PROGRAM_TYPES: [pattern: string, canonical: string][] = [
  ["หลักสูตรนานาชาติ", "หลักสูตรนานาชาติ"],
  ["นานาชาติ",         "หลักสูตรนานาชาติ"],
  ["โครงการพิเศษ",     "โครงการพิเศษ"],
  ["โครงการปกติ",      "โครงการปกติ"],
  ["ภาคปกติ",          "ภาคปกติ"],
  ["ภาคนอกเวลาราชการ", "ภาคนอกเวลาราชการ"],
  ["ภาคพิเศษ",         "ภาคพิเศษ"],
  ["ภาคภาษาอังกฤษ",    "ภาคภาษาอังกฤษ"],
]

function extractProgramType(s: string): string {
  for (const [pattern, canonical] of PROGRAM_TYPES) {
    if (s.includes(pattern)) return canonical
  }
  return ""
}

// ── normalizeProgram ─────────────────────────────────────────────────────────

/**
 * "วท.บ. สาขาวิชาเกษตรศาสตร์"                     → "เกษตรศาสตร์"
 * "ค.บ. หลักสูตรปกติ"                              → "หลักสูตรปกติ"
 * "วิทยาศาสตรบัณฑิต (เกษตรศาสตร์) เกษตรศาสตร์"    → "เกษตรศาสตร์"
 * "พ.บ."                                           → ""
 */
export function normalizeProgram(s: string | null | undefined): string {
  if (!s) return ""
  const p = s.trim()
  const afterAbbrev = p.replace(/^[฀-๿.]+\.[฀-๿]\.\s*/u, "").trim()
  if (afterAbbrev !== p) {
    return afterAbbrev
      .replace(/^สาขาวิชา\s*/, "")
      .replace(/^สาขา\s*/, "")
      .trim()
  }
  const parenMatch = p.match(/\(([^)]+)\)/)
  if (parenMatch) return parenMatch[1].trim()
  return p
}

// ── normalizeMajor ───────────────────────────────────────────────────────────

/**
 * "วิชาเอกพืชสวน"                       → "พืชสวน"
 * "เกษตรศาสตร์ วิชาเอกพืชสวน แผนที่ 1" → "พืชสวน แผนที่ 1"
 * "หลักสูตรนานาชาติ"                    → "หลักสูตรนานาชาติ"
 */
export function normalizeMajor(s: string | null | undefined): string {
  if (!s) return ""
  const stripped = s.replace(/^(วิชาเอก|เอก)\s*/u, "").trim()
  const match = stripped.match(/^.+?\s+วิชาเอก\s*(.+)$/)
  if (match) return match[1].trim()
  return stripped
}

// ── normalizeDetail ──────────────────────────────────────────────────────────

/**
 * Strips admission-method boilerplate and extracts the meaningful program-type
 * keyword (ภาคปกติ, โครงการพิเศษ, หลักสูตรนานาชาติ, …) when the raw value is
 * a verbose concatenation that begins with the faculty name.
 *
 * "วิทยาลัยการคอมพิวเตอร์ วท.บ. ... สาขาวิชา... ภาคปกติ"  → "ภาคปกติ"
 * "คณะวิทยาศาสตร์ เทคโนโลยีสารสนเทศ (โครงการพิเศษ)"       → "โครงการพิเศษ"
 * "การรับตรงร่วมกัน (รหัส 431613124-เศรษฐศาสตร์)"          → "เศรษฐศาสตร์"
 * "โครงการพิเศษ"                                           → "โครงการพิเศษ"
 * "โครงการปกติ"                                            → "โครงการปกติ"
 * "Admission1"                                             → ""
 */
export function normalizeDetail(
  s: string | null | undefined,
  facultyName?: string
): string {
  if (!s) return ""
  let d = s.trim()

  // Format normalisation
  d = d.replace(/^Admission-\s*/u, "")
  const m = d.match(/การรับตรงร่วมกัน\s*\(รหัส\s*[\w-]+-([^)]+?)\s*\)?$/u)
  if (m) d = m[1].replace(/\)$/, "").trim()

  // Filter: admission-method boilerplate
  if (/^Admission(\s|$|\()/iu.test(d)) return ""
  if (/^ใช้คะแนน/.test(d))             return ""
  if (/^การคัดเลือก/.test(d))          return ""
  if (/^การรับตรง/.test(d))            return ""
  if (/^รับตรง/.test(d))               return ""

  // When the detail is a verbose concatenation starting with the faculty name,
  // extract only the program-type keyword from the remainder of the string.
  // Previously this entire case returned "" which hid ภาคปกติ / โครงการพิเศษ.
  if (facultyName && d.startsWith(facultyName)) {
    return extractProgramType(d.slice(facultyName.length))
  }

  return d
}
