"use client"

// ── CompareScoreInput ────────────────────────────────────────────────────────
// Shared scores across every slot. Renders the UNION of unique subject codes
// that any slot requires, plus a fallback total for slots without weights.
// Each slot computes its own weighted score from these shared inputs.

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { getSubjectGroup, getSubjectLabel } from "@/lib/subjects"
import type { SubjectGroup } from "@/lib/subjects"
import { AlertTriangle } from "lucide-react"

// 3px color stripe on the left identifies the group at a glance — the cryptic
// 2-3 char badge ("T1", "ฟิส") was removed because the full label already
// begins with "TGAT1 ...", "A-Level ฟิสิกส์", etc.
const GROUP_STRIPE: Record<SubjectGroup, string> = {
  TGAT:      "bg-blue-500",
  TPAT:      "bg-purple-500",
  "A-Level": "bg-amber-500",
}

interface CompareScoreInputProps {
  /** Unique subject codes (union across all slots). Pass [] when nothing requires weights. */
  subjectCodes:    string[]
  scores:          Record<string, string>
  onScoreChange:   (code: string, value: string) => void
  /** True if ≥ 1 slot has no weights — render the fallback total too. */
  needsFallback:   boolean
  fallbackScore:   string
  onFallbackChange: (value: string) => void
}

const SubjectInputRow = memo(function SubjectInputRow({
  code,
  value,
  onChange,
}: {
  code:     string
  value:    string
  onChange: (code: string, value: string) => void
}) {
  const group = getSubjectGroup(code)
  const stripe = GROUP_STRIPE[group]
  const label = getSubjectLabel(code)
  const num   = parseFloat(value)
  const hasValue = value !== "" && !isNaN(num)

  return (
    <div className="relative flex items-center gap-3 overflow-hidden pl-3 pr-1 py-2.5 border-b border-gray-50 last:border-0">
      {/* Group color stripe */}
      <span aria-hidden className={cn("absolute left-0 top-2 bottom-2 w-[3px] rounded-r", stripe)} />
      <p className="flex-1 min-w-0 text-sm text-gray-700 truncate">{label}</p>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number" min={0} max={100} step={0.01} placeholder="0"
          value={value}
          aria-label={label}
          onChange={(e) => onChange(code, e.target.value)}
          className={cn(
            "w-[68px] rounded-lg border px-2 py-1.5 text-sm font-medium text-center tabular-nums",
            "outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100",
            hasValue ? "border-gray-300 bg-white text-gray-900"
                     : "border-gray-200 bg-gray-50 text-gray-400"
          )}
        />
        <span className="text-xs text-gray-300">/100</span>
      </div>
    </div>
  )
})

export function CompareScoreInput({
  subjectCodes,
  scores,
  onScoreChange,
  needsFallback,
  fallbackScore,
  onFallbackChange,
}: CompareScoreInputProps) {
  const sortedCodes = [...subjectCodes].sort((a, b) => {
    const groupOrder: Record<SubjectGroup, number> = { TGAT: 0, TPAT: 1, "A-Level": 2 }
    const diff = groupOrder[getSubjectGroup(a)] - groupOrder[getSubjectGroup(b)]
    return diff !== 0 ? diff : a.localeCompare(b)
  })

  const hasSubjects = sortedCodes.length > 0

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">กรอกคะแนนของคุณ</h3>
        <p className="mt-0.5 text-xs text-gray-400">
          ใช้คะแนนชุดเดียวกันเทียบกับทุกคณะที่เลือก — แต่ละคณะคิดค่าน้ำหนักของตัวเอง
        </p>
      </div>

      {/* Subject inputs (union) */}
      {hasSubjects && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3">
          {sortedCodes.map((code) => (
            <SubjectInputRow
              key={code}
              code={code}
              value={scores[code] ?? ""}
              onChange={onScoreChange}
            />
          ))}
        </div>
      )}

      {/* Fallback for slots without weights */}
      {needsFallback && (
        <div className="space-y-2">
          {hasSubjects && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
              <span>
                บางคณะที่เลือกไม่มีข้อมูลรายวิชา — กรอกคะแนนรวมไว้ใช้กับคณะเหล่านั้น (0-100)
              </span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {hasSubjects ? "คะแนนรวม (สำหรับคณะที่ไม่มี weights)" : "คะแนนรวม"}
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder="เช่น 72.50"
              value={fallbackScore}
              onChange={(e) => onFallbackChange(e.target.value)}
              className="h-11 text-base"
            />
          </div>
        </div>
      )}

      {!hasSubjects && !needsFallback && (
        <div className="rounded-xl bg-gray-50 px-3 py-6 text-center text-xs text-gray-400">
          เลือกคณะอย่างน้อย 1 ช่องก่อน แล้วกล่องกรอกคะแนนจะปรากฏ
        </div>
      )}
    </div>
  )
}
