// ── Smart insights ───────────────────────────────────────────────────────────
// Pure rule-based commentary that surfaces "what does this data mean" right
// where users look. No LLM, no async — just deterministic helpers that any
// caller can pipe into <InsightStrip>.
//
// Design principles (per DESIGN.md):
//   • Tone: friendly senior, not formal disclaimer
//   • Color: green for "ง่ายขึ้น / โอกาสสูง", amber for "ระวัง / ยากขึ้น",
//     blue for neutral context. NEVER red.
//   • Each insight is independently skippable — return null when not applicable.

import { weightsToSubjects, calculateWeightedScore } from "./subjects"
import { calculateAdmissionChance } from "@/utils/analyze"
import type { MajorComparisonEntry } from "@/server/queries"
import type { UserScoresState } from "./user-scores"

export type InsightTone = "good" | "warn" | "info" | "celebrate"

export interface Insight {
  /** Stable id used for React keys and analytics later. */
  id:    string
  tone:  InsightTone
  /** Single-line headline. */
  title: string
  /** 1-2 sentence supporting body, optional. */
  body?: string
}

// ── Per-entry chance helper ──────────────────────────────────────────────────
// Local copy of the chance calc — mirrors MajorComparisonTable's internal one
// but pure and import-safe (no React hooks). Two callers means we accept the
// duplication for now; if a third needs it we'll consolidate.

function entryChance(
  entry:        MajorComparisonEntry,
  userSubjects: Record<string, string>,
): { computed: boolean; chance?: "high" | "competitive" | "low" } {
  if (!entry.requirementWeights || entry.latestMinScore == null) return { computed: false }
  const subjects = weightsToSubjects(entry.requirementWeights)
  if (subjects.length === 0) return { computed: false }

  const weighted = calculateWeightedScore(subjects, userSubjects)
  if (weighted <= 0) return { computed: false }

  return {
    computed: true,
    chance:   calculateAdmissionChance(
      weighted,
      entry.latestMinScore,
      entry.latestAvgScore ?? entry.latestMinScore,
    ),
  }
}

// ── Trend across all unis (3-year delta on minScore) ────────────────────────

function trendDelta(entry: MajorComparisonEntry): number | null {
  const sorted = [...entry.scores].sort((a, b) => a.year - b.year)
  if (sorted.length < 2) return null
  // Average of the last two deltas — smooths out single-year noise.
  const deltas: number[] = []
  for (let i = Math.max(1, sorted.length - 3); i < sorted.length; i++) {
    deltas.push(sorted[i].minScore - sorted[i - 1].minScore)
  }
  if (deltas.length === 0) return null
  return deltas.reduce((a, b) => a + b, 0) / deltas.length
}

function trendInsight(entries: MajorComparisonEntry[]): Insight | null {
  const deltas = entries.map(trendDelta).filter((d): d is number => d !== null)
  if (deltas.length < 3) return null
  const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length

  if (avg <= -1.5) {
    return {
      id:    "trend-easier",
      tone:  "good",
      title: `แนวโน้มแข่งง่ายขึ้น — คะแนนต่ำสุดเฉลี่ยลด ${Math.abs(avg).toFixed(1)} คะแนน/ปี`,
      body:  `ใน ${deltas.length} มหาลัย คะแนนตัดมีแนวโน้มลดลง 2-3 ปีล่าสุด — รอบนี้น่าจะเอื้อมถึงง่ายกว่าก่อนหน้า`,
    }
  }
  if (avg >= 1.5) {
    return {
      id:    "trend-harder",
      tone:  "warn",
      title: `แนวโน้มแข่งยากขึ้น — คะแนนต่ำสุดเฉลี่ยขึ้น ${avg.toFixed(1)} คะแนน/ปี`,
      body:  `ใน ${deltas.length} มหาลัย คะแนนตัดมีแนวโน้มสูงขึ้น 2-3 ปีล่าสุด — ตั้งเป้าให้สูงกว่าปีก่อน`,
    }
  }
  return {
    id:    "trend-stable",
    tone:  "info",
    title: "แนวโน้มคะแนนตัดเสถียร",
    body:  `ใน ${deltas.length} มหาลัย คะแนนตัดขึ้น-ลงไม่เกิน 1.5 คะแนน ใช้คะแนนปีก่อนเป็นเป้าได้`,
  }
}

