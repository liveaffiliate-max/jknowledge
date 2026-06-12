"use client"

// ── MajorComparisonChart ─────────────────────────────────────────────────────
// Horizontal bar chart showing the latest minimum admission score for every
// university that offers a given major. Bars are pre-sorted ascending in the
// query (easiest → hardest); we keep that order so users skim top-down.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { BarChart3 } from "lucide-react"
import { paletteColor } from "@/lib/faculty-label"
import type { MajorComparisonEntry } from "@/server/queries"

interface Props {
  entries: MajorComparisonEntry[]
}

interface TooltipPayload {
  payload: {
    shortName:     string
    facultyName:   string
    location:      string
    seats:         number | null
    latestMin:     number
  }
  value: number
}

function CustomTooltip({
  active,
  payload,
}: {
  active?:  boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs min-w-[180px] space-y-0.5">
      <p className="font-semibold text-gray-800">{d.shortName}</p>
      <p className="text-gray-500 text-[11px]">{d.location}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-gray-500">คะแนนต่ำสุด</span>
        <span className="font-bold tabular-nums text-gray-800">{d.latestMin.toFixed(1)}</span>
      </div>
      {d.seats != null && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">ที่นั่ง</span>
          <span className="font-bold tabular-nums text-gray-800">{d.seats}</span>
        </div>
      )}
    </div>
  )
}

export function MajorComparisonChart({ entries }: Props) {
  // Only entries with a score can appear on the bar chart.
  const data = entries
    .filter((e) => e.latestMinScore != null)
    .map((e) => ({
      shortName:   e.university.shortName,
      facultyName: e.facultyName,
      location:    e.university.location,
      seats:       e.latestSeats,
      latestMin:   e.latestMinScore as number,
    }))

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-400">
        ไม่มีข้อมูลคะแนนเพียงพอสำหรับกราฟ
      </div>
    )
  }

  // Dynamic chart height: 36px per row + chrome
  const chartHeight = Math.max(180, data.length * 36 + 40)

  // Y range padded a few points for breathing room
  const min = Math.max(0, Math.floor(Math.min(...data.map((d) => d.latestMin)) - 3))
  const max = Math.min(100, Math.ceil(Math.max(...data.map((d) => d.latestMin)) + 3))

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        <BarChart3 className="h-4 w-4 text-green-600" />
        คะแนนต่ำสุด · เรียงจากเข้าง่ายสุด → ยากสุด
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            domain={[min, max]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            tick={{ fontSize: 12, fill: "#374151" }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar dataKey="latestMin" radius={[0, 6, 6, 0]} barSize={20}>
            {data.map((_, i) => (
              <Cell key={i} fill={paletteColor(i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
