"use client"

import { ErrorPage } from "@/components/ui/error-page"

export default function MBTIError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorPage title="โหลดหน้า MBTI ไม่สำเร็จ" reset={reset} />
}
