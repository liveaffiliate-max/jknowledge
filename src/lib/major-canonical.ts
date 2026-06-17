// ── Canonical major key ──────────────────────────────────────────────────────
// Identifies "the same logical major" across different universities so we can
// list every uni offering it at /analyze/major/[slug].
//
// Key design decisions:
//   1. The "specialty" is taken from `majorName` if present, else from the
//      *normalized* `program`. This is because Thai TCAS data is inconsistent:
//      some unis store the sub-major in `majorName` ("วิศวกรรมโยธา"), others
//      embed it inside `program` ("วิศวกรรมศาสตรบัณฑิต (สาขาวิศวกรรมโยธา)").
//      Without this merge, comparisons silently mix different sub-majors
//      across unis — eg. "คณะวิศวกรรมศาสตร์" at จุฬาฯ resolves to โยธา while
//      at มข. it resolves to ไฟฟ้า. Including the specialty in the key forces
//      apples-to-apples.
//
//   2. We do NOT support fuzzy matching ("วิศวกรรมโยธา" vs "วิศวกรรมโยธาธิการ").
//      That's a synonym-table problem we defer until real cases arise.

import { normalizeProgram, normalizeMajor } from "./normalize-faculty"

interface UniversityLike {
  shortName?: string
}

export interface CanonicalMajorParts {
  /** Faculty name, e.g. "คณะวิศวกรรมศาสตร์" */
  name:       string
  /** Sub-major identifier — null when comparing a general/no-major program */
  specialty:  string | null
}

const KEY_SEPARATOR = "__"

// ── Key derivation ───────────────────────────────────────────────────────────

function cleanWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim()
}

/** Extract specialty from faculty's majorName + program — majorName wins. */
function getSpecialty(input: {
  program?:   string | null
  majorName?: string | null
}): string {
  const major = cleanWhitespace(normalizeMajor(input.majorName ?? ""))
  if (major) return major
  return cleanWhitespace(normalizeProgram(input.program ?? ""))
}

export function getCanonicalMajorKey(faculty: {
  name:       string
  program?:   string | null
  majorName?: string | null
}): string {
  const name      = cleanWhitespace(faculty.name)
  const specialty = getSpecialty(faculty)
  return specialty ? `${name}${KEY_SEPARATOR}${specialty}` : name
}

// ── URL slug round-trip ──────────────────────────────────────────────────────
// We encode the canonical key directly into the URL path. Modern browsers and
// search engines handle URL-encoded Thai fine; shared links show the decoded
// form ("คณะแพทยศาสตร์ · วิศวกรรมโยธา") in tab titles, OG previews, and Google
// Search snippets.

export function majorSlugFromKey(key: string): string {
  return encodeURIComponent(key)
}

export function majorSlugFromFaculty(faculty: {
  name:       string
  program?:   string | null
  majorName?: string | null
}): string {
  return majorSlugFromKey(getCanonicalMajorKey(faculty))
}

export function parseMajorSlug(slug: string): CanonicalMajorParts | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    return null
  }
  decoded = decoded.trim()
  if (!decoded) return null

  const sepIdx = decoded.indexOf(KEY_SEPARATOR)
  if (sepIdx === -1) return { name: decoded, specialty: null }
  return {
    name:      decoded.slice(0, sepIdx),
    specialty: decoded.slice(sepIdx + KEY_SEPARATOR.length) || null,
  }
}

// ── Display helper ───────────────────────────────────────────────────────────

/** "คณะแพทยศาสตร์" or "วิศวกรรมโยธา · คณะวิศวกรรมศาสตร์" */
export function formatMajorLabel(parts: CanonicalMajorParts): string {
  return parts.specialty
    ? `${parts.specialty} · ${parts.name}`
    : parts.name
}

/** Reserved for future use — when we surface a card that lists the
 *  universities currently offering this major. Currently unused. */
export function formatMajorTitle(
  parts: CanonicalMajorParts,
  _uni?: UniversityLike,
): string {
  return formatMajorLabel(parts)
}
