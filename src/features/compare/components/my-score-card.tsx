"use client"

// ── MyScoreCard ──────────────────────────────────────────────────────────────
// Shared UI for the user's raw subject scores. Two modes:
//   • Summary mode  — collapsed chips + edit/clear (used on /analyze/major index)
//   • Input mode    — full input grid for a given set of relevant subjects
//                     (used on /analyze/major/[slug])
//
// All persistence flows through useUserScores → localStorage, so any change
// here updates every score-aware view in real time.

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useUserScores } from "@/lib/user-scores"
import {
  getSubjectLabel,
  getSubjectShortCode,
  getSubjectGroup,
  type SubjectGroup,
} from "@/lib/subjects"
import { Sparkles, ChevronDown, Trash2 } from "lucide-react"

// Group identity carried by a 3px color stripe on the left of each row.
// The cryptic 2-3 char badge ("T1", "คณ1", "ฟิส") that used to occupy the
// label slot is gone — the label itself already begins with "TGAT1 ...",
// "A-Level ...", etc. so the badge was redundant info.
const GROUP_CONFIG: Record<SubjectGroup, { stripe: string; chip: string; chipText: string }> = {
  TGAT:      { stripe: "bg-blue-500",   chip: "bg-blue-50",   chipText: "text-blue-700" },
  TPAT:      { stripe: "bg-purple-500", chip: "bg-purple-50", chipText: "text-purple-700" },
  "A-Level": { stripe: "bg-amber-500",  chip: "bg-amber-50",  chipText: "text-amber-700" },
}

interface MyScoreCardProps {
  /** When provided, render input rows for these subjects (typically the union
   *  of all subjects required by the major being viewed). When omitted, show a
   *  read-only summary of what the user has already entered. */
  relevantSubjects?: string[]
  /** Custom title — defaults to "คะแนนของคุณ". */
  title?:            string
}

export function MyScoreCard({ relevantSubjects, title }: MyScoreCardProps) {
  const { state, hasScores, setSubjectScore, clear } = useUserScores()
  const [expanded, setExpanded] = useState(false)

  const subjectScores = state?.subjectScores ?? {}
  const isInputMode   = !!relevantSubjects && relevantSubjects.length > 0

  // Sort relevant subjects by group (TGAT → TPAT → A-Level) then by code
  const sortedRelevant = useMemo(() => {
    if (!relevantSubjects) return []
    const order: Record<SubjectGroup, number> = { TGAT: 0, TPAT: 1, "A-Level": 2 }
    return [...relevantSubjects].sort((a, b) => {
      const ga = order[getSubjectGroup(a)]
      const gb = order[getSubjectGroup(b)]
      return ga !== gb ? ga - gb : a.localeCompare(b)
    })
  }, [relevantSubjects])

  // Subjects user has actually entered — for the summary chips
  const enteredCodes = useMemo(() => {
    return Object.entries(subjectScores)
      .filter(([, v]) => parseFloat(v) > 0)
      .map(([code]) => code)
  }, [subjectScores])

  // ── Input mode (rich edit grid) ───────────────────────────────────────────
  if (isInputMode) {
    const filled = sortedRelevant.filter((c) => parseFloat(subjectScores[c] ?? "") > 0).length

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {title ?? "คะแนนของคุณ"}
              </h2>
              <p className="text-[11px] text-gray-500">
                กรอกแล้วระบบจะคำนวณโอกาสรับให้ทุกมหาลัยที่เปิดสอน
              </p>
            </div>
          </div>
          {hasScores && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              ล้าง
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-gray-500">
          <span>กรอกแล้ว {filled} / {sortedRelevant.length} วิชา</span>
          <span className="tabular-nums">
            {Math.round((filled / sortedRelevant.length) * 100)}%
          </span>
        </div>
        <div className="mb-4 h-1 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${(filled / sortedRelevant.length) * 100}%` }}
          />
        </div>

        {/* Input grid */}
        <div className="grid gap-2 sm:grid-cols-2">
          {sortedRelevant.map((code) => {
            const value = subjectScores[code] ?? ""
            const num   = parseFloat(value)
            const has   = value !== "" && !isNaN(num)
            const cfg   = GROUP_CONFIG[getSubjectGroup(code)]
            return (
              <div
                key={code}
                className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40 pl-4 pr-3 py-2"
              >
                {/* Color stripe — 3px wide group identifier on the left edge */}
                <span
                  aria-hidden
                  className={cn("absolute left-0 top-0 h-full w-[3px]", cfg.stripe)}
                />
                <p className="flex-1 min-w-0 text-xs text-gray-700 truncate">
                  {getSubjectLabel(code)}
                </p>
                <input
                  type="number" min={0} max={100} step={0.01} placeholder="0"
                  value={value}
                  aria-label={getSubjectLabel(code)}
                  onChange={(e) => setSubjectScore(code, e.target.value)}
                  className={cn(
                    "w-[60px] rounded-lg border px-2 py-1.5 text-sm font-medium text-center tabular-nums",
                    "outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100",
                    has ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-200 bg-white text-gray-400"
                  )}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Summary mode (compact view) ───────────────────────────────────────────

  if (!hasScores) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-500">
            ยังไม่กรอกคะแนน — เปิดคณะใดคณะหนึ่งเพื่อกรอกพร้อมดูโอกาสรับทุกมหาลัย
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              คะแนนของคุณ
            </p>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              {enteredCodes.length} วิชา
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {enteredCodes.map((code) => {
              const cfg = GROUP_CONFIG[getSubjectGroup(code)]
              return (
                <span
                  key={code}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-gray-100 px-2 py-0.5 text-[11px]",
                    cfg.chip, cfg.chipText
                  )}
                >
                  <span className="font-bold">{getSubjectShortCode(code)}</span>
                  <span className="tabular-nums">{subjectScores[code]}</span>
                </span>
              )
            })}
          </div>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            ล้างคะแนนทั้งหมด
          </button>
        </div>
      )}
    </div>
  )
}
