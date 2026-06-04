"use client"

import { useState, useTransition, useMemo } from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResultCard } from "./result-card"
import { WeightedInputs } from "./weighted-inputs"
import {
  fetchFacultiesAction,
  analyzeAction,
  getFacultyRequirementAction,
} from "@/server/actions"
import { weightsToSubjects, calculateWeightedScore } from "@/lib/subjects"
import { cn } from "@/lib/utils"
import {
  trackUniversitySelect,
  trackFacultySelect,
  trackAnalyzeSubmit,
  trackAnalyzeResult,
} from "@/lib/analytics"
import type { University, AdmissionResult, RequirementData } from "@/types/tcas"
import { Check, AlertTriangle, BarChart2 } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface FacultyOption {
  id:        string
  name:      string
  program:   string
  majorName?: string
  detail?:   string
}

interface AnalyzeFormProps {
  universities: University[]
  filterYear?: number   // แสดงเฉพาะคณะที่มีข้อมูลปีนี้ใน dropdown
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// Note: server-side queries.ts already normalizes program / majorName / detail.
// These helpers are lightweight guards for any edge-cases that slip through.

/** แสดง program ที่ normalize แล้วจาก server — return undefined ถ้า empty */
function programLabel(program: string): string | undefined {
  return program.trim() || undefined
}

/**
 * กรอง + ย่อ detail สำหรับ dropdown display
 * - ตัดทิ้งถ้า detail เริ่มต้นด้วยชื่อคณะ (redundant concatenation)
 * - ถ้า detail มี "วิชาเอก" → extract เฉพาะส่วน specialization ("วิชาเอกเคมี" → "เคมี")
 *   เพื่อลด verbosity ใน dropdown
 */
function projectLabel(detail?: string, facultyName?: string): string | undefined {
  if (!detail) return undefined
  if (facultyName && detail.startsWith(facultyName)) return undefined
  // Extract specialization after "วิชาเอก" for compact display
  // "สาขาวิชามัธยมศึกษา (วิทยาศาสตร์) วิชาเอกเคมี" → "เคมี"
  // "วิชาเอกธุรกิจศึกษา" → "ธุรกิจศึกษา"
  const vichaeakMatch = detail.match(/วิชาเอก\s*(.+)/)
  if (vichaeakMatch) return vichaeakMatch[1].trim() || undefined
  return detail
}

/** สร้าง label ครบสำหรับ faculty option — ใช้ทั้ง combobox และ native select */
function buildFacultyLabel(f: {
  name: string
  program: string
  majorName?: string
  detail?: string
}): string {
  return [
    f.name,
    programLabel(f.program),
    f.majorName,
    projectLabel(f.detail, f.name),
  ].filter(Boolean).join(" · ")
}

// ── Styles ────────────────────────────────────────────────────────────────────

const selectClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 " +
  "outline-none transition-all duration-150 focus:border-green-400 focus:ring-2 focus:ring-green-100 " +
  "disabled:cursor-not-allowed disabled:opacity-50"

// ── Step label ────────────────────────────────────────────────────────────────

function StepBadge({
  n,
  done,
}: {
  n: number
  done?: boolean
}) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
        done
          ? "bg-green-100 text-green-700"
          : "bg-green-600 text-white"
      )}
    >
      {done ? <Check className="h-3 w-3" /> : n}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ── Faculty Combobox ──────────────────────────────────────────────────────────

