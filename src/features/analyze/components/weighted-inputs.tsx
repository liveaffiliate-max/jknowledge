"use client"

import { cn } from "@/lib/utils"
import {
  weightsToSubjects,
  calculateWeightedScore,
  getSubjectShortCode,
} from "@/lib/subjects"
import type { SubjectGroup, SubjectWeight } from "@/lib/subjects"
import { CheckCircle2, Target } from "lucide-react"

// ── Config per group ──────────────────────────────────────────────────────────

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

function SubjectRow({
  subject,
  score,
  onChange,
}: {
  subject: SubjectWeight
  score: string
  onChange: (value: string) => void
}) {
  const cfg = GROUP_CONFIG[subject.group]
  const numVal = parseFloat(score)
  const hasValue = score !== "" && !isNaN(numVal)
  const contribution = hasValue ? (numVal * subject.weight) / 100 : null

  return (
    <div className="flex items-center gap-2.5 py-3 border-b border-gray-50 last:border-0">
      {/* Short code badge */}
      <div
        className={cn(
          "flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-bold leading-none",
          cfg.bg,
          cfg.text
        )}
      >
        {getSubjectShortCode(subject.code)}
      </div>

      {/* Subject name + weight badge */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-tight truncate">
          {subject.label}
        </p>
        <span
          className={cn(
            "mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            cfg.bg,
            cfg.text
          )}
        >
          {subject.weight}%
        </span>
      </div>

      {/* Score input */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          placeholder="0"
          value={score}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-[68px] rounded-lg border px-2.5 py-2 text-sm font-medium text-center",
            "outline-none transition-all duration-150",
            "focus:border-green-400 focus:ring-2 focus:ring-green-100",
            hasValue
              ? "border-gray-300 bg-white text-gray-900"
              : "border-gray-200 bg-gray-50 text-gray-400"
          )}
        />
        <span className="text-xs text-gray-300">/100</span>
      </div>

      {/* Contribution */}
      <div className="w-14 text-right flex-shrink-0">
        {contribution !== null ? (
          <span className="text-sm font-bold text-green-600">
            +{contribution.toFixed(2)}
          </span>
        ) : (
          <span className="text-sm text-gray-200">—</span>
        )}
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
        {subjects.map((sub) => (
          <SubjectRow
            key={sub.code}
            subject={sub}
            score={scores[sub.code] ?? ""}
            onChange={(v) => onChange(sub.code, v)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface WeightedInputsProps {
  weights:     Record<string, number>
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
  const filled    = subjects.filter(
    (s) => scores[s.code] !== "" && !isNaN(parseFloat(scores[s.code] ?? ""))
  ).length
  const allFilled = filled === subjects.length

  // group subjects by TGAT / TPAT / A-Level
  const groups = subjects.reduce<Partial<Record<SubjectGroup, SubjectWeight[]>>>(
    (acc, s) => {
      acc[s.group] = [...(acc[s.group] ?? []), s]
      return acc
    },
    {}
  )

  // progress bar color
  const barColor =
    total >= 70 ? "bg-green-500" : total >= 50 ? "bg-yellow-400" : total > 0 ? "bg-red-400" : "bg-gray-200"

  return (
    <div className="space-y-3">
      {/* Column header (desktop hint) */}
      <div className="hidden sm:flex items-center gap-2.5 px-1 text-[10px] text-gray-400">
        <div className="w-9 flex-shrink-0" />
        <div className="flex-1">วิชา</div>
        <div className="w-[90px] text-center flex-shrink-0">คะแนนของคุณ</div>
        <div className="w-14 text-right flex-shrink-0">ส่วนรวม</div>
      </div>

      {/* Subject groups */}
      {(["TGAT", "TPAT", "A-Level"] as SubjectGroup[]).map((g) => {
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
            <p className="text-sm font-semibold text-gray-700">คะแนนรวมสัดส่วน</p>
            {!allFilled && (
              <p className="text-[11px] text-gray-400 mt-0.5">
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
              คาดการณ์คะแนนขั้นต่ำปีหน้า:{" "}
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
