import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header"
import { getDashboardHistory } from "@/server/queries"
import { getLatestMBTIResultForClerkUser, getMBTIProfileByType, getTopFacultiesForType } from "@/server/mbti-queries"
import { DashboardList } from "./_components/dashboard-list"
import { BarChart2, Clock, TrendingUp, TrendingDown, Sparkles, Brain, ArrowRight, Crosshair } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — Jknowledge",
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const [user, history, latestMBTI] = await Promise.all([
    currentUser(),
    getDashboardHistory(clerkId),
    getLatestMBTIResultForClerkUser(clerkId),
  ])

  // Lazily fetch MBTI profile + recommended faculties only if user has taken the quiz.
  // Parallel because both depend on mbtiType.
  const [mbtiProfile, mbtiTopFaculties] = latestMBTI
    ? await Promise.all([
        getMBTIProfileByType(latestMBTI.mbtiType),
        getTopFacultiesForType(latestMBTI.mbtiType, 4),
      ])
    : [null, [] as Awaited<ReturnType<typeof getTopFacultiesForType>>]

  // Cross-reference: faculties this user has analyzed that match their MBTI top list
  const analyzedFacultyIds = new Set(history.map((h) => h.faculty.id))
  const mbtiMatchedAnalyses = mbtiTopFaculties.filter((m) =>
    analyzedFacultyIds.has(m.faculty.id)
  )

  const firstName = user?.firstName ?? "คุณ"
  const highChance = history.filter((h) => h.chance === "high").length
  const lowChance  = history.filter((h) => h.chance === "low").length

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            สวัสดี, {firstName}
            <Sparkles className="h-5 w-5 text-green-500" aria-hidden />
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">ประวัติการวิเคราะห์คะแนน TCAS ของคุณ</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ── MBTI hero — only when user has taken quiz ── */}
        {latestMBTI && mbtiProfile && (
          <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50/70 to-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-700/80">
                  <Brain className="h-3.5 w-3.5" />
                  บุคลิกของคุณ
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={cn("text-3xl font-black tracking-wide", mbtiProfile.color)}>
                    {mbtiProfile.type}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    &ldquo;{mbtiProfile.nickname}&rdquo;
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{mbtiProfile.tagline}</p>
              </div>
              <Link
                href={`/mbti/${latestMBTI.mbtiType}`}
                className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
              >
                ดูทั้งหมด <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Cross-feature summary */}
            {history.length > 0 && (
              <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-green-100 bg-white px-3 py-2 text-xs">
                <Crosshair className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span className="text-gray-600">
                  คุณวิเคราะห์คะแนนสำหรับคณะที่เหมาะกับ {latestMBTI.mbtiType} แล้ว{" "}
                  <strong className="text-green-700">
                    {mbtiMatchedAnalyses.length}/{mbtiTopFaculties.length}
                  </strong>{" "}
                  คณะแรก
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── No-MBTI CTA — encourage signed-in user to take the quiz ── */}
        {!latestMBTI && (
          <Link
            href="/mbti"
            className="group flex items-center justify-between rounded-2xl border border-dashed border-green-200 bg-green-50/40 px-5 py-4 motion-safe:transition-colors hover:bg-green-50"
          >
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-green-800">
                <Brain className="h-4 w-4" />
                ค้นหาบุคลิก MBTI ของคุณ
              </p>
              <p className="mt-0.5 text-xs text-green-700/80">
                ทำแบบทดสอบ ~3 นาที เพื่อรู้คณะที่เหมาะกับตัวคุณจริง ๆ
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-green-700 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "วิเคราะห์แล้ว", value: history.length, icon: BarChart2,   color: "text-green-600" },
            { label: "โอกาสสูง",     value: highChance,      icon: TrendingUp,   color: "text-green-600" },
            { label: "ยากขึ้น",      value: lowChance,       icon: TrendingDown, color: "text-red-500"   },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl bg-white border border-gray-100 p-4 text-center">
              <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── History list ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              ประวัติการวิเคราะห์
            </h2>
            <Link
              href="/analyze"
              className="text-xs text-green-600 font-medium hover:underline"
            >
              + วิเคราะห์ใหม่
            </Link>
          </div>

          <DashboardList items={history} />
        </div>
      </div>
    </main>
  )
}