function FacultyCombobox({
  faculties,
  value,
  onChange,
  disabled,
  loading,
  hasUniversity,
}: {
  faculties:    FacultyOption[]
  value:        string
  onChange:     (id: string) => void
  disabled:     boolean
  loading:      boolean
  hasUniversity: boolean
}) {
  const labelMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const f of faculties) {
      map[f.id] = buildFacultyLabel(f)
    }
    return map
  }, [faculties])

  const placeholder = !hasUniversity
    ? "เลือกมหาวิทยาลัยก่อน"
    : loading
    ? "กำลังโหลด..."
    : "พิมพ์เพื่อค้นหาคณะ / สาขา..."

  return (
    <ComboboxPrimitive.Root
      value={value || null}
      onValueChange={(id) => onChange(id ?? "")}
      itemToStringLabel={(id) => (id ? (labelMap[id] ?? "") : "")}
      disabled={disabled || loading}
    >
      <div className="w-full min-w-0">
      <ComboboxPrimitive.Input
        aria-label="เลือกคณะหรือสาขา"
        placeholder={placeholder}
        className={cn(
          selectClass,
          (disabled || loading) && "opacity-50 cursor-not-allowed"
        )}
      />
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={4} className="z-50 w-(--anchor-width)">
          <ComboboxPrimitive.Popup className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            <ComboboxPrimitive.List>
              {faculties.map((f) => (
                <ComboboxPrimitive.Item
                  key={f.id}
                  value={f.id}
                  className="cursor-pointer px-3 py-2 text-sm text-gray-800 outline-none data-[highlighted]:bg-green-50 data-[highlighted]:text-green-700"
                >
                  {labelMap[f.id]}
                </ComboboxPrimitive.Item>
              ))}
            </ComboboxPrimitive.List>
            <ComboboxPrimitive.Empty className="px-3 py-4 text-center text-sm text-gray-400">
              ไม่พบคณะที่ค้นหา
            </ComboboxPrimitive.Empty>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyzeForm({ universities, filterYear }: AnalyzeFormProps) {
  // ── Selection state ──────────────────────────────────────────────
  const [universityId,   setUniversityId]   = useState("")
  const [universityName, setUniversityName] = useState("")
  const [facultyId,      setFacultyId]      = useState("")
  const [faculties,      setFaculties]      = useState<FacultyOption[]>([])

  // ── Requirement (weights) ────────────────────────────────────────
  const [requirement,         setRequirement]         = useState<RequirementData | null>(null)
  const [isLoadingRequirement, setIsLoadingRequirement] = useState(false)

  // ── Score inputs ─────────────────────────────────────────────────
  const [subjectScores, setSubjectScores] = useState<Record<string, string>>({})
  const [fallbackScore, setFallbackScore] = useState("")

  // ── Result ───────────────────────────────────────────────────────
  const [result, setResult] = useState<AdmissionResult | null>(null)
  const [error,  setError]  = useState("")

  const [isFetchingFaculties, startFetchFaculties] = useTransition()
  const [isAnalyzing,          startAnalyze]        = useTransition()

  // ── Live weighted score ──────────────────────────────────────────
  const calculatedScore = useMemo(() => {
    if (!requirement) return null
    return calculateWeightedScore(
      weightsToSubjects(requirement.weights),
      subjectScores
    )
  }, [requirement, subjectScores])

  // ── Handlers ─────────────────────────────────────────────────────

  function handleUniversityChange(value: string) {
    setUniversityId(value)
    setFacultyId("")
    setFaculties([])
    setRequirement(null)
    setSubjectScores({})
    setFallbackScore("")
    setResult(null)
    setError("")
    if (!value) return
    const uniName = universities.find((u) => u.id === value)?.name ?? value
    setUniversityName(uniName)
    trackUniversitySelect(uniName)
    startFetchFaculties(async () => {
      const data = await fetchFacultiesAction(value, filterYear)
      setFaculties(data)
    })
  }

  async function handleFacultyChange(value: string) {
    setFacultyId(value)
    setRequirement(null)
    setSubjectScores({})
    setFallbackScore("")
    setResult(null)
    setError("")
    if (!value) return
    const fac = faculties.find((f) => f.id === value)
    if (fac) trackFacultySelect(universityName, fac.name)
    setIsLoadingRequirement(true)
    try {
      const data = await getFacultyRequirementAction(value)
      setRequirement(data)
    } finally {
      setIsLoadingRequirement(false)
    }
  }

  function handleSubjectScore(code: string, value: string) {
    setSubjectScores((prev) => ({ ...prev, [code]: value }))
    setResult(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    let score: number

    if (requirement && calculatedScore !== null) {
      if (calculatedScore <= 0) {
        setError("กรุณากรอกคะแนนอย่างน้อย 1 วิชา")
        return
      }
      score = calculatedScore
    } else {
      const num = parseFloat(fallbackScore)
      if (isNaN(num) || num < 0 || num > 100) {
        setError("กรุณากรอกคะแนนระหว่าง 0 – 100")
        return
      }
      score = num
    }

    if (!facultyId) {
      setError("กรุณาเลือกคณะที่ต้องการ")
      return
    }

    const fac = faculties.find((f) => f.id === facultyId)
    trackAnalyzeSubmit({
      universityName,
      facultyName: fac?.name ?? facultyId,
      hasWeights:  hasWeights,
      userScore:   score,
    })

    startAnalyze(async () => {
      const analyzed = await analyzeAction(facultyId, score)
      if (!analyzed) {
        setError("คณะนี้ยังไม่มีข้อมูลคะแนนย้อนหลัง ลองเลือกคณะอื่น")
        return
      }
      setResult(analyzed)
      trackAnalyzeResult({
        universityName,
        facultyName: analyzed.faculty.name,
        chance:      analyzed.chance,
        gap:         analyzed.gap,
        userScore:   analyzed.userScore,
      })
    })
  }

  // ── Derived state ─────────────────────────────────────────────────
  const hasWeights = requirement !== null && Object.keys(requirement.weights).length > 0
  const isReady =
    facultyId !== "" &&
    !isLoadingRequirement &&
    (hasWeights
      ? (calculatedScore !== null && calculatedScore > 0)
      : fallbackScore !== "")
  const isLoading = isFetchingFaculties || isAnalyzing || isLoadingRequirement

  // ── Reset (keep university, clear faculty + result) ──────────────
  function handleReset() {
    setFacultyId("")
    setFaculties([])
    setRequirement(null)
    setSubjectScores({})
    setFallbackScore("")
    setResult(null)
    setError("")
  }

  // ── Derived step (1 | 2 | 3) ──────────────────────────────────────
  const currentStep = result ? 3 : facultyId ? 2 : 1

  // ── Render ────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="min-w-0">
      {/* Step progress bar */}
      <div className="mb-6 flex items-center gap-2">
        {(["เลือกคณะ", "กรอกคะแนน", "ผลวิเคราะห์"] as const).map((label, i) => {
          const step = i + 1
          const done    = currentStep > step
          const active  = currentStep === step
          return (
            <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <span className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done   ? "bg-green-500 text-white"
                  : active ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-400"
                )}>
                  {done ? <Check className="h-3 w-3" /> : step}
                </span>
                <span className={cn(
                  "hidden min-[400px]:block text-xs font-medium truncate transition-colors",
                  active ? "text-green-700" : done ? "text-green-600" : "text-gray-400"
                )}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className={cn(
                  "flex-1 h-0.5 rounded-full transition-colors",
                  done ? "bg-green-400" : "bg-gray-200"
                )} />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">

        {/* ─────────────────────── Left column ─────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* ── Step 1: เลือกคณะ ── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <StepBadge n={1} done={!!facultyId} />
              <h2 className="min-w-0 flex-1 text-sm font-semibold text-gray-800 truncate">
                เลือกมหาวิทยาลัยและคณะ
              </h2>
              {filterYear && (
                <span className="flex-shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 border border-green-100">
                  TCAS{filterYear - 2500}
                </span>
              )}
            </div>

            {/* University */}
            <div>
              <label className="sr-only" htmlFor="university-select">เลือกมหาวิทยาลัย</label>
              <select
                id="university-select"
                value={universityId}
                onChange={(e) => handleUniversityChange(e.target.value)}
                className={selectClass}
              >
                <option value="">— เลือกมหาวิทยาลัย —</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty — mobile: combobox (searchable), desktop: native select */}
            <div className="lg:hidden">
              <FacultyCombobox
                faculties={faculties}
                value={facultyId}
                onChange={handleFacultyChange}
                disabled={!universityId}
                loading={isFetchingFaculties}
                hasUniversity={!!universityId}
              />
            </div>
            <select
              value={facultyId}
              onChange={(e) => handleFacultyChange(e.target.value)}
              disabled={!universityId || isFetchingFaculties}
              className={cn(
                selectClass,
                "hidden lg:block",
                (!universityId || isFetchingFaculties) && "opacity-50"
              )}
            >
              <option value="">
                {!universityId
                  ? "เลือกมหาวิทยาลัยก่อน"
                  : isFetchingFaculties
                  ? "กำลังโหลด..."
                  : "— เลือกคณะ / สาขา —"}
              </option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {buildFacultyLabel(f)}
                </option>
              ))}
            </select>
          </div>

          {/* ── Step 2: กรอกคะแนน ── */}
          {facultyId && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2">
                <StepBadge
                  n={2}
                  done={
                    hasWeights
                      ? (calculatedScore !== null && calculatedScore > 0)
                      : fallbackScore !== ""
                  }
                />
                <h2 className="min-w-0 flex-1 text-sm font-semibold text-gray-800">
                  กรอกคะแนนของคุณ
                </h2>
              </div>

              {/* Loading requirement */}
              {isLoadingRequirement && (
                <div className="flex items-center justify-center gap-2.5 py-8 text-sm text-gray-400">
                  <Spinner />
                  <span>กำลังโหลดข้อมูลวิชา...</span>
                </div>
              )}

              {/* Dynamic weighted inputs */}
              {!isLoadingRequirement && hasWeights && (
                <WeightedInputs
                  weights={requirement!.weights}
                  scores={subjectScores}
                  onChange={handleSubjectScore}
                  estMinScore={requirement?.estMinScore}
                />
              )}

              {/* Fallback: no weights */}
              {!isLoadingRequirement && !hasWeights && facultyId && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
                    <span>
                      คณะนี้ยังไม่มีข้อมูลรายวิชา
                      กรอกคะแนนรวมได้เลย (0–100)
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      คะแนนรวม
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      placeholder="เช่น 72.50"
                      value={fallbackScore}
                      onChange={(e) => {
                        setFallbackScore(e.target.value)
                        setResult(null)
                      }}
                      className="h-11 text-base"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Submit button ── */}
          {facultyId && (
            <Button
              type="submit"
              disabled={!isReady || isLoading}
              className={cn(
                "w-full h-12 rounded-xl text-base font-semibold transition-all duration-200",
                isReady && !isLoading
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              )}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  กำลังวิเคราะห์...
                </span>
              ) : (
                "วิเคราะห์โอกาสรับ →"
              )}
            </Button>
          )}
        </div>

        {/* ─────────────────────── Right column ────────────────────── */}
        <div className="lg:sticky lg:top-6">
          {result ? (
            <ResultCard result={result} onReset={handleReset} />
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
              <BarChart2 className="h-12 w-12 text-gray-300" />
              <div>
                <p className="text-sm font-medium">ผลวิเคราะห์จะแสดงที่นี่</p>
                <p className="mt-1 text-xs text-gray-300">
                  เลือกคณะและกรอกคะแนนเพื่อเริ่ม
                </p>
              </div>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Spinner />
                  <span className="text-green-600">กำลังวิเคราะห์...</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </form>
  )
}
