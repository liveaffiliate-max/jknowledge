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
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-16">
          <MBTIQuiz />
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-500">
        © 2026 Jknowledge · แบบทดสอบ MBTI อ้างอิงจากทฤษฎีของ Myers-Briggs Type Indicator
      </footer>
    </div>
  )
}
