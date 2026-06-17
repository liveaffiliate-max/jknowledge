"use client"

// ── MajorInsights ────────────────────────────────────────────────────────────
// Client wrapper that re-runs `computeMajorInsights` whenever the user's
// localStorage scores change, so the "คะแนนของคุณให้โอกาสสูง N" insight
// updates live as they type into MyScoreCard above.

import { useMemo } from "react"
import { useUserScores } from "@/lib/user-scores"
import { computeMajorInsights } from "@/lib/insights"
import { InsightStrip } from "./insight-strip"
import type { MajorComparisonEntry } from "@/server/queries"

interface Props {
  entries: MajorComparisonEntry[]
}

export function MajorInsights({ entries }: Props) {
  const { state } = useUserScores()
  const insights  = useMemo(
    () => computeMajorInsights(entries, state),
    [entries, state],
  )
  return <InsightStrip insights={insights} />
}
