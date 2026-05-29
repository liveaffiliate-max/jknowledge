import { cn } from "@/lib/utils"
import type { AdmissionChance } from "@/types/tcas"
import { MapPin } from "lucide-react"

interface ScorePositionBarProps {
  userScore: number
  minScore: number
  avgScore: number
  chance: AdmissionChance
}

export function ScorePositionBar({
  userScore,
  minScore,
  avgScore,
  chance,
}: ScorePositionBarProps) {
  // แสดงในช่วง minScore-5 ถึง avgScore+5 เพื่อให้เห็นชัด
  const rangeMin = Math.max(0, minScore - 8)
  const rangeMax = Math.min(100, avgScore + 8)
  const range = rangeMax - rangeMin

  const toPercent = (val: number) =>
    Math.min(100, Math.max(0, ((val - rangeMin) / range) * 100))

  const userPct = toPercent(userScore)
  const minPct = toPercent(minScore)
  const avgPct = toPercent(avgScore)

  const barColor: Record<AdmissionChance, string> = {
    high: "bg-green-500",
    competitive: "bg-yellow-400",
    low: "bg-red-400",
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <MapPin className="h-4 w-4" />
        ตำแหน่งคะแนนของคุณ
      </div>

      {/* Bar */}
      <div className="relative h-6 w-full rounded-full bg-gray-100 overflow-visible">
        {/* Zone: low (0 → minScore) */}
        <div
          className="absolute top-0 left-0 h-full rounded-l-full bg-red-100"
          style={{ width: `${minPct}%` }}
        />
        {/* Zone: competitive (minScore → avgScore) */}
        <div
          className="absolute top-0 h-full bg-yellow-100"
          style={{ left: `${minPct}%`, width: `${avgPct - minPct}%` }}
        />
        {/* Zone: high (avgScore →) */}
        <div
          className="absolute top-0 right-0 h-full rounded-r-full bg-green-100"
          style={{ left: `${avgPct}%` }}
        />

        {/* minScore marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-red-400"
          style={{ left: `${minPct}%` }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-500">
            min {minScore.toFixed(0)}
          </span>
        </div>

        {/* avgScore marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-yellow-500"
          style={{ left: `${avgPct}%` }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-yellow-600">
            avg {avgScore.toFixed(0)}
          </span>
        </div>

        {/* User score dot */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md z-10",
            barColor[chance]
          )}
          style={{ left: `${userPct}%` }}
        >
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-gray-700">
            {userScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-300" />
          โอกาสน้อย
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-yellow-300" />
          แข่งขันได้
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-300" />
          โอกาสสูง
        </span>
      </div>
    </div>
  )
}