// ── Score-aware: how many "high chance" unis for the user ───────────────────

function scoreReachInsight(
  entries:      MajorComparisonEntry[],
  userScores:   UserScoresState | null,
): Insight | null {
  if (!userScores) return null
  const hasAnyScore = Object.values(userScores.subjectScores).some(
    (v) => parseFloat(v) > 0,
  )
  if (!hasAnyScore) return null

  let high = 0, competitive = 0, lowOrUnknown = 0, computed = 0
  for (const e of entries) {
    const r = entryChance(e, userScores.subjectScores)
    if (!r.computed) {
      lowOrUnknown++
      continue
    }
    computed++
    if (r.chance === "high") high++
    else if (r.chance === "competitive") competitive++
    else lowOrUnknown++
  }

  if (computed === 0) return null

  // Headline picks the most actionable framing for the user
  if (high > 0) {
    return {
      id:    "reach-high",
      tone:  "celebrate",
      title: `คะแนนของคุณให้โอกาสสูง ${high} มหาวิทยาลัย`,
      body:  competitive > 0
        ? `+ อีก ${competitive} ที่ยังแข่งขันได้ — ดูตารางด้านล่างเพื่อเลือกอันดับ`
        : `เปิดตารางดูว่ามหาวิทยาลัยไหนบ้าง`,
    }
  }
  if (competitive > 0) {
    return {
      id:    "reach-competitive",
      tone:  "info",
      title: `คุณยังแข่งขันได้กับ ${competitive} มหาวิทยาลัย`,
      body:  `คะแนนใกล้เคียงเกณฑ์ต่ำสุด — อาจติดได้ถ้าคู่แข่งปีนี้น้อย`,
    }
  }
  return {
    id:    "reach-low",
    tone:  "warn",
    title: "คะแนนยังต่ำกว่าทุกเกณฑ์ในรอบล่าสุด",
    body:  `กรอกคะแนนเพิ่มหากมีวิชาที่ยังไม่ได้กรอก หรือพิจารณาคณะใกล้เคียงในหน้า /analyze/major`,
  }
}

// ── Range insight: how spread the unis' scores are ──────────────────────────

function rangeInsight(entries: MajorComparisonEntry[]): Insight | null {
  const mins = entries.map((e) => e.latestMinScore).filter((v): v is number => v != null)
  if (mins.length < 3) return null
  const min = Math.min(...mins)
  const max = Math.max(...mins)
  const span = max - min

  if (span >= 15) {
    return {
      id:    "range-wide",
      tone:  "info",
      title: `ช่วงคะแนนกว้าง ${min.toFixed(1)} – ${max.toFixed(1)} (ห่างกัน ${span.toFixed(1)})`,
      body:  `ตัวเลือกครอบคลุมหลายระดับ — มีทั้งคณะที่เอื้อมถึงและคณะแข่งสูงให้เลือก`,
    }
  }
  if (span <= 5) {
    return {
      id:    "range-narrow",
      tone:  "info",
      title: `เกณฑ์ใกล้กันมาก (ช่วง ${span.toFixed(1)} คะแนน)`,
      body:  `คะแนนตัดของทุกมหาลัยใกล้เคียงกัน — เลือกจากที่ตั้งหรือชื่อเสียงคณะเป็นหลักได้`,
    }
  }
  return null
}

// ── Public API ───────────────────────────────────────────────────────────────

export function computeMajorInsights(
  entries:    MajorComparisonEntry[],
  userScores: UserScoresState | null,
): Insight[] {
  if (entries.length === 0) return []
  // Priority order: user-actionable first, then context.
  return [
    scoreReachInsight(entries, userScores),
    trendInsight(entries),
    rangeInsight(entries),
  ].filter((x): x is Insight => x !== null)
}
