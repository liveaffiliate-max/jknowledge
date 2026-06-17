import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { AnalyzeSubNav } from "@/components/layout/analyze-sub-nav"
import { PopularMajorsSection } from "@/features/compare/components/popular-majors-section"
import { MyScoreCard } from "@/features/compare/components/my-score-card"
import { getPopularMajorSlugs } from "@/server/queries"
import { Building2 } from "lucide-react"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "คณะเดียวกัน หลายมหาวิทยาลัย — Jknowledge",
  description: "เลือกคณะที่สนใจ แล้วดูทุกมหาวิทยาลัยที่เปิดสอน เรียงจากคะแนนต่ำสุด — แพทย์ วิศวะ บริหาร นิติ และคณะอื่น ๆ",
}

export default async function MajorIndexPage() {
  // Show top 30 — enough for browsing without overwhelming the page
  const popularMajors = await getPopularMajorSlugs(3, 30)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AnalyzeSubNav />

      <main className="flex-1 bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="flex items-start gap-3">
              <Building2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  คณะเดียวกัน หลายมหาวิทยาลัย
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  อยากเรียนหมอ? วิศวะ? คลิกเลือกคณะที่สนใจ
                  เพื่อดูทุกมหาลัยที่เปิดสอน เรียงจากคะแนนต่ำสุดขึ้นไป
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular majors list */}
        <div className="mx-auto max-w-5xl space-y-5 px-4 py-8">
          {/* Score summary — collapsed by default. Chips with current entries
              when present; inviting empty state when not. */}
          <MyScoreCard />

          <PopularMajorsSection majors={popularMajors} />

          {/* Help note explaining how "same major" is determined */}
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">การจัดกลุ่ม "คณะเดียวกัน" ทำงานยังไง?</p>
            <p className="leading-relaxed">
              ระบบจับคู่จากชื่อคณะ + วิชาเอก/หลักสูตรที่ตรงกัน เพื่อให้คะแนนเปรียบเทียบกันได้จริง
              (ไม่ใช่แค่ชื่อคณะที่เหมือนแต่สาขาต่างกัน) คณะที่มีน้อยกว่า 3 มหาวิทยาลัย
              เปิดสอนจะไม่ปรากฏที่นี่
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>© 2026 Jknowledge · ข้อมูลทั้งหมดเป็นอ้างอิงจากเว็บไซต์ mytcas · เป็นเพียงการประมาณการ ไม่ใช่ผลลัพธ์ที่รับประกันการสอบติด</p>
      </footer>
    </div>
  )
}
