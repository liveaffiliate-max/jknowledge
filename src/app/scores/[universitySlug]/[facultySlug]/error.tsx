"use client"

import { ErrorPage } from "@/components/ui/error-page"

export default function FacultyScoreError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorPage title="โหลดข้อมูลคะแนนไม่สำเร็จ" reset={reset} />
}
