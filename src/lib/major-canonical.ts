// ── Canonical major key ──────────────────────────────────────────────────────
// Identifies "the same logical major" across different universities so we can
// list all unis that offer a given program at /analyze/compare/major/[slug].
//
// MVP strategy: exact `name` + `majorName` after light whitespace cleanup.
// Same name → same major. This is intentionally simple — it correctly groups
// the common cases ("คณะแพทยศาสตร์" exists at ~20 unis with identical name,
// "วิศวกรรมคอมพิวเตอร์" major appears under "คณะวิศวกรรมศาสตร์" similarly).
//
// Known limitations (defer to a phase 2.1 follow-up if these become real issues):
//   • Different unis sometimes append location (e.g. "คณะแพทยศาสตร์ ศิริราช" vs
//     "คณะแพทยศาสตร์") — these will NOT be grouped together by exact match
//   • Spelling variants (e.g. "วิทยา" vs "วิชา") — same problem
//
// To upgrade later: maintain a synonym map (`canonicalNames.ts`) and apply
// here before joining the key.

// ── Public types ─────────────────────────────────────────────────────────────

export interface CanonicalMajorParts {
  name:      string         // faculty name, e.g. "คณะวิศวกรรมศาสตร์"
  majorName: string | null  // null when the major is the faculty itself (e.g. "คณะแพทยศาสตร์")
}

const KEY_SEPARATOR = "__"

// ── Key derivation ───────────────────────────────────────────────────────────

function cleanWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim()
}

export function getCanonicalMajorKey(faculty: {
  name:      string
  majorName?: string | null
}): string {
  const name  = cleanWhitespace(faculty.name)
  const major = cleanWhitespace(faculty.majorName ?? "")
  return major ? `${name}${KEY_SEPARATOR}${major}` : name
}

// ── URL slug round-trip ──────────────────────────────────────────────────────
// We encode the canonical key directly into the URL path. Modern browsers and
// search engines handle URL-encoded Thai fine; users see "%E0%..." in the
// address bar but the decoded form ("คณะแพทยศาสตร์") appears in shared links,
// tab titles, and Google Search snippets.

export function majorSlugFromKey(key: string): string {
  return encodeURIComponent(key)
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
  if (sepIdx === -1) return { name: decoded, majorName: null }
  return {
    name:      decoded.slice(0, sepIdx),
    majorName: decoded.slice(sepIdx + KEY_SEPARATOR.length) || null,
  }
}

// ── Display helper ───────────────────────────────────────────────────────────

/** "คณะแพทยศาสตร์" or "วิศวกรรมคอมพิวเตอร์ · คณะวิศวกรรมศาสตร์" */
export function formatMajorLabel(parts: CanonicalMajorParts): string {
  return parts.majorName ? `${parts.majorName} · ${parts.name}` : parts.name
}
