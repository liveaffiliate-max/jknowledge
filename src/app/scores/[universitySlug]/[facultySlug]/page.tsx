import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/layout/header"
import { ScoreTable } from "@/features/scores/components/score-table"
import { ScoreHistoryChartLazy as ScoreHistoryChart } from "@/features/scores/components/score-history-chart-lazy"
import { FIELD_COLORS, FIELD_LABELS } from "@/features/scores/lib/field-labels"
import { getFacultyWithScores } from "@/server/queries"
import { cn } from "@/lib/utils"
import { calculateTrend } from "@/utils/analyze"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { TrendingUp, TrendingDown, Minus, MapPin, ClipboardList, AlertTriangle, type LucideIcon } from "lucide-react"

// NOTE: [facultySlug] segment carries the faculty's cuid (ID), not the slug string.
// University slug is now English (SEO-friendly) so no decodeURIComponent needed.

interface Props {
  params: Promise<{ universitySlug: string; facultySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { facultySlug: facultyId } = await params
  const f = await getFacultyWithScores(facultyId)
  if (!f) return {}
  const title = [f.name, f.program, f.majorName].filter(Boolean).join(" · ")
  return {
    title: `${title} — ${f.university.shortName} | Jknowledge`,
    description: `คะแนนตัดสิทธิ์ TCAS ย้อนหลัง ${title} ${f.university.name} พร้อมกราฟแนวโน้ม`,
  }
}

export const dynamic = "force-dynamic"

export default async function FacultyScorePage({ params }: Props) {
  const { universitySlug, facultySlug: facultyId } = await params

  // Query by faculty ID — reliable, avoids URL encoding issues with Thai slugs
  const faculty = await getFacultyWithScores(facultyId)
  if (!faculty) notFound()

  // Extra safety: ensure the faculty belongs to the university in the URL
  const { university: uni, scores } = faculty
  if (uni.slug !== universitySlug) notFound()

  const sorted = [...scores].sort((a, b) => b.year - a.year)
  const latest = sorted[0]
  const trend = calculateTrend(scores)

  const displayName = [faculty.name, faculty.program, faculty.majorName, faculty.detail]
    .filter(Boolean)
    .join(" · ")

  const fieldColor = FIELD_COLORS[faculty.field] ?? FIELD_COLORS.other
  const fieldLabel = FIELD_LABELS[faculty.field] ?? "อื่นๆ"

  const trendConfig: Record<string, { icon: LucideIcon; label: string; color: string }> = {
    rising:  { icon: TrendingUp,   label: "คะแนนต่ำสุดสูงขึ้น · แข่งขันยากขึ้น", color: "text-red-500" },
    falling: { icon: TrendingDown, label: "คะแนนต่ำสุดลดลง · แข่งขันง่ายขึ้น",   color: "text-green-600" },
    stable:  { icon: Minus,        label: "คะแนนต่ำสุดคงที่ · แนวโน้มเสถียร",     color: "text-gray-500" },
  }
  const trendInfo = trendConfig[trend]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Header banner */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-4">
              <Breadcrumb items={[
                { label: "คะแนนย้อนหลัง", href: "/scores" },
                { label: uni.shortName, href: `/scores/${uni.slug}` },
                { label: faculty.name },
              ]} />
            </div>

            {/* Faculty title */}
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold flex-shrink-0",
                  fieldColor
                )}
              >
                {fieldLabel}
              </span>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-snug break-words">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-gray-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: uni.color }}
                  />
                  <span className="break-words">{uni.name}</span>
                  <span className="text-gray-300">·</span>
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{uni.location}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          {/* Latest year stats */}
          {latest && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-gray-700">
                  ผลล่าสุด — TCAS{latest.year - 2500}
                </h2>
                <span className="rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  ล่าสุด
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard
                  label="คะแนนต่ำสุด"
                  value={latest.minScore.toFixed(2)}
                  sub="ปีล่าสุด"
                  accent="text-red-600"
                  bg="bg-red-50"
                />
                <StatCard
                  label="คะแนนเฉลี่ย"
                  value={latest.avgScore.toFixed(2)}
                  sub="ปีล่าสุด"
                  accent="text-amber-600"
                  bg="bg-amber-50"
                />
                <StatCard
                  label="คะแนนสูงสุด"
                  value={latest.maxScore !== undefined ? latest.maxScore.toFixed(2) : "—"}
                  sub="ปีล่าสุด"
                  accent="text-blue-600"
                  bg="bg-blue-50"
                />
                <StatCard
                  label="จำนวนที่นั่ง"
                  value={latest.seats !== undefined ? String(latest.seats) : "—"}
                  sub="ที่นั่ง"
                  accent="text-purple-600"
                  bg="bg-purple-50"
                />
                <StatCard
                  label="ข้อมูลย้อนหลัง"
                  value={String(scores.length)}
                  sub="ปี"
                  accent="text-green-600"
                  bg="bg-green-50"
                />
              </div>
            </div>
          )}

          {/* Chart */}
          {scores.length >= 2 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <TrendingUp className="h-4 w-4" />
                  กราฟแนวโน้มคะแนน
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <trendInfo.icon className={cn("h-4 w-4", trendInfo.color)} />
                  <span className={cn("text-xs font-medium", trendInfo.color)}>
                    {trendInfo.label}
                  </span>
                </div>
              </div>
              <ScoreHistoryChart scores={scores} />
            </div>
          )}

          {/* Score table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-1.5 mb-4 text-sm font-semibold text-gray-700">
              <ClipboardList className="h-4 w-4" />
              คะแนนย้อนหลังทุกปี
            </div>
            <ScoreTable scores={scores} />
          </div>

          {/* CTA — analyze */}
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-green-900">
                อยากรู้โอกาสรับของคุณ?
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                กรอกคะแนนเพื่อวิเคราะห์โอกาสรับเทียบกับข้อมูลย้อนหลัง
              </p>
            </div>
            <Link
              href="/analyze"
              className="flex-shrink-0 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              วิเคราะห์คะแนน →
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-center text-gray-400 pb-4">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            ข้อมูลจาก mytcas · เป็นการประมาณการ ไม่รับประกันความถูกต้อง
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        © 2026 Jknowledge · ข้อมูลจาก mytcas · เป็นการประมาณการ ไม่รับประกันความถูกต้อง
      </footer>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
  bg,
}: {
  label: string
  value: string
  sub: string
  accent: string
  bg: string
}) {
  return (
    <div className={cn("rounded-xl p-4", bg)}>
      <p className="text-xs text-gray-500 mb-1 leading-tight">{label}</p>
      <p className={cn("text-xl font-bold leading-none tabular-nums", accent)}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-1 leading-tight">{sub}</p>
    </div>
  )
}
