import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header"
import { getDashboardHistory } from "@/server/queries"
import { DashboardList } from "./_components/dashboard-list"
import { BarChart2, Clock, TrendingUp, TrendingDown } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — Jknowledge",
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const [user, history] = await Promise.all([
    currentUser(),
    getDashboardHistory(clerkId),
  ])

  const firstName = user?.firstName ?? "คุณ"
  const highChance = history.filter((h) => h.chance === "high").length
  const lowChance  = history.filter((h) => h.chance === "low").length

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900">สวัสดี, {firstName} 👋</h1>
          <p className="mt-0.5 text-sm text-gray-500">ประวัติการวิเคราะห์คะแนน TCAS ของคุณ</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
