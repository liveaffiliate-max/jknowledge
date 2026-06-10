import type { MBTIAnswer, MBTIDimension, MBTIQuestion, MBTIResult, MBTIType } from "@/types/mbti"

// ── Likert constants ──────────────────────────────────────────────────────────

/**
 * Base signed net per Likert value (before question weight/reverse applied).
 * 1 = strongly A  → +2
 * 2 = lean A      → +1
 * 3 = neutral     →  0
 * 4 = lean B      → -1
 * 5 = strongly B  → -2
 */
export const LIKERT_NET: Record<number, number> = { 1: 2, 2: 1, 3: 0, 4: -1, 5: -2 }

// ── Per-dimension progress ────────────────────────────────────────────────────

export interface DimProgress {
  answered:    number   // total questions answered in this dimension
  net:         number   // signed weighted sum (+→A-pole, −→B-pole)
  maxPossible: number   // sum of (weight × 2) for all answered questions
}

export type DimProgressMap = Record<MBTIDimension, DimProgress>

export function initialProgress(): DimProgressMap {
  const zero = (): DimProgress => ({ answered: 0, net: 0, maxPossible: 0 })
  return { EI: zero(), SN: zero(), TF: zero(), JP: zero() }
}

/**
 * Incorporates a new answer into the dimension progress map.
 * Applies question weight and reverse flag to the net score.
 */
export function updateProgress(
  prev:      DimProgressMap,
  dim:       MBTIDimension,
  likert:    number,
  weight    = 1.0,
  isReverse = false
): DimProgressMap {
  const direction = isReverse ? -1 : 1
  const contribution = LIKERT_NET[likert] * direction * weight
  return {
    ...prev,
    [dim]: {
      answered:    prev[dim].answered + 1,
      net:         prev[dim].net + contribution,
      maxPossible: prev[dim].maxPossible + weight * 2,
    },
  }
}

/**
 * Confidence in the current dimension result: 0 = perfectly undecided, 1 = maximum certainty.
 * Uses maxPossible so that weighted questions are handled correctly.
 */
export function getDimConfidence(p: DimProgress): number {
  if (p.maxPossible === 0) return 0
  return Math.abs(p.net) / p.maxPossible
}

// ── Adaptive quiz logic ───────────────────────────────────────────────────────

/** Minimum questions answered per dimension before early-finish is offered */
export const MIN_PER_DIM = 3

/** Confidence threshold (0–1) required per dimension for early-finish */
export const CONFIDENCE_THRESHOLD = 0.75

/** Canonical dimension order — also the MBTI letter order (E/I · S/N · T/F · J/P) */
export const DIM_ORDER: MBTIDimension[] = ["EI", "SN", "TF", "JP"]

/** Returns true when every dimension is confident enough to determine the type early */
export function canFinishEarly(progress: DimProgressMap): boolean {
  return DIM_ORDER.every(
    (d) =>
      progress[d].answered >= MIN_PER_DIM &&
      getDimConfidence(progress[d]) >= CONFIDENCE_THRESHOLD
  )
}

// ── Live personality preview ────────────────────────────────────────────────

/** The A-pole / B-pole letters for each dimension */
const POLE_LETTERS: Record<MBTIDimension, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
}

/** Below this confidence a letter is still "unknown" (shown as ?) */
export const PREVIEW_MIN_CONFIDENCE = 0.15

export interface LetterPreview {
  dimension:  MBTIDimension
  /** Current leading letter, or "?" when too uncertain to guess */
  letter:     string
  confidence: number   // 0–1
  /** True once confidence passes the early-finish threshold (letter is locked-in) */
  solid:      boolean
}

/**
 * Builds the live "I N ? J" style preview from current progress.
 * Each dimension contributes one letter whose certainty drives the UI opacity.
 */
export function getPartialType(progress: DimProgressMap): LetterPreview[] {
  return DIM_ORDER.map((dim) => {
    const p    = progress[dim]
    const conf = getDimConfidence(p)
    const [poleA, poleB] = POLE_LETTERS[dim]
    const letter =
      p.answered === 0 || conf < PREVIEW_MIN_CONFIDENCE
        ? "?"
        : p.net >= 0
        ? poleA
        : poleB
    return { dimension: dim, letter, confidence: conf, solid: conf >= CONFIDENCE_THRESHOLD }
  })
}

/**
 * Overall "how well do we understand you" signal (0–1), averaged across dimensions.
 * Drives the confidence-based progress bar (replaces question-count progress).
 */
