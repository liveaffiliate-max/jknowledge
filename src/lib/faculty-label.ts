// ── Faculty label normalization ──────────────────────────────────────────────
// COTMES (กสพท / Consortium of Thai Medical Schools) is stored in the DB as if
// it were a single University, but it's actually a joint admission channel that
// pools faculties from many member universities. Its `shortName` is "กสพท." for
// every slot — making compare charts ambiguous ("กสพท. | COTMES" appears N times
// in the legend, hiding which actual university each line belongs to).
//
// We extract the real member university from the embedded faculty name and
// surface a `channel: "กสพท"` badge separately so users see both signals.

interface UniversityLike {
  name?:      string
  shortName?: string
}

// Curated categorical palette for compare charts. Chosen for:
//   1. Perceptual distance — 4 hues that don't clash even with two adjacent lines
//   2. Color-blind safety — no red+green pair (uses blue+orange instead)
//   3. Brand-neutral — works regardless of which universities the user picked
// Order roughly matches Tableau 10's first four entries.
export const COMPARE_PALETTE = [
  "#16a34a",  // green-600
  "#2563eb",  // blue-600
  "#ea580c",  // orange-600
  "#9333ea",  // purple-600
] as const

export function paletteColor(idx: number): string {
  return COMPARE_PALETTE[idx % COMPARE_PALETTE.length]
}

// ── COTMES detection ─────────────────────────────────────────────────────────

export function isCOTMES(uni: UniversityLike): boolean {
  return Boolean(
    uni.name?.includes("กลุ่มสถาบัน") ||
    uni.shortName?.startsWith("กสพท")
  )
}

// ── COTMES member universities ───────────────────────────────────────────────
// Maps the full name (as it appears embedded in faculty.name) → a short label.
// Add more as new members surface; order doesn't matter (longest match wins
// naturally because we test specific names before generic mahawittayalai).

const COTMES_MEMBER_MAP: Array<readonly [RegExp, string]> = [
  [/จุฬาลงกรณ์มหาวิทยาลัย/,                                     "จุฬาฯ"],
  [/มหาวิทยาลัยมหิดล/,                                          "มหิดล"],
  [/มหาวิทยาลัยขอนแก่น/,                                        "มข."],
  [/มหาวิทยาลัยเชียงใหม่/,                                      "มช."],
  [/มหาวิทยาลัยสงขลานครินทร์/,                                  "ม.อ."],
  [/มหาวิทยาลัยศรีนครินทรวิโรฒ/,                                "มศว"],
  [/มหาวิทยาลัยธรรมศาสตร์/,                                     "มธ."],
  [/มหาวิทยาลัยนเรศวร/,                                          "มน."],
  [/มหาวิทยาลัยบูรพา/,                                           "ม.บูรพา"],
  [/มหาวิทยาลัยรังสิต/,                                          "ม.รังสิต"],
  [/มหาวิทยาลัยเทคโนโลยีสุรนารี/,                                "มทส."],
  [/มหาวิทยาลัยวลัยลักษณ์/,                                      "มวล."],
  [/สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง/,           "สจล."],
  [/มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี/,                      "มจธ."],
  [/มหาวิทยาลัยพะเยา/,                                           "ม.พะเยา"],
  [/มหาวิทยาลัยแม่ฟ้าหลวง/,                                      "มฟล."],
  [/มหาวิทยาลัยอุบลราชธานี/,                                     "ม.อบ."],
  [/มหาวิทยาลัยมหาสารคาม/,                                       "มมส."],
  [/มหาวิทยาลัยทักษิณ/,                                          "มทษ."],
  [/มหาวิทยาลัยกรุงเทพ/,                                         "ม.กรุงเทพ"],
  [/มหาวิทยาลัยสยาม/,                                            "ม.สยาม"],
  [/วิทยาลัยแพทยศาสตร์พระมงกุฎเกล้า/,                            "วพม."],
]

// ── Public API ───────────────────────────────────────────────────────────────

export interface FacultyLabelParts {
  /** Primary short identifier — what the user scans first (e.g. "จุฬาฯ", "KU") */
  primaryShort: string
  /** Faculty name with embedded university stripped (e.g. "คณะทันตแพทยศาสตร์") */
  primaryName:  string
  /** Optional admission-channel marker, shown as a small badge */
  channel?:     "กสพท"
}

export function getFacultyLabelParts(faculty: {
  name:       string
  university: UniversityLike
}): FacultyLabelParts {
  const consortium = isCOTMES(faculty.university)

  if (!consortium) {
    return {
      primaryShort: faculty.university.shortName ?? "",
      primaryName:  faculty.name,
    }
  }

  // COTMES: the actual member uni is embedded in faculty.name.
  // Strip that suffix so primaryName reads cleanly ("คณะทันตแพทยศาสตร์").
  for (const [pattern, short] of COTMES_MEMBER_MAP) {
    if (pattern.test(faculty.name)) {
      const stripped = faculty.name.replace(pattern, "").trim()
      return {
        primaryShort: short,
        primaryName:  stripped || faculty.name,
        channel:      "กสพท",
      }
    }
  }

  // Fallback: unknown COTMES member — keep raw shortName but still flag channel.
  return {
    primaryShort: faculty.university.shortName ?? "",
    primaryName:  faculty.name,
    channel:      "กสพท",
  }
}
