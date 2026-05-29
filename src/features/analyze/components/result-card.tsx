import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { chanceColor, chanceLabel } from "@/utils/analyze"
import { ScoreTrendChart } from "./score-trend-chart"
import { ScorePositionBar } from "./score-position-bar"
import type { AdmissionResult } from "@/types/tcas"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Users,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"

interface ResultCardProps {
  result: AdmissionResult
}

const trendConfig: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  rising: { icon: TrendingUp, label: "แนวโน้มคะแนนเพิ่มขึ้น", color: "text-red-500" },
  falling: { icon: TrendingDown, label: "แนวโน้มคะแนนลดลง", color: "text-green-600" },
  stable: { icon: Minus, label: "คะแนนคงที่", color: "text-gray-500" },
}

const chanceIconConfig: Record<AdmissionResult["chance"], { icon: LucideIcon; color: string }> = {
  high: { icon: CheckCircle2, color: "text-green-500" },
  competitive: { icon: AlertCircle, color: "text-yellow-500" },
  low: { icon: XCircle, color: "text-red-500" },
}

export function ResultCard({ result }: ResultCardProps) {
  const { faculty, userScore, chance, gap, latestMinScore, latestAvgScore, trend } = result
  const color = chanceColor(chance)
  const trendInfo = trendConfig[trend]
  const chanceIconInfo = chanceIconConfig[chance]

  return (
    <Card className={cn("border-2", color.border)}>
      {/* ── Header: chance + faculty name ── */}
      <CardHeader className="border-b border-border/30 pb-4">
        <div className="flex items-center gap-2">
          <chanceIconInfo.icon className={cn("h-6 w-6", chanceIconInfo.color)} />
          <span className={cn("text-xl font-bold", color.text)}>
            {chanceLabel(chance)}
          </span>
        </div>
        <CardTitle className="mt-1 text-gray-900 text-base leading-snug">
          {faculty.university.shortName} · {faculty.name}
        </CardTitle>
        <p className="text-xs text-gray-500">{faculty.program}</p>
      </CardHeader>

      <CardContent className="mt-4 space-y-6">
        {/* ── Score summary row ── */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={cn("rounded-xl p-3", color.bg)}>
            <p className="text-[10px] text-gray-500 mb-0.5">คะแนนคุณ</p>
            <p className={cn("text-2xl font-bold", color.text)}>{userScore.toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] text-gray-500 mb-0.5">ต่ำสุด</p>
            <p className="text-2xl font-bold text-gray-700">{latestMinScore.toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] text-gray-500 mb-0.5">เฉลี่ย</p>
            <p className="text-2xl font-bold text-gray-700">{latestAvgScore.toFixed(1)}</p>
          </div>
        </div>

        {/* ── Gap badge ── */}
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-gray-50 px-4 py-2.5">
          <span className="text-sm text-gray-600">ห่างจากคะแนนต่ำสุด</span>
          <span className={cn("text-lg font-bold", gap >= 0 ? "text-green-600" : "text-red-500")}>
            {gap >= 0 ? "+" : ""}{gap.toFixed(1)} คะแนน
          </span>
        </div>

        {/* ── Score Position Bar ── */}
        <ScorePositionBar
          userScore={userScore}
          minScore={latestMinScore}
          avgScore={latestAvgScore}
          chance={chance}
        />

        {/* ── Trend Chart ── */}
        <div className="rounded-xl border border-border/50 bg-gray-50 p-4">
          <ScoreTrendChart scores={faculty.scores} userScore={userScore} />
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <trendInfo.icon className={cn("h-4 w-4", trendInfo.color)} />
            <span className={trendInfo.color}>{trendInfo.label}</span>
          </div>
        </div>

        {/* ── Seats info ── */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Users className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            จำนวนที่นั่งปีล่าสุด:{" "}
            <strong className="text-gray-700">
              {faculty.scores.sort((a, b) => b.year - a.year)[0]?.seats ?? "–"} ที่นั่ง
            </strong>
          </span>
        </div>

        {/* ── Disclaimer ── */}
        <p className="flex items-center gap-1.5 text-xs text-gray-400 border-t border-border/30 pt-3">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          ผลนี้เป็นการประมาณการจากข้อมูลย้อนหลัง ไม่รับประกันการรับเข้า
        </p>
      </CardContent>
    </Card>
  )
}
