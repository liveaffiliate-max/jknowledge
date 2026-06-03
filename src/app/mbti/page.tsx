import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { MBTIQuiz } from "@/features/mbti/components/mbti-quiz"
import { Brain } from "lucide-react"

export const metadata: Metadata = {
  title: "ค้นหาบุคลิกภาพ MBTI — Jknowledge",
  description:
    "ทำแบบทดสอบ MBTI เพื่อค้นหาบุคลิกภาพของคุณ และรับคำแนะนำคณะที่เหมาะสมจาก 16 ประเภท",
}

export default function MBTIPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-green-600 flex-shrink-0" />
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">ค้นหาบุคลิกภาพ MBTI</h1>
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5 ml-8">
              {["16 บุคลิกภาพ", "~3 นาที", "แชร์ได้"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz */}
        <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8">
          <MBTIQuiz />
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-500">
        © 2026 Jknowledge · แบบทดสอบ MBTI อ้างอิงจากทฤษฎีของ Myers-Briggs Type Indicator
      </footer>
    </div>
  )
}
