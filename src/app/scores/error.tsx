"use client"

import { ErrorPage } from "@/components/ui/error-page"

export default function ScoresError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorPage title="โหลดข้อมูลมหาวิทยาลัยไม่สำเร็จ" reset={reset} />
}