export function overallConfidence(progress: DimProgressMap): number {
  const sum = DIM_ORDER.reduce(
    (s, d) => s + Math.min(1, getDimConfidence(progress[d])),
    0
  )
  return sum / DIM_ORDER.length
}

/**
 * Returns the dimensions whose confidence just crossed the early-finish
 * threshold between two progress snapshots — triggers completion celebrations.
 */
export function newlyCompletedDimensions(
  prev: DimProgressMap,
  next: DimProgressMap
): MBTIDimension[] {
  const done = (p: DimProgressMap, d: MBTIDimension) =>
    p[d].answered >= MIN_PER_DIM && getDimConfidence(p[d]) >= CONFIDENCE_THRESHOLD
  return DIM_ORDER.filter((d) => !done(prev, d) && done(next, d))
}

/**
 * Picks the next question from the remaining pool.
 * Prioritises the dimension with the lowest confidence (most uncertain first).
 */
export function pickNextQuestion(
  pool:     MBTIQuestion[],
  progress: DimProgressMap
): MBTIQuestion | null {
  if (pool.length === 0) return null

  const available = DIM_ORDER.filter((d) => pool.some((q) => q.dimension === d))

  const sorted = [...available].sort(
    (a, b) => getDimConfidence(progress[a]) - getDimConfidence(progress[b])
  )

  const targetDim = sorted[0]
  return pool.find((q) => q.dimension === targetDim) ?? pool[0]
}

// ── Neutral spam detection ────────────────────────────────────────────────────

/** Threshold ratio of neutral answers that triggers a warning */
export const NEUTRAL_SPAM_THRESHOLD = 0.6

/** Minimum answers before neutral-spam check kicks in */
export const NEUTRAL_SPAM_MIN_ANSWERED = 6

/**
 * Returns true when the user has been selecting "neutral" too often,
 * suggesting they may not be engaging meaningfully with the questions.
 */
export function isNeutralSpamming(answers: MBTIAnswer[]): boolean {
  if (answers.length < NEUTRAL_SPAM_MIN_ANSWERED) return false
  const neutralCount = answers.filter((a) => a.likert === 3).length
  return neutralCount / answers.length > NEUTRAL_SPAM_THRESHOLD
}

// ── Scoring ───────────────────────────────────────────────────────────────────

/**
 * Computes the MBTI type from a list of weighted, possibly-reversed Likert answers.
 *
 * Neutral answers (likert = 3) contribute nothing to the scores.
 * Reverse questions have their net direction flipped before scoring.
 * Each answer's contribution = |LIKERT_NET[likert]| × weight.
 */
export function computeMBTIResult(answers: MBTIAnswer[]): MBTIResult {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  for (const a of answers) {
    const direction = a.isReverse ? -1 : 1
    const net = LIKERT_NET[a.likert] * direction * (a.weight ?? 1.0)
    if (net === 0) continue   // neutral — no effect

    const w = Math.abs(net)
    switch (a.dimension) {
      case "EI": net > 0 ? (scores.E += w) : (scores.I += w); break
      case "SN": net > 0 ? (scores.S += w) : (scores.N += w); break
      case "TF": net > 0 ? (scores.T += w) : (scores.F += w); break
      case "JP": net > 0 ? (scores.J += w) : (scores.P += w); break
    }
  }

  const type: MBTIType = [
    scores.E >= scores.I ? "E" : "I",
    scores.S >= scores.N ? "S" : "N",
    scores.T >= scores.F ? "T" : "F",
    scores.J >= scores.P ? "J" : "P",
  ].join("") as MBTIType

  return { type, scores }
}

/**
 * Returns the 0–100 dominance percentage of the stronger pole.
 * Used for dimension bar display in the result card.
 */
export function dimensionStrength(a: number, b: number): number {
  const total = a + b
  if (total === 0) return 50
  return Math.round((Math.max(a, b) / total) * 100)
}

/** Tie window — if the dominant pole sits within this band of 50%, flag as edge */
export const EDGE_BAND = 53

export interface DimBreakdownItem {
  /** Dominant pole letter, e.g. "E" or "I" */
  letter: string
  /** Pole percentage 0–100 (always for the dominant side, ≥ 50) */
  pct:    number
  /** True when the result is borderline (within EDGE_BAND of 50/50) */
  edge:   boolean
  /** Original A-side and B-side letters in canonical order */
  poleA:  string
  poleB:  string
}

