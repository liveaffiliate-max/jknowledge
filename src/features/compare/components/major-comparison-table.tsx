"use client"

// ── MajorComparisonTable ─────────────────────────────────────────────────────
// Sortable ranking of every university offering a major. Default sort is the
// most useful one (lowest min score → easiest to get in), with toggles for
// seats and university name.

import { useState, useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { paletteColor } from "@/lib/faculty-label"
import type { MajorComparisonEntry } from "@/server/queries"
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Users,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"

type SortKey = "minScore" | "seats" | "shortName"
type SortDir = "asc" | "desc"

interface Props {
  entries: MajorComparisonEntry[]
}

const trendConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  rising:  { icon: TrendingUp,   color: "text-amber-600", label: "ขึ้น" },
  falling: { icon: TrendingDown, color: "text-green-600", label: "ลง" },
  stable:  { icon: Minus,        color: "text-gray-400",  label: "คงที่" },
}

/** Simple 2-point comparison — last vs prev year's minScore */
function quickTrend(scores: MajorComparisonEntry["scores"]): keyof typeof trendConfig {
  if (scores.length < 2) return "stable"
  const sorted = [...scores].sort((a, b) => a.year - b.year)
  const diff   = sorted[sorted.length - 1].minScore - sorted[sorted.length - 2].minScore
  if (diff > 1.5)  return "rising"
  if (diff < -1.5) return "falling"
  return "stable"
}

// ── Sortable header cell ─────────────────────────────────────────────────────

function SortHeader({
  label,
  k,
  current,
  dir,
  onClick,
  align = "left",
}: {
  label:   string
  k:       SortKey
  current: SortKey
  dir:     SortDir
  onClick: (k: SortKey) => void
  align?:  "left" | "right"
}) {
  const active = current === k
  const Icon   = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      type="button"
      onClick={() => onClick(k)}
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
        active ? "text-gray-800" : "text-gray-400 hover:text-gray-600",
        align === "right" && "flex-row-reverse"
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </button>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function MajorComparisonTable({ entries }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("minScore")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function handleSort(k: SortKey) {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(k)
      setSortDir(k === "minScore" || k === "shortName" ? "asc" : "desc")
    }
  }

  const sorted = useMemo(() => {
    const arr = [...entries]
    arr.sort((a, b) => {
      let av: number | string = 0
      let bv: number | string = 0
      if (sortKey === "minScore") {
        av = a.latestMinScore ?? Infinity
        bv = b.latestMinScore ?? Infinity
      } else if (sortKey === "seats") {
        av = a.latestSeats ?? -Infinity
        bv = b.latestSeats ?? -Infinity
      } else {
        av = a.university.shortName
        bv = b.university.shortName
      }
      const cmp = typeof av === "string"
        ? (av as string).localeCompare(bv as string, "th")
        : (av as number) - (bv as number)
      return sortDir === "asc" ? cmp : -cmp
    })
    return arr
  }, [entries, sortKey, sortDir])

  // Min-score range used to scale the inline mini-bar (visual aid for "how much
  // higher is the toughest uni than the easiest")
  const validMins = entries.map((e) => e.latestMinScore).filter((v): v is number => v != null)
  const minScale  = validMins.length ? Math.min(...validMins) : 0
  const maxScale  = validMins.length ? Math.max(...validMins) : 100
  const rangeSpan = Math.max(1, maxScale - minScale)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Desktop header */}
      <div className="hidden sm:grid grid-cols-[2rem_1fr_8rem_4.5rem_4.5rem_4.5rem_4rem] items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">#</span>
        <SortHeader label="มหาวิทยาลัย" k="shortName" current={sortKey} dir={sortDir} onClick={handleSort} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">ตำแหน่ง</span>
        <SortHeader label="ต่ำสุด" k="minScore" current={sortKey} dir={sortDir} onClick={handleSort} align="right" />
        <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">เฉลี่ย</span>
        <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">สูงสุด</span>
        <SortHeader label="ที่นั่ง" k="seats" current={sortKey} dir={sortDir} onClick={handleSort} align="right" />
      </div>

      {/* Mobile sort chips */}
      <div className="sm:hidden flex items-center gap-1.5 border-b border-gray-100 bg-gray-50/60 px-3 py-2 text-[11px]">
        <span className="text-gray-400 mr-1">เรียงตาม:</span>
        <SortHeader label="ต่ำสุด" k="minScore" current={sortKey} dir={sortDir} onClick={handleSort} />
        <SortHeader label="ที่นั่ง" k="seats" current={sortKey} dir={sortDir} onClick={handleSort} />
        <SortHeader label="ชื่อ" k="shortName" current={sortKey} dir={sortDir} onClick={handleSort} />
      </div>

      {/* Rows */}
      <ul className="divide-y divide-gray-50">
        {sorted.map((e, i) => {
          const trendKey = quickTrend(e.scores)
          const trend    = trendConfig[trendKey]
          const min      = e.latestMinScore
          // 0..1 normalized position used to draw the mini-bar.
          const fillPct  = min != null ? Math.max(0, Math.min(1, (min - minScale) / rangeSpan)) : 0
          const accent   = paletteColor(i)
          return (
            <li key={e.facultyId}>
              <Link
                href={`/scores/${e.university.slug}/${e.facultyId}`}
                className="group block hover:bg-green-50/40 transition-colors"
              >
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[2rem_1fr_8rem_4.5rem_4.5rem_4.5rem_4rem] items-center gap-3 px-4 py-3">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white tabular-nums"
                    style={{ background: accent }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700">
                      {e.university.shortName}
                      <ExternalLink className="ml-1 inline-block h-3 w-3 -translate-y-0.5 opacity-0 transition-opacity group-hover:opacity-50" />
                    </p>
                    {e.detail && (
                      <p className="text-[11px] text-gray-400 truncate">{e.detail}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 truncate">{e.university.location}</span>
                  <div className="relative text-right">
                    <span className="text-sm font-bold tabular-nums text-gray-900">
                      {min != null ? min.toFixed(1) : "–"}
                    </span>
                    {/* Mini scale bar — width = position within range */}
                    {min != null && (
                      <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${fillPct * 100}%`, background: accent }}
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-right text-sm tabular-nums text-gray-700">
                    {e.latestAvgScore != null ? e.latestAvgScore.toFixed(1) : "–"}
                  </span>
                  <span className="text-right text-sm tabular-nums text-gray-700">
                    {e.latestMaxScore != null ? e.latestMaxScore.toFixed(1) : "–"}
                  </span>
                  <span className="text-right text-sm tabular-nums text-gray-700 inline-flex items-center justify-end gap-1">
                    <Users className="h-3 w-3 text-gray-300" />
                    {e.latestSeats ?? "–"}
                  </span>
                </div>

                {/* Mobile card */}
                <div className="sm:hidden flex items-start gap-3 px-3 py-3">
                  <span
                    className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white tabular-nums"
                    style={{ background: accent }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700">
                      {e.university.shortName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {e.university.location}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {e.latestSeats ?? "–"}
                      </span>
                      <span className={cn("inline-flex items-center gap-0.5", trend.color)}>
                        <trend.icon className="h-3 w-3" />
                        {trend.label}
                      </span>
                    </div>
                    {min != null && (
                      <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${fillPct * 100}%`, background: accent }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-base font-bold tabular-nums text-gray-900">
                      {min != null ? min.toFixed(1) : "–"}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-none mt-0.5">คะแนนต่ำสุด</p>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
