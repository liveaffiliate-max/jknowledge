// ── Compare flow persistence ─────────────────────────────────────────────────
// Stored in sessionStorage so users who navigate to /scores and back, or open
// a share link in a new tab, don't lose their slots. Mirrors the pattern used
// by analyze-form's `jknowledge:analyze:v1` key.

import { COMPARE_MAX_SLOTS } from "@/types/tcas"

const STORAGE_KEY = "jknowledge:compare:v1"

export interface PersistedCompareState {
  /** Faculty ids in slot order. `null` = empty slot the user has not picked yet. */
  facultyIds: (string | null)[]
  /** Subject-code → score string. One shared score input across every slot. */
  subjectScores: Record<string, string>
  /** Fallback single total when the selected faculties have no weights. */
  fallbackScore: string
}

export function readCompareState(): PersistedCompareState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedCompareState
    if (!Array.isArray(parsed.facultyIds)) return null
    return {
      facultyIds: parsed.facultyIds
        .slice(0, COMPARE_MAX_SLOTS)
        .map((id) => (typeof id === "string" && id ? id : null)),
      subjectScores: parsed.subjectScores ?? {},
      fallbackScore: parsed.fallbackScore ?? "",
    }
  } catch {
    return null
  }
}

export function writeCompareState(state: PersistedCompareState | null) {
  if (typeof window === "undefined") return
  try {
    if (!state || state.facultyIds.every((id) => !id)) {
      window.sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode errors
  }
}

export function clearCompareState() {
  if (typeof window === "undefined") return
  try { window.sessionStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
}
