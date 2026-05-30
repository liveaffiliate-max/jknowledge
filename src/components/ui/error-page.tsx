"use client"

import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorPageProps {
  title?:   string
  message?: string
  reset?:   () => void
}

export function ErrorPage({
  title   = "เกิดข้อผิดพลาด",
  message = "ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
  reset,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-5">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-7">{message}</p>
      <div className="flex gap-3">
        {reset && (
          <Button
            onClick={reset}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่
          </Button>
        )}
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            กลับหน้าหลัก
          </Button>
        </Link>
      </div>
    </div>
  )
}
