"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Brain, Sparkles, ArrowRight } from "lucide-react"
import { getAnalyzeMBTIMatchAction, type AnalyzeMBTIMatchInfo } from "../actions/get-mbti-match"

interface Props {
  facultyId: string
}

/**
 * Shown inside /analyze ResultCard for signed-in users only.
 *
 * Three states:
 *   1. No MBTI taken yet      → soft CTA to /mbti
 *   2. MBTI taken, faculty matches type     → green "เหมาะกับบุคลิก ___ ของคุณ"
 *   3. MBTI taken, faculty not in top list  → muted "บุคลิก ___ — อาจไม่ใช่ทางหลักของคุณ"
 *
 * Renders nothing for anonymous users (Server Action returns null).
 */
export function MBTIMatchBadge({ facultyId }: Props) {
  const [data, setData] = useState<AnalyzeMBTIMatchInfo | null | "loading">("loading")

  useEffect(() => {
    let cancelled = false
    getAnalyzeMBTIMatchAction(facultyId)
      .then((r) => !cancelled && setData(r))
      .catch(() => !cancelled && setData(null))
    return () => { cancelled = true }
  }, [facultyId])

  // Anonymous — hide
  if (data === null) return null

  if (data === "loading") {
    return <div className="h-10 rounded-xl bg-gray-100 motion-safe:animate-pulse" />
  }

  // Signed-in but no MBTI yet → CTA
  if (!data) {
    return (
      <Link
        href="/mbti"
        className="flex items-center justify-between rounded-xl border border-dashed border-green-200 bg-green-50/40 px-4 py-2.5 text-xs motion-safe:transition-colors hover:bg-green-50"
      >
        <span className="flex items-center gap-1.5 text-green-700">
          <Brain className="h-3.5 w-3.5" />
          ทำ MBTI ดูว่าคณะนี้เหมาะกับบุคลิกคุณไหม
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-green-600" />
      </Link>
    )
  }

  const { type, match } = data
  const isMatch = match !== null && match.score >= 0.7

  if (isMatch) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
            <Sparkles className="h-3.5 w-3.5 text-green-700" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-green-800">
              เหมาะกับบุคลิก {type} ของคุณ
            </p>
            {match && (
              <p className="truncate text-[11px] text-green-700/80">
                เข้ากันได้ {Math.round(match.score * 100)}% — อันดับ #{match.rank} จาก {type}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // MBTI taken but faculty is not in top recommendations for this type
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
      <Brain className="h-3.5 w-3.5 shrink-0 text-gray-500" />
      <p className="text-xs text-gray-600">
        บุคลิก <span className="font-semibold text-gray-700">{type}</span> ของคุณ
        — คณะนี้อาจไม่ใช่ทางหลัก
        <Link href={`/mbti/${type}`} className="ml-1.5 font-semibold text-green-700 hover:underline">
          ดูคณะที่เหมาะ →
        </Link>
      </p>
    </div>
  )
}
