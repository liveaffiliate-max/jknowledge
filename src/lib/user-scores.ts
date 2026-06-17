// ── User scores: shared raw-subject storage ─────────────────────────────────
// One persisted record of the user's RAW subject scores (TGAT1, TGAT2, ...,
// A-Level Math 1, etc.) reused across /analyze, /analyze/compare, and
// /analyze/major. Each comparison computes its own weighted total from these
// raw values using the destination faculty's weights — never the other way
// around, because a "weighted total of 65" at one faculty is meaningless at
// another with different weights.
//
// localStorage (not sessionStorage) so a student returning tomorrow doesn't
// lose their inputs. Cleared on demand via `clearUserScores()`.

"use client"

import { useSyncExternalStore, useCallback } from "react"

const STORAGE_KEY = "jknowledge:user-scores:v1"

/** Legacy key written by analyze-form's persistence layer. We attempt a one-time
 *  migration on first read so users who entered scores before this shared
 *  store existed don't have to re-type them. */
const LEGACY_ANALYZE_KEY = "jknowledge:analyze:v1"

const CHANGE_EVENT = "jknowledge:user-scores"

export interface UserScoresState {
  /** Subject code → string score (preserve empty vs "0" distinction). */
  subjectScores: Record<string, string>
  /** Fallback total for faculties without weights. */
  fallbackScore: string
  /** Epoch ms — used to surface "ข้อมูลล่าสุด" hints in UI later. */
  updatedAt:     number
}

const emptyState: UserScoresState = {
  subjectScores: {},
  fallbackScore: "",
  updatedAt:     0,
}

// ── Snapshot cache ──────────────────────────────────────────────────────────
// useSyncExternalStore requires getSnapshot to return a STABLE reference when
// the underlying data hasn't changed. JSON.parse always creates a fresh object,
// so we memoize on the raw string from localStorage: same string → same parsed
// reference. Cache invalidates implicitly when the next read returns a
// different string.
//
// Module-level state is safe here because:
//   - Server: every read is gated by `typeof window === "undefined"` → null
//   - Client: there's only one window/localStorage per page

let cachedRaw:   string | null         = null
let cachedState: UserScoresState | null = null
let legacyChecked = false

function parse(raw: string): UserScoresState | null {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") {
      return {
        subjectScores: parsed.subjectScores ?? {},
        fallbackScore: parsed.fallbackScore ?? "",
        updatedAt:     parsed.updatedAt ?? 0,
      }
    }
  } catch {
    // fall through
  }
  return null
}

/** One-time pull-forward from sessionStorage[analyze:v1] → localStorage[user-scores:v1]
 *  so early adopters keep their inputs. Returns true if a migration happened. */
function migrateLegacyIfNeeded(): boolean {
  if (legacyChecked) return false
  legacyChecked = true
  if (typeof window === "undefined") return false
  try {
    if (window.localStorage.getItem(STORAGE_KEY)) return false
    const legacy = window.sessionStorage.getItem(LEGACY_ANALYZE_KEY)
    if (!legacy) return false
    const old = JSON.parse(legacy)
    if (!old?.subjectScores || Object.keys(old.subjectScores).length === 0) return false
    const migrated: UserScoresState = {
      subjectScores: old.subjectScores,
      fallbackScore: old.fallbackScore ?? "",
      updatedAt:     Date.now(),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    return true
  } catch {
    return false
  }
}

function getSnapshot(): UserScoresState | null {
  if (typeof window === "undefined") return null
  migrateLegacyIfNeeded()
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? ""
  if (raw === cachedRaw) return cachedState   // ← reference-stable on no-change
  cachedRaw   = raw
  cachedState = raw ? parse(raw) : null
  return cachedState
}

function getServerSnapshot(): UserScoresState | null {
  // SSR — no localStorage. Always return null; first client render rehydrates.
  return null
}

function invalidate() {
  cachedRaw   = null
  cachedState = null
}

// ── Imperative read / write ─────────────────────────────────────────────────
// `readUserScores` returns the latest snapshot — same reference as the hook's
// most recent render, so event handlers can read without going through React.

export function readUserScores(): UserScoresState | null {
  return getSnapshot()
}

export function writeUserScores(state: UserScoresState | null) {
  if (typeof window === "undefined") return
  try {
    if (!state || (!state.fallbackScore && Object.keys(state.subjectScores).length === 0)) {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      const payload: UserScoresState = {
        subjectScores: state.subjectScores,
        fallbackScore: state.fallbackScore,
        updatedAt:     state.updatedAt || Date.now(),
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }
    invalidate()
    // Notify subscribers in this tab — storage event only fires for other tabs.
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // ignore quota / private mode errors
  }
}

export function clearUserScores() {
  writeUserScores(null)
}

// ── Reactive hook ───────────────────────────────────────────────────────────

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  // Cross-tab change → 'storage' event. Same-tab change → our custom event.
  window.addEventListener("storage", callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function useUserScores() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setSubjectScore = useCallback((code: string, value: string) => {
    const current = readUserScores() ?? emptyState
    writeUserScores({
      ...current,
      subjectScores: { ...current.subjectScores, [code]: value },
      updatedAt:     Date.now(),
    })
  }, [])

  const setFallbackScore = useCallback((value: string) => {
    const current = readUserScores() ?? emptyState
    writeUserScores({ ...current, fallbackScore: value, updatedAt: Date.now() })
  }, [])

  const setAll = useCallback((next: Partial<UserScoresState>) => {
    const current = readUserScores() ?? emptyState
    writeUserScores({ ...current, ...next, updatedAt: Date.now() })
  }, [])

  const clear = useCallback(() => clearUserScores(), [])

  /** True when the user has entered ≥ 1 non-zero numeric score. */
  const hasScores = !!state && (
    state.fallbackScore !== "" ||
    Object.values(state.subjectScores).some((v) => parseFloat(v) > 0)
  )

  return {
    state,
    hasScores,
    setSubjectScore,
    setFallbackScore,
    setAll,
    clear,
  }
}
