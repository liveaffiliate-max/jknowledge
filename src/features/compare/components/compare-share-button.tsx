"use client"

import { Share2 } from "lucide-react"
import { useToast } from "@/components/ui/toaster"
import { trackCompareShare } from "@/lib/analytics"

interface Props {
  facultyIds: string[]
}

export function CompareShareButton({ facultyIds }: Props) {
  const { toast } = useToast()

  function handleShare() {
    if (typeof window === "undefined") return
    const ids = facultyIds.filter(Boolean)
    if (ids.length < 2) {
      toast("เลือกคณะอย่างน้อย 2 คณะก่อนแชร์", "error")
      return
    }
    const url   = `${window.location.origin}/analyze/compare?ids=${ids.join(",")}`
    const title = `เปรียบเทียบ ${ids.length} คณะ — Jknowledge`
    const text  = `ลองเทียบดูสิว่าคณะไหนเอื้อมถึงที่สุด`

    if (navigator.share) {
      navigator.share({ title, text, url })
        .then(() => trackCompareShare({ slotCount: ids.length, method: "native" }))
        .catch(() => fallback(url, ids.length))
    } else {
      fallback(url, ids.length)
    }
  }

  function fallback(url: string, slotCount: number) {
    navigator.clipboard?.writeText(url)
      .then(() => {
        toast("คัดลอกลิงก์แล้ว")
        trackCompareShare({ slotCount, method: "copy" })
      })
      .catch(() => toast("คัดลอกไม่สำเร็จ", "error"))
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
    >
      <Share2 className="h-4 w-4" />
      แชร์ลิงก์เปรียบเทียบ
    </button>
  )
}
