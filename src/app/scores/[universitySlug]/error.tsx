"use client"

import { ErrorPage } from "@/components/ui/error-page"

export default function UniversityError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorPage title="โหลดข้อมูลคณะไม่สำเร็จ" reset={reset} />
}
