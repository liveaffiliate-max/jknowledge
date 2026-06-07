"use client"

import { Share2 } from "lucide-react"
import { useToast } from "@/components/ui/toaster"
import type { AdmissionResult } from "@/types/tcas"
import { CHANCE_CONFIG } from "@/utils/analyze"

interface Props {
  result: AdmissionResult
}

export function ShareResultButton({ result }: Props) {
  const { toast } = useToast()
  const { faculty, userScore, chance, gap } = result

  function handleShare() {
    if (typeof window === "undefined") return
    const url = `${window.location.origin}/scores/${faculty.university.slug}/${faculty.id}`
    const chanceLabel = CHANCE_CONFIG[chance].label
    const gapStr = gap >= 0 ? `+${gap.toFixed(1)}` : gap.toFixed(1)
    const title = `${chanceLabel} เข้า${faculty.name} ${faculty.university.shortName}`
    const text  = `คะแนน ${userScore.toFixed(1)} (${gapStr} จากเกณฑ์) — เช็กโอกาสติด TCAS ของคุณที่ Jknowledge`

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => fallback(url))
    } else {
      fallback(url)
    }
  }

  function fallback(url: string) {
    navigator.clipboard?.writeText(url)
      .then(() => toast("คัดลอกลิงก์แล้ว"))
      .catch(() => toast("คัดลอกไม่สำเร็จ", "error"))
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
    >
      <Share2 className="h-4 w-4" />
      แชร์ผลลัพธ์
    </button>
  )
}
