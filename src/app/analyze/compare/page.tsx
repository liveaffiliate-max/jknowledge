import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import Header from "@/components/layout/header"
import { CompareClient } from "@/features/compare/components/compare-client"
import { getUniversities, getLatestTcasYear } from "@/server/queries"
import { GitCompareArrows, ArrowLeft } from "lucide-react"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "เปรียบเทียบคณะและมหาวิทยาลัย — Jknowledge",
  description: "เลือก 2-4 คณะ กรอกคะแนนครั้งเดียว เห็นโอกาสรับเทียบกันในตารางเดียว",
}

export default async function ComparePage() {
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
          <div className="mx-auto max-w-5xl px-4 py-8">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-2"
            >
              <ArrowLeft className="h-3 w-3" />
              กลับไปวิเคราะห์คณะเดียว
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <GitCompareArrows className="h-6 w-6 text-green-600 flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                เปรียบเทียบคณะและมหาวิทยาลัย
              </h1>
              {latestYear && (
                <span className="flex-shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 border border-green-100">
                  TCAS{latestYear - 2500}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm ml-9">
              เลือกคณะ 2-4 อัน กรอกคะแนนครั้งเดียว เห็นโอกาสรับเทียบกันในตารางเดียว
            </p>
          </div>
        </div>

        {/* Compare flow */}
        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* useSearchParams inside CompareClient → wrap in Suspense per App Router rules */}
          <Suspense fallback={null}>
            <CompareClient
              universities={universities}
              filterYear={latestYear ?? undefined}
            />
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>© 2026 Jknowledge · ข้อมูลทั้งหมดเป็นอ้างอิงจากเว็บไซต์ mytcas · เป็นเพียงการประมาณการ ไม่ใช่ผลลัพธ์ที่รับประกันการสอบติด</p>
      </footer>
    </div>
  )
}
