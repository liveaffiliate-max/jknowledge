"use client"

import { TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import type { YearlyScore } from "@/types/tcas"

interface ScoreTrendChartProps {
  scores: YearlyScore[]
  userScore: number
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
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-gray-700 mb-1">ปี {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value.toFixed(1)}</span>
        </p>
      ))}
    </div>
  )
}

export function ScoreTrendChart({ scores, userScore }: ScoreTrendChartProps) {
  if (scores.length < 2) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
        <p className="text-sm text-gray-400">ข้อมูลไม่เพียงพอสำหรับแสดงกราฟแนวโน้ม</p>
      </div>
    )
  }

  const data = [...scores]
    .sort((a, b) => a.year - b.year)
    .map((s) => ({
      year: s.year,
      "คะแนนต่ำสุด": s.minScore,
      "คะแนนเฉลี่ย": s.avgScore,
    }))

  const allScores = scores.flatMap((s) => [s.minScore, s.avgScore])
  const minY = Math.max(0, Math.floor(Math.min(...allScores, userScore) - 3))
  const maxY = Math.min(100, Math.ceil(Math.max(...allScores, userScore) + 3))

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <TrendingUp className="h-4 w-4" />
        แนวโน้มคะแนน 5 ปี
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            iconType="circle"
            iconSize={8}
          />

          {/* User score reference line */}
          <ReferenceLine
            y={userScore}
            stroke="#16a34a"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: `คุณ ${userScore.toFixed(1)}`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "#16a34a",
            }}
          />

          <Line
            type="monotone"
            dataKey="คะแนนต่ำสุด"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3, fill: "#ef4444" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="คะแนนเฉลี่ย"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: "#f59e0b" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
