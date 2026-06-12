import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CHANCE_CONFIG } from "@/utils/analyze"
import { ScoreTrendChartLazy as ScoreTrendChart } from "./score-trend-chart-lazy"
import { ScorePositionBar } from "./score-position-bar"
import { ShareResultButton } from "./share-result-button"
import { MBTIMatchBadge } from "./mbti-match-badge"
import { getCanonicalMajorKey, majorSlugFromKey } from "@/lib/major-canonical"
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
  GitCompareArrows,
  Building2,
  type LucideIcon,
} from "lucide-react"

interface ResultCardProps {
  result: AdmissionResult
  onReset?: () => void
}

const trendConfig: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  rising: { icon: TrendingUp, label: "คะแนนต่ำสุดสูงขึ้น · แข่งขันยากขึ้น", color: "text-red-500" },
  falling: { icon: TrendingDown, label: "คะแนนต่ำสุดลดลง · แข่งขันง่ายขึ้น", color: "text-green-600" },
  stable: { icon: Minus, label: "คะแนนต่ำสุดคงที่ · แนวโน้มเสถียร", color: "text-gray-500" },
}

const chanceIconConfig: Record<AdmissionResult["chance"], { icon: LucideIcon; color: string }> = {
  high:        { icon: CheckCircle2, color: "text-green-500" },
  competitive: { icon: AlertCircle,  color: "text-yellow-500" },
  low:         { icon: XCircle,      color: "text-red-500" },
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const { faculty, userScore, chance, gap, latestMinScore, latestAvgScore, trend } = result
  const color        = CHANCE_CONFIG[chance]
  const trendInfo    = trendConfig[trend]
  const chanceIconInfo = chanceIconConfig[chance]

  return (
    <Card className={cn("border-2", color.border)}>
      {/* ── Header: chance + faculty name ── */}
      <CardHeader className="border-b border-border/30 pb-4">
        <div className="flex items-center gap-2">
          <chanceIconInfo.icon className={cn("h-6 w-6", chanceIconInfo.color)} />
          <span className={cn("text-xl font-bold", color.text)}>
            {color.label}
          </span>
        </div>
        <CardTitle className="mt-1 text-gray-900 text-base leading-snug break-words">
          {faculty.university.shortName} · {faculty.name}
        </CardTitle>
        <p className="text-xs text-gray-500">{faculty.program}</p>
      </CardHeader>

      <CardContent className="mt-4 space-y-6">
        {/* ── MBTI personality match badge (signed-in only) ── */}
        <MBTIMatchBadge facultyId={faculty.id} />

        {/* ── Score summary row ── */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={cn("rounded-xl p-3", color.bg)}>
            <p className="text-xs text-gray-500 mb-0.5">คะแนนคุณ</p>
            <p className={cn("text-lg font-bold tabular-nums sm:text-2xl", color.text)}>{userScore.toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-0.5">ต่ำสุดของคณะ</p>
            <p className="text-lg font-bold tabular-nums sm:text-2xl text-gray-700">{latestMinScore.toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-0.5">เฉลี่ยของคณะ</p>
            <p className="text-lg font-bold tabular-nums sm:text-2xl text-gray-700">{latestAvgScore.toFixed(1)}</p>
          </div>
        </div>

        {/* ── Gap badge ── */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-border/50 bg-gray-50 px-4 py-2.5">
          <span className="text-sm text-gray-600">ห่างจากคะแนนต่ำสุด</span>
          <span className={cn("text-base font-bold tabular-nums sm:text-lg", gap >= 0 ? "text-green-600" : "text-red-500")}>
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

        {/* ── Share ── */}
        <ShareResultButton result={result} />

        {/* ── Compare with other faculties (seeds compare page with this faculty) ── */}
        <Link
          href={`/analyze/compare?ids=${faculty.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-white py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
        >
          <GitCompareArrows className="h-4 w-4" />
          เปรียบเทียบกับคณะอื่น
        </Link>

        {/* ── See this faculty at other universities ── */}
        <Link
          href={`/analyze/compare/major/${majorSlugFromKey(getCanonicalMajorKey({
            name:      faculty.name,
            majorName: faculty.majorName,
          }))}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700"
        >
          <Building2 className="h-4 w-4" />
          ดูคณะนี้ที่มหาลัยอื่น
        </Link>

        {/* ── Reset CTA ── */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700"
          >
            ลองวิเคราะห์คณะอื่น →
          </button>
        )}
      </CardContent>
    </Card>
  )
}
