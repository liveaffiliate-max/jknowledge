import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { AnalyzeForm } from "@/features/analyze/components/analyze-form"
import { getUniversities, getLatestTcasYear } from "@/server/queries"
import { BarChart2 } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "วิเคราะห์คะแนน TCAS — Jknowledge",
  description: "กรอกคะแนนและเลือกคณะเพื่อดูโอกาสรับ เปรียบเทียบกับข้อมูลย้อนหลัง 5 ปี",
}

export default async function AnalyzePage() {
  const [universities, latestYear] = await Promise.all([
    getUniversities(),
    getLatestTcasYear(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-3 min-w-0">
                <BarChart2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">วิเคราะห์คะแนน TCAS</h1>
              </div>
              {latestYear && (
                <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  TCAS{latestYear - 2500}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm ml-9">
              เปรียบเทียบคะแนนของคุณกับข้อมูลย้อนหลัง 5 ปี เพื่อประเมินโอกาสรับ
            </p>
            <p className="text-xs text-gray-400 mt-3 ml-9">
              ข้อมูลจาก mytcas · ผลเป็นการประมาณการ ไม่ใช่ผลรับรองการเข้าศึกษา
            </p>
          </div>
        </div>

        {/* Form + Result */}
        <div className="mx-auto max-w-4xl px-4 py-8">
          <AnalyzeForm universities={universities} filterYear={latestYear ?? undefined} />
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        © 2026 Jknowledge · ข้อมูลทั้งหมดเป็นการประมาณการ ไม่ใช่ผลลัพธ์ที่รับประกัน
      </footer>
    </div>
  )
}
