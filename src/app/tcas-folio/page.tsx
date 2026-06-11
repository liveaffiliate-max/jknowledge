import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { TcasFolioPlayer } from "@/features/tcas-folio/components/tcas-folio-player"
import { TCAS_FOLIO_PDF, TCAS_FOLIO_EPISODES } from "@/features/tcas-folio/data/content"
import { Briefcase } from "lucide-react"

export const metadata: Metadata = {
  title: "TCASfolio — คู่มือทำพอร์ตโฟลิโอ TCAS — Jknowledge",
  description: "คู่มือ PDF และวิดีโอสอนทำพอร์ตโฟลิโอสำหรับยื่น TCAS รอบ Portfolio ครบทุกขั้นตอน",
}

// The PDF lives on Vercel Blob; warm up DNS + TLS so the eventual range
// requests start ~150ms sooner when the user opens fullscreen.
const PDF_ORIGIN = "https://pztddn9vmk4bwwny.public.blob.vercel-storage.com"

export default function TcasFolioPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <link rel="preconnect" href={PDF_ORIGIN} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={PDF_ORIGIN} />
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-center gap-3 mb-1">
              <Briefcase className="h-6 w-6 text-green-600 flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">TCASfolio</h1>
            </div>
            <p className="text-gray-500 text-sm ml-9">
              คู่มือและวิดีโอสอนทำพอร์ตโฟลิโอ เตรียมพร้อมสำหรับยื่น TCAS รอบ Portfolio
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 py-8">
          <TcasFolioPlayer episodes={TCAS_FOLIO_EPISODES} pdf={TCAS_FOLIO_PDF} />
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>© 2026 Jknowledge · เนื้อหาเพื่อการศึกษา ใช้ประกอบการเตรียมพอร์ตโฟลิโอเท่านั้น</p>
      </footer>
    </div>
  )
}
