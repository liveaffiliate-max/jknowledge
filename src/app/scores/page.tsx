import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { UniversityGrid } from "@/features/scores/components/university-grid"
import { getUniversitiesWithStats } from "@/server/queries"
import { Landmark } from "lucide-react"

export const metadata: Metadata = {
  title: "คะแนน TCAS ย้อนหลัง — Jknowledge",
  description:
    "ข้อมูลคะแนนตัดสิทธิ์ TCAS ย้อนหลัง 6 ปี จากทุกมหาวิทยาลัยชั้นนำ เปรียบเทียบแนวโน้มคะแนน TCAS64–69",
}

export const dynamic = "force-dynamic"

export default async function ScoresPage() {
  const universities = await getUniversitiesWithStats()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="flex items-center gap-3 mb-2">
              <Landmark className="h-7 w-7 text-gray-600 flex-shrink-0" />
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                คะแนน TCAS ย้อนหลัง
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-10">
              ข้อมูลคะแนนตัดสิทธิ์ TCAS64–69 จาก{" "}
              <strong className="text-gray-700">{universities.length}</strong>{" "}
              มหาวิทยาลัย
            </p>
            <div className="mt-4 ml-12 flex flex-wrap gap-2">
              {[64, 65, 66, 67, 68, 69].map((y) => (
                <span
                  key={y}
                  className="rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
                >
                  TCAS{y}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Grid + Search */}
        <div className="mx-auto max-w-5xl px-4 py-8">
          <UniversityGrid universities={universities} />
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        © 2026 Jknowledge · ข้อมูลจาก mytcas · เป็นการประมาณการ ไม่รับประกันความถูกต้อง
      </footer>
    </div>
  )
}
