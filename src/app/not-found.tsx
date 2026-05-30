"use client"

import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-gray-50">
      <div className="mx-auto max-w-sm">
        {/* Big 404 */}
        <p className="text-8xl font-black text-gray-200 mb-2">404</p>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          หน้านี้อาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
          <Link
            href="/scores"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Search className="h-4 w-4" />
            ค้นหาคะแนน
          </Link>
        </div>

        <button
          onClick={() => typeof window !== "undefined" && window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          ย้อนกลับ
        </button>
      </div>
    </div>
  )
}
