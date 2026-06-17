"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import {
  weightsToSubjects,
  calculateWeightedScore,
  stripALevelPrefix,
} from "@/lib/subjects"
import type { SubjectGroup, SubjectWeight } from "@/lib/subjects"
import { CheckCircle2, Target } from "lucide-react"

// ── Config per group ──────────────────────────────────────────────────────────
// Group identity used to be carried by a per-row 2-3 char badge (T1 / P3 / คณ1)
// that duplicated info already in the label. The section header now owns the
// group color, and individual rows are plain — full label reads in one pass.

const GROUP_CONFIG: Record<
  SubjectGroup,
  { bg: string; text: string; border: string; dot: string }
> = {
  TGAT: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    dot: "bg-blue-500",
  },
  TPAT: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-100",
    dot: "bg-purple-500",
  },
  "A-Level": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-500",
  },
}

// ── Subject row ───────────────────────────────────────────────────────────────
// Memoized: only re-renders when its own subject/score/onChange ref changes.
// Combined with a stable onChange from parent (useCallback), typing in one
// subject's input no longer re-renders the other 6 rows.

const SubjectRow = memo(function SubjectRow({
  subject,
  score,
  onChange,
}: {
  subject: SubjectWeight
  score: string
  onChange: (code: string, value: string) => void
}) {
  const cfg = GROUP_CONFIG[subject.group]
  const numVal = parseFloat(score)
  const hasValue = score !== "" && !isNaN(numVal)
  const contribution = hasValue ? (numVal * subject.weight) / 100 : null

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-sm font-medium text-gray-800 leading-tight max-sm:truncate">{subject.label}</p>
        <span className={cn("mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-xs font-semibold", cfg.bg, cfg.text)}>
          {subject.weight}%
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number" min={0} max={100} step={0.01} placeholder="0" value={score}
          aria-label={subject.label}
          onChange={(e) => onChange(subject.code, e.target.value)}
          className={cn(
            "w-[68px] rounded-lg border px-2.5 py-2 text-sm font-medium text-center",
            "outline-none transition-all duration-150",
            "focus:border-green-400 focus:ring-2 focus:ring-green-100",
            hasValue ? "border-gray-300 bg-white text-gray-900" : "border-gray-200 bg-gray-50 text-gray-400"
          )}
        />
        <span className="text-xs text-gray-300">/100</span>
      </div>
      <div className="hidden sm:block w-14 text-right flex-shrink-0">
        {contribution !== null ? (
          <span className="text-sm font-bold text-green-600">+{contribution.toFixed(2)}</span>
        ) : (
          <span className="text-sm text-gray-200">—</span>
        )}
      </div>
    </div>
  )
})

// ── BestOf row (เลือกดีที่สุด) ────────────────────────────────────────────────