/**
 * Builds a 4-item breakdown of dimension percentages from the raw scores object.
 * Each item describes the *dominant* pole for that dimension along with whether
 * the result is too close to 50/50 to be considered confident.
 *
 * Phase A.4 — drives the inline "E 73% · S 60% · T 51% · J 85%" summary on the
 * result card / shareable page so users see continuous information rather than
 * just the 4-letter type.
 */
export function getDimensionBreakdown(scores: {
  E: number; I: number
  S: number; N: number
  T: number; F: number
  J: number; P: number
}): DimBreakdownItem[] {
  const build = (a: number, b: number, lA: string, lB: string): DimBreakdownItem => {
    const total = a + b
    const aPct  = total === 0 ? 50 : (a / total) * 100
    const dominantA = a >= b
    const rawPct = dominantA ? aPct : 100 - aPct
    const pct = Math.round(rawPct)
    return {
      letter: dominantA ? lA : lB,
      pct,
      edge:   pct <= EDGE_BAND,
      poleA:  lA,
      poleB:  lB,
    }
  }
  return [
    build(scores.E, scores.I, "E", "I"),
    build(scores.S, scores.N, "S", "N"),
    build(scores.T, scores.F, "T", "F"),
    build(scores.J, scores.P, "J", "P"),
  ]
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Fisher-Yates in-place shuffle — returns a new shuffled array */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Deterministic seeded selection (Phase A.1) ────────────────────────────────
//
// Goal: pick a stratified subset (e.g. 24 from 60) that is **stable for a given
// user** so retake results are comparable. Same seed → same subset → same order.
// Falls back to a stable per-question order even when the seed is unknown.

/** Hash an arbitrary string → uint32 seed. Fast deterministic FNV-1a. */
export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

/** Mulberry32 — tiny, well-distributed seedable PRNG. Returns [0,1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Seeded Fisher-Yates — pure function, never touches Math.random. */
export function shuffleSeeded<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Per-dimension session quota.
 * 6 items per dim × 4 dims = 24 questions/session — keeps the original quiz length.
 */
export const SESSION_PER_DIM = { std: 4, rev: 2 } as const
export const SESSION_TOTAL = (SESSION_PER_DIM.std + SESSION_PER_DIM.rev) * DIM_ORDER.length

/**
 * Picks a stratified, deterministic subset of `pool` for one quiz session.
 *
 *   • For each dimension, draws `SESSION_PER_DIM.std` standard items and
 *     `SESSION_PER_DIM.rev` reverse items at random (seeded).
 *   • Interleaves dimensions in the final order so the user doesn't see
 *     four EI questions in a row.
 *   • Returns the original objects unmodified.
 *
 * `seed` should be a stable identifier for the user — Clerk userId for
 * signed-in users, a long-lived localStorage uuid for guests. Same seed →
 * identical question set & ordering.
 */
export function pickQuestionsForSession(
  pool: MBTIQuestion[],
  seed: string,
): MBTIQuestion[] {
  const rng = mulberry32(hashStringToSeed(seed))

  // Bucket the pool by dim + reverse
  const buckets: Record<MBTIDimension, { std: MBTIQuestion[]; rev: MBTIQuestion[] }> = {
    EI: { std: [], rev: [] },
    SN: { std: [], rev: [] },
    TF: { std: [], rev: [] },
    JP: { std: [], rev: [] },
  }
  for (const q of pool) {
    const bucket = q.isReverse ? "rev" : "std"
    buckets[q.dimension][bucket].push(q)
  }

  // Draw quota per bucket — if a bucket is short, take what's available
  const drawn: Record<MBTIDimension, MBTIQuestion[]> = { EI: [], SN: [], TF: [], JP: [] }
  for (const dim of DIM_ORDER) {
    const stdShuf = shuffleSeeded(buckets[dim].std, rng).slice(0, SESSION_PER_DIM.std)
    const revShuf = shuffleSeeded(buckets[dim].rev, rng).slice(0, SESSION_PER_DIM.rev)
    drawn[dim] = shuffleSeeded([...stdShuf, ...revShuf], rng)
  }

  // Round-robin interleave across dims so consecutive items differ in dimension
  const interleaved: MBTIQuestion[] = []
  const maxLen = Math.max(...DIM_ORDER.map((d) => drawn[d].length))
  for (let i = 0; i < maxLen; i++) {
    for (const dim of DIM_ORDER) {
      const q = drawn[dim][i]
      if (q) interleaved.push(q)
    }
  }
  return interleaved
}
