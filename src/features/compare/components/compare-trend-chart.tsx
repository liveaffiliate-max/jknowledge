"use client"

// ── CompareTrendChart ────────────────────────────────────────────────────────
// Multi-line trend chart that overlays each selected faculty's minScore history.
// One line per slot, colored by university brand color. Legend is clickable —
// tap a chip to hide/show its line so users can isolate comparisons.

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { getFacultyLabelParts, paletteColor } from "@/lib/faculty-label"
import type { AdmissionResult } from "@/types/tcas"

interface CompareTrendChartProps {
  results: AdmissionResult[]   // non-null results only; caller filters out empty/no-data slots
}

// ── Custom tooltip ───────────────────────────────────────────────────────────

interface TooltipPayload {
  color:   string
  dataKey: string
  value:   number
}

function CustomTooltip({
  active,
  payload,
  label,
  results,
}: {
  active?:  boolean
  payload?: TooltipPayload[]
  label?:   number
  results:  AdmissionResult[]
}) {
  if (!active || !payload?.length) return null
  // Highest score on top so the leader is immediately visible
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs space-y-0.5 min-w-[180px]">
      <p className="font-semibold text-gray-700 mb-1">ปี {label}</p>
      {sorted.map((p) => {
        const idx = parseInt(p.dataKey.replace("slot_", ""), 10)
        const r   = results[idx]
        if (!r) return null
        const parts = getFacultyLabelParts(r.faculty)
        return (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="truncate text-gray-600 max-w-[140px]">
              {parts.primaryShort}
              {parts.channel && (
                <span className="ml-1 text-[10px] text-blue-600">· {parts.channel}</span>
              )}
            </span>
            <span className="ml-auto font-bold tabular-nums text-gray-800">
              {p.value.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function CompareTrendChart({ results }: CompareTrendChartProps) {
  const [hidden, setHidden] = useState<Set<number>>(new Set())

  // Union of years across all slots
  const yearSet = new Set<number>()
  results.forEach((r) => r.faculty.scores.forEach((s) => yearSet.add(s.year)))
  const years = Array.from(yearSet).sort((a, b) => a - b)

  // Need at least 2 distinct years AND 1 valid line to show a meaningful trend
  if (years.length < 2 || results.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-400">
        ข้อมูลย้อนหลังไม่เพียงพอสำหรับกราฟเปรียบเทียบ
      </div>
    )
  }

  // Pivot: one row per year, one column per slot
  const data = years.map((year) => {
    const row: Record<string, number | string> = { year }
    results.forEach((r, i) => {
      const found = r.faculty.scores.find((s) => s.year === year)
      if (found) row[`slot_${i}`] = found.minScore
    })
    return row
  })

  // Y range across visible lines — pad ±3 for breathing room
  const allValues = results.flatMap((r) => r.faculty.scores.map((s) => s.minScore))
  const minY = Math.max(0,   Math.floor(Math.min(...allValues) - 3))
  const maxY = Math.min(100, Math.ceil(Math.max(...allValues) + 3))

  function toggleLine(idx: number) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <TrendingUp className="h-4 w-4 text-green-600" />
          เปรียบเทียบคะแนนต่ำสุดย้อนหลัง
        </div>
        <span className="text-[11px] text-gray-400">
          แตะที่ชื่อคณะเพื่อซ่อน/แสดง
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip results={results} />} />
          {results.map((r, i) => {
            const parts = getFacultyLabelParts(r.faculty)
            return (
              <Line
                key={i}
                type="monotone"
                dataKey={`slot_${i}`}
                name={`${parts.primaryShort} · ${parts.primaryName}`}
                stroke={paletteColor(i)}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                // Larger dot on hover — anchors "where am I in this year"
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                hide={hidden.has(i)}
                isAnimationActive={false}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Custom toggleable legend — chips that strikethrough when hidden */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {results.map((r, i) => {
          const isHidden = hidden.has(i)
          const color    = paletteColor(i)
          const parts    = getFacultyLabelParts(r.faculty)
          return (
            <button
              type="button"
              key={i}
              onClick={() => toggleLine(i)}
              aria-pressed={!isHidden}
              aria-label={`สลับการแสดงเส้นของ ${parts.primaryShort} ${parts.primaryName}`}
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all",
                isHidden
                  ? "border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              <span
                className={cn("h-2 w-2 flex-shrink-0 rounded-full", isHidden && "opacity-30")}
                style={{ background: color }}
              />
              <span className={cn("truncate", isHidden && "line-through")}>
                {parts.primaryShort} · {parts.primaryName}
              </span>
              {parts.channel && (
                <span className={cn(
                  "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none",
                  isHidden
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-50 text-blue-700"
                )}>
                  {parts.channel}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