function BestOfRow({
  subject,
  scores,
  onChange,
}: {
  subject: SubjectWeight
  scores: Record<string, string>
  onChange: (code: string, value: string) => void
}) {
  const cfg = GROUP_CONFIG[subject.group]
  const choices = subject.bestOf!
  const choiceVals = choices.codes.map((c) => parseFloat(scores[c] ?? "") || 0)
  const bestVal    = Math.max(0, ...choiceVals)
  const hasBest    = choiceVals.some((v) => v > 0)
  const contribution = hasBest ? (bestVal * subject.weight) / 100 : null

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      {/* Group header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-tight">{subject.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("inline-block rounded-full px-1.5 py-0.5 text-xs font-semibold", cfg.bg, cfg.text)}>
              {subject.weight}%
            </span>
            <span className="text-xs text-gray-400">ระบบเลือกคะแนนสูงสุดให้อัตโนมัติ</span>
          </div>
        </div>
        <div className="hidden sm:block w-14 text-right flex-shrink-0">
          {contribution !== null ? (
            <span className="text-sm font-bold text-green-600">+{contribution.toFixed(2)}</span>
          ) : (
            <span className="text-sm text-gray-200">—</span>
          )}
        </div>
      </div>

      {/* Choice inputs */}
      <div className="space-y-1.5">
        {choices.codes.map((code, i) => {
          const val    = scores[code] ?? ""
          const numVal = parseFloat(val) || 0
          const isBest = hasBest && numVal === bestVal && numVal > 0
          return (
            <div key={code} className="flex items-center gap-2">
              <span className={cn("text-xs text-gray-500 flex-1 max-sm:truncate", isBest && "font-semibold text-green-700")}>
                {stripALevelPrefix(choices.labels[i])}
                {isBest && <span className="ml-1.5 text-[10px] text-green-600 font-bold">★ ใช้คะแนนนี้</span>}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="number" min={0} max={100} step={0.01} placeholder="0" value={val}
                  aria-label={choices.labels[i]}
                  onChange={(e) => onChange(code, e.target.value)}
                  className={cn(
                    "w-[68px] rounded-lg border px-2.5 py-1.5 text-sm font-medium text-center",
                    "outline-none transition-all duration-150",
                    "focus:border-green-400 focus:ring-2 focus:ring-green-100",
                    isBest  ? "border-green-400 bg-green-50 text-green-800 font-semibold"
                    : val   ? "border-gray-300 bg-white text-gray-900"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                  )}
                />
                <span className="text-xs text-gray-300">/100</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Group section ─────────────────────────────────────────────────────────────

function SubjectGroupSection({
  group,
  subjects,
  scores,
  onChange,
}: {
  group: SubjectGroup
  subjects: SubjectWeight[]
  scores: Record<string, string>
  onChange: (code: string, value: string) => void
}) {
  const cfg = GROUP_CONFIG[group]
  const groupWeight = subjects.reduce((s, sub) => s + sub.weight, 0)

  return (
    <div className={cn("rounded-xl border overflow-hidden", cfg.border)}>
      {/* Header */}
      <div className={cn("flex items-center gap-2 px-4 py-2", cfg.bg)}>
        <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
        <span className={cn("text-xs font-bold", cfg.text)}>{group}</span>
        <span className={cn("text-xs opacity-60", cfg.text)}>
          · {groupWeight}% ของคะแนนรวม
        </span>
      </div>

      {/* Rows */}
      <div className="bg-white px-4">
        {subjects.map((sub) =>
          sub.bestOf ? (
            <BestOfRow
              key={sub.code}
              subject={sub}
              scores={scores}
              onChange={onChange}
            />
          ) : (
            <SubjectRow
              key={sub.code}
              subject={sub}
              score={scores[sub.code] ?? ""}
              onChange={onChange}
            />
          )
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface WeightedInputsProps {
  weights:     Record<string, unknown>
  scores:      Record<string, string>
  onChange:    (code: string, value: string) => void
  estMinScore?: number | null
}

export function WeightedInputs({
  weights,
  scores,
  onChange,
  estMinScore,
}: WeightedInputsProps) {
  const subjects  = weightsToSubjects(weights)
  const total     = calculateWeightedScore(subjects, scores)
  const filled    = subjects.filter((s) => {
    if (s.bestOf) return s.bestOf.codes.some(c => scores[c] !== "" && !isNaN(parseFloat(scores[c] ?? "")))
    return scores[s.code] !== "" && !isNaN(parseFloat(scores[s.code] ?? ""))
  }).length
  const allFilled = filled === subjects.length

  // group subjects by TGAT / TPAT / A-Level
  const groups = subjects.reduce<Partial<Record<SubjectGroup, SubjectWeight[]>>>(
    (acc, s) => {
      acc[s.group] = [...(acc[s.group] ?? []), s]
      return acc
    },
    {}
  )

  // progress bar color — neutral-to-green scale, no red (red = form error only, per design system)
  const barColor =
    total >= 70 ? "bg-green-500" : total >= 50 ? "bg-green-400" : total >= 30 ? "bg-green-300" : total > 0 ? "bg-green-200" : "bg-gray-200"

  return (
    <div className="space-y-3">
      {/* Column header (desktop hint) */}
      <div className="hidden sm:flex items-center gap-2.5 px-1 text-xs text-gray-400">
        <div className="w-9 flex-shrink-0" />
        <div className="flex-1">วิชา</div>
        <div className="w-[90px] text-center flex-shrink-0">คะแนนของคุณ</div>
        <div className="w-14 text-right flex-shrink-0">ผลรวม</div>
      </div>

      {/* Subject groups */}
      {(Object.keys(GROUP_CONFIG) as SubjectGroup[]).map((g) => {
        const list = groups[g]
        if (!list?.length) return null
        return (
          <SubjectGroupSection
            key={g}
            group={g}
            subjects={list}
            scores={scores}
            onChange={onChange}
          />
        )
      })}

      {/* ── Total score card ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">คะแนนรวมของคุณ</p>
            {!allFilled && (
              <p className="text-xs text-gray-400 mt-0.5">
                กรอกแล้ว {filled}/{subjects.length} วิชา
              </p>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-3xl font-bold tabular-nums transition-colors duration-300",
                total > 0 ? "text-green-600" : "text-gray-200"
              )}
            >
              {total.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 mb-0.5">/ 100</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", barColor)}
            style={{ width: `${Math.min(100, total)}%` }}
          />
        </div>

        {/* estMinScore indicator */}
        {estMinScore && estMinScore > 0 && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
              total > 0 && total >= estMinScore
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {total > 0 && total >= estMinScore
              ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-px" />
              : <Target className="h-4 w-4 flex-shrink-0 mt-px" />
            }
            <span>
              คาดการณ์คะแนนขั้นต่ำ (จากแนวโน้ม):{" "}
              <strong>{estMinScore.toFixed(2)}</strong>
              {total > 0 && (
                <span className="ml-1">
                  {total >= estMinScore
                    ? `· เกินอยู่ +${(total - estMinScore).toFixed(2)}`
                    : `· ยังขาดอยู่ ${(estMinScore - total).toFixed(2)}`}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
