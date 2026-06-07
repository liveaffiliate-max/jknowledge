"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { BarChart2, ChevronRight, Trash2, Filter } from "lucide-react"
import { deletePredictionAction } from "@/server/actions"
import { useToast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import type { PredictionHistoryItem } from "@/server/queries"

type SortKey = "recent" | "high" | "low" | "score"

const CHANCE_CONFIG = {
  high:        { label: "โอกาสสูง",   color: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
  competitive: { label: "แข่งขันได้", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  low:         { label: "ยากขึ้น",    color: "bg-red-100 text-red-700",       dot: "bg-red-500"    },
}

const SORT_LABEL: Record<SortKey, string> = {
  recent: "ล่าสุด",
  high:   "โอกาสสูง",
  low:    "ยากขึ้น",
  score:  "คะแนนสูงสุด",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function DashboardList({ items }: { items: PredictionHistoryItem[] }) {
  const [sort, setSort] = useState<SortKey>("recent")
  const [openMenu, setOpenMenu] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const { toast } = useToast()

  const sorted = useMemo(() => {
    const arr = [...items]
    switch (sort) {
      case "high":   return arr.sort((a, b) => Number(b.chance === "high") - Number(a.chance === "high"))
      case "low":    return arr.sort((a, b) => Number(b.chance === "low")  - Number(a.chance === "low"))
      case "score":  return arr.sort((a, b) => b.userScore - a.userScore)
      default:       return arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }
  }, [items, sort])

  function handleDelete(id: string) {
    if (!confirm("ลบประวัตินี้ออกจาก Dashboard?")) return
    setPendingDelete(id)
    startTransition(async () => {
      const res = await deletePredictionAction(id)
      setPendingDelete(null)
      toast(res.ok ? "ลบประวัติแล้ว" : "ลบไม่สำเร็จ", res.ok ? "success" : "error")
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
        <BarChart2 className="h-12 w-12 text-gray-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-500">ยังไม่มีประวัติการวิเคราะห์</p>
        <p className="text-xs text-gray-400 mt-1">เริ่มวิเคราะห์คะแนนเพื่อดูโอกาสรับ</p>
        <Link
          href="/analyze"
          className="mt-4 inline-block rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          เริ่มวิเคราะห์
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* ── Sort dropdown ── */}
      <div className="flex justify-end mb-3 relative">
        <button
          type="button"
          onClick={() => setOpenMenu((v) => !v)}
          onBlur={() => setTimeout(() => setOpenMenu(false), 150)}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-green-200"
        >
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          เรียงตาม: {SORT_LABEL[sort]}
        </button>
        {openMenu && (
          <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onMouseDown={() => { setSort(k); setOpenMenu(false) }}
                className={cn(
                  "block w-full text-left px-3 py-2 text-xs hover:bg-gray-50",
                  k === sort ? "font-semibold text-green-700" : "text-gray-700"
                )}
              >
                {SORT_LABEL[k]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── List ── */}
      <div className="space-y-2.5">
        {sorted.map((item) => {
          const cfg = CHANCE_CONFIG[item.chance]
          const absGap = Math.abs(item.gap).toFixed(2)
          const gapLabel = item.gap >= 0 ? `+${absGap} เหนือเกณฑ์` : `${absGap} ต่ำกว่าเกณฑ์`
          const isDeleting = pendingDelete === item.id

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-4 transition-all group",
                isDeleting ? "opacity-50" : "hover:border-green-200 hover:shadow-sm"
              )}
            >
              <Link
                href={`/scores/${item.faculty.university.slug}/${item.faculty.id}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div
                  className="h-10 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.faculty.university.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.faculty.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {item.faculty.university.name}
                    {item.faculty.majorName && ` · ${item.faculty.majorName}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", cfg.color)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      คะแนน {item.userScore.toFixed(2)} · {gapLabel}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right hidden sm:block">
                  <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                  <ChevronRight className="h-4 w-4 text-gray-300 mt-1 ml-auto group-hover:text-green-400 transition-colors" />
                </div>
              </Link>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={isDeleting}
                aria-label="ลบประวัติ"
                className="flex-shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
