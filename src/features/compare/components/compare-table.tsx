"use client"

// ── CompareTable ─────────────────────────────────────────────────────────────
// Side-by-side comparison grid. One card per slot.
// Desktop: 2-4 columns sitting next to each other.
// Mobile:  cards stack vertically.
// Highlights the best/worst per metric — per DESIGN.md never red.

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { CHANCE_CONFIG } from "@/utils/analyze"
import { ScorePositionBar } from "@/features/analyze/components/score-position-bar"
import { getFacultyLabelParts, paletteColor } from "@/lib/faculty-label"
import type { AdmissionResult } from "@/types/tcas"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  Users,
  Trophy,
  type LucideIcon,
} from "lucide-react"

interface CompareSlotResult {
  /** null = slot is empty or has no historical data */
  result:  AdmissionResult | null
  /** Optional reason when result is null */
  reason?: "empty" | "no_data" | "no_score"
}

interface CompareTableProps {
  slots: CompareSlotResult[]
}

const chanceIconConfig: Record<AdmissionResult["chance"], { icon: LucideIcon; color: string }> = {
  high:        { icon: CheckCircle2, color: "text-green-500" },
  competitive: { icon: AlertCircle,  color: "text-amber-500" },
  // "low" gets the same amber icon — DESIGN.md bans red alarms for low chance.
  // The CHANCE_CONFIG color still differs so users can tell them apart in text.
  low:         { icon: AlertCircle,  color: "text-amber-500" },
}

const trendConfig: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  rising:  { icon: TrendingUp,   label: "ยากขึ้น",     color: "text-amber-600" },
  falling: { icon: TrendingDown, label: "ง่ายขึ้น",    color: "text-green-600" },
  stable:  { icon: Minus,        label: "เสถียร",     color: "text-gray-500" },
}

