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
          <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex items-center gap-3 mb-1">
              <Brain className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <h1 className="text-2xl font-bold text-gray-900">ค้นหาบุคลิกภาพ MBTI</h1>
            </div>
            <p className="text-gray-500 text-sm ml-9">
              ตอบ 20 คำถามสั้น ๆ เพื่อค้นพบ 1 ใน 16 บุคลิกภาพของคุณ พร้อมคำแนะนำคณะที่เหมาะสม
            </p>
            <div className="flex flex-wrap gap-2 mt-3 ml-9">
              {["16 ประเภทบุคลิกภาพ",  "ใช้เวลา ~3 นาที", "แชร์ได้"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz */}
        <div className="mx-auto max-w-4xl px-4 py-8">
          <MBTIQuiz />
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        © 2026 Jknowledge · แบบทดสอบ MBTI อ้างอิงจากทฤษฎีของ Myers-Briggs Type Indicator
      </footer>
    </div>
  )
}
