"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { YearlyScore } from "@/types/tcas"

interface ScoreHistoryChartProps {
  scores: YearlyScore[]
}

interface TooltipPayload {
  color: string
  name: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-md text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">TCAS{(label ?? 0) - 2500}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}:{" "}
          <span className="font-bold">{(p.value as number).toFixed(2)}</span>
        </p>
      ))}
    </div>
  )
}

export function ScoreHistoryChart({ scores }: ScoreHistoryChartProps) {
  if (scores.length < 2) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-400">
            {scores.length === 0 ? "ยังไม่มีข้อมูลคะแนน" : "มีข้อมูลแค่ 1 ปี"}
          </p>
          <p className="text-xs text-gray-300">ต้องมีข้อมูลอย่างน้อย 2 ปีเพื่อแสดงกราฟ</p>
        </div>
      </div>
    )
  }

  const data = [...scores]
    .sort((a, b) => a.year - b.year)
    .map((s) => ({
      year: s.year,
      "คะแนนต่ำสุด": s.minScore,
      "คะแนนเฉลี่ย": s.avgScore,
      ...(s.maxScore !== undefined ? { "คะแนนสูงสุด": s.maxScore } : {}),
    }))

  const allValues = scores.flatMap((s) =>
    [s.minScore, s.avgScore, s.maxScore].filter((v): v is number => v !== undefined)
  )
  const minY = Math.max(0, Math.floor(Math.min(...allValues) - 2))
  const maxY = Math.min(100, Math.ceil(Math.max(...allValues) + 2))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="year"
          tickFormatter={(v) => `TCAS${v - 2500}`}
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
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="คะแนนต่ำสุด"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="คะแนนเฉลี่ย"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="คะแนนสูงสุด"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
