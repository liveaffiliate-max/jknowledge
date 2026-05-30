"use client"

import { ErrorPage } from "@/components/ui/error-page"

export default function AnalyzeError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorPage title="โหลดหน้าวิเคราะห์ไม่สำเร็จ" reset={reset} />
}
