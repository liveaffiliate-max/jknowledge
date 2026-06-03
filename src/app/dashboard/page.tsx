import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header"
import { getDashboardHistory } from "@/server/queries"
import { BarChart2, Clock, TrendingUp, TrendingDown, ChevronRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — Jknowledge",
}

const CHANCE_CONFIG = {
  high:        { label: "โอกาสสูง",    color: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  competitive: { label: "แข่งขันได้",  color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  low:         { label: "ยากขึ้น",     color: "bg-red-100 text-red-700",      dot: "bg-red-500"    },
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
    hour:  "2-digit",
    minute:"2-digit",
  }).format(date)
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const [user, history] = await Promise.all([
    currentUser(),
    getDashboardHistory(clerkId),
  ])

  const firstName = user?.firstName ?? "คุณ"

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900">
            สวัสดี, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            ประวัติการวิเคราะห์คะแนน TCAS ของคุณ
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "วิเคราะห์แล้ว", value: history.length, icon: BarChart2, color: "text-green-600" },
            {
              label: "โอกาสสูง",
              value: history.filter(h => h.chance === "high").length,
              icon: TrendingUp,
              color: "text-green-600",
            },
            {
              label: "ยากขึ้น",
              value: history.filter(h => h.chance === "low").length,
              icon: TrendingDown,
              color: "text-red-500",
            },
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
              ประวัติล่าสุด
            </h2>
            <Link
              href="/analyze"
              className="text-xs text-green-600 font-medium hover:underline"
            >
              + วิเคราะห์ใหม่
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
              <BarChart2 className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">ยังไม่มีประวัติการวิเคราะห์</p>
              <p className="text-xs text-gray-400 mt-1">เริ่มวิเคราะห์คะแนนเพื่อดูโอกาสรับ</p>
              <Link
                href="/analyze"
                className="mt-4 inline-block rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                เริ่มวิเคราะห์
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((item) => {
                const cfg = CHANCE_CONFIG[item.chance]
                const absGap = Math.abs(item.gap).toFixed(2)
                const gapLabel = item.gap >= 0
                  ? `+${absGap} เหนือเกณฑ์`
                  : `${absGap} ต่ำกว่าเกณฑ์`

                return (
                  <Link
                    key={item.id}
                    href={`/scores/${item.faculty.university.slug}/${item.faculty.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-4 hover:border-green-200 hover:shadow-sm transition-all group"
                  >
                    {/* Color dot */}
                    <div
                      className="h-10 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.faculty.university.color }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.faculty.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {item.faculty.university.name}
                        {item.faculty.majorName && ` · ${item.faculty.majorName}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          คะแนน {item.userScore.toFixed(2)} · {gapLabel}
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                      <ChevronRight className="h-4 w-4 text-gray-300 mt-1 ml-auto group-hover:text-green-400 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