// ── Sparkline ────────────────────────────────────────────────────────────────
// Tiny inline trend graph (no axes). Only shown when ≥ 2 years of data.

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 80
  const h = 24
  const stepX = w / (values.length - 1)
  const points = values
    .map((v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-green-500">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Empty card ───────────────────────────────────────────────────────────────

function EmptySlotCard({ reason }: { reason?: CompareSlotResult["reason"] }) {
  const text =
    reason === "no_data"  ? "ยังไม่มีข้อมูลคะแนนย้อนหลังของคณะนี้"
  : reason === "no_score" ? "กรอกคะแนนของคุณเพื่อดูผล"
                          : "ยังไม่ได้เลือกคณะ"
  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center">
      <p className="text-xs text-gray-400">{text}</p>
    </div>
  )
}

// ── Slot card ────────────────────────────────────────────────────────────────

function SlotCard({
  result,
  slotIndex,
  isBestChance,
  isLowestMin,
  isMostSeats,
}: {
  result:       AdmissionResult
  slotIndex:    number
  isBestChance: boolean
  isLowestMin:  boolean
  isMostSeats:  boolean
}) {
  const { faculty, userScore, chance, gap, latestMinScore, latestAvgScore, latestMaxScore, latestSeats, trend } = result
  const color      = CHANCE_CONFIG[chance]
  const chanceIc   = chanceIconConfig[chance]
  const trendIc    = trendConfig[trend]
  const parts      = getFacultyLabelParts(faculty)
  const accentHex  = paletteColor(slotIndex)
  const sparkValues = [...faculty.scores]
    .sort((a, b) => a.year - b.year)
    .map((s) => s.minScore)

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-white p-4",
        isBestChance ? "border-green-400 ring-2 ring-green-100" : "border-gray-200"
      )}
    >
      {/* Accent bar — matches the corresponding line color in CompareTrendChart */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: accentHex }}
        aria-hidden
      />

      {/* Header */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="min-w-0 flex-1 text-xs font-medium text-gray-500 truncate">
            {parts.primaryShort}
          </p>
          {parts.channel && (
            <span className="flex-shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-blue-700">
              {parts.channel}
            </span>
          )}
          {isBestChance && (
            <span className="flex-shrink-0 inline-flex items-center gap-0.5 rounded-full bg-green-600 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
              <Trophy className="h-2.5 w-2.5" />
              เอื้อมถึง
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-gray-900 line-clamp-2 break-words">
          {parts.primaryName}
        </p>
        {faculty.program && (
          <p className="mt-0.5 text-[11px] text-gray-400 truncate">{faculty.program}</p>
        )}
      </div>

      {/* Chance pill */}
      <div className={cn(
        "inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold border",
        color.bg, color.text, color.border
      )}>
        <chanceIc.icon className={cn("h-3.5 w-3.5", chanceIc.color)} />
        {color.label}
      </div>

      {/* Position bar */}
      <ScorePositionBar
        userScore={userScore}
        minScore={latestMinScore}
        avgScore={latestAvgScore}
        chance={chance}
      />

      {/* Gap */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs">
        <span className="text-gray-500">ห่างจากต่ำสุด</span>
        <span className={cn(
          "font-bold tabular-nums text-sm",
          gap >= 0 ? "text-green-600" : "text-gray-700"
        )}>
          {gap >= 0 ? "+" : ""}{gap.toFixed(1)}
        </span>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className={cn(
          "rounded-lg px-2 py-2",
          isLowestMin ? "bg-green-50 ring-1 ring-green-200" : "bg-gray-50"
        )}>
          <p className="text-[10px] text-gray-500">ต่ำสุด</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-800">
            {latestMinScore.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-2">
          <p className="text-[10px] text-gray-500">เฉลี่ย</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-800">
            {latestAvgScore.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-2">
          <p className="text-[10px] text-gray-500">สูงสุด</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-800">
            {latestMaxScore != null ? latestMaxScore.toFixed(1) : "–"}
          </p>
        </div>
      </div>

      {/* Seats + Trend row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn(
          "inline-flex items-center gap-1 rounded-lg px-2 py-1",
          isMostSeats ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "text-gray-500"
        )}>
          <Users className="h-3 w-3 flex-shrink-0" />
          <span className="tabular-nums">{latestSeats ?? "–"} ที่นั่ง</span>
        </span>
        <span className={cn("inline-flex items-center gap-1", trendIc.color)}>
          <trendIc.icon className="h-3 w-3 flex-shrink-0" />
          {trendIc.label}
        </span>
      </div>

      {/* Sparkline */}
      {sparkValues.length >= 2 && (
        <div className="flex items-center justify-between border-t border-gray-50 pt-2">
          <span className="text-[10px] text-gray-400">คะแนนต่ำสุดย้อนหลัง</span>
          <Sparkline values={sparkValues} />
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function CompareTable({ slots }: CompareTableProps) {
  const cols = slots.length

  // Highlight winners: best gap (highest), lowest min, most seats.
  // Ignore null results so empty slots don't skew the comparison.
  const { bestChanceIdx, lowestMinIdx, mostSeatsIdx } = useMemo(() => {
    let bestChanceIdx = -1, bestGap   = -Infinity
    let lowestMinIdx  = -1, lowestMin = Infinity
    let mostSeatsIdx  = -1, mostSeats = -Infinity
    slots.forEach((s, i) => {
      const r = s.result
      if (!r) return
      if (r.gap > bestGap)             { bestGap = r.gap; bestChanceIdx = i }
      if (r.latestMinScore < lowestMin) { lowestMin = r.latestMinScore; lowestMinIdx = i }
      const seats = r.latestSeats ?? -Infinity
      if (seats > mostSeats)           { mostSeats = seats; mostSeatsIdx = i }
    })
    return { bestChanceIdx, lowestMinIdx, mostSeatsIdx }
  }, [slots])

  const gridCols =
    cols >= 4 ? "lg:grid-cols-4" :
    cols === 3 ? "lg:grid-cols-3" :
                 "lg:grid-cols-2"

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", gridCols)}>
      {slots.map((slot, i) => (
        <div key={i}>
          {slot.result ? (
            <SlotCard
              result={slot.result}
              slotIndex={i}
              isBestChance={i === bestChanceIdx}
              isLowestMin={i === lowestMinIdx}
              isMostSeats={i === mostSeatsIdx}
            />
          ) : (
            <EmptySlotCard reason={slot.reason} />
          )}
        </div>
      ))}
    </div>
  )
}
