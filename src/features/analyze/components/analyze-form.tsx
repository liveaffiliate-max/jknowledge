"use client"

import { useState, useTransition, useMemo, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
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
import { getRegion, REGION_ORDER, type ThaiRegion } from "@/lib/thai-regions"
import { expandThaiSynonyms } from "@/lib/thai-synonyms"

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

// ── Persistence ───────────────────────────────────────────────────────────────
// Save form inputs (not result) in sessionStorage so users who navigate to
// /scores and back, or open a new tab from the dashboard, don't lose context.

const STORAGE_KEY = "jknowledge:analyze:v1"

type PersistedState = {
  universityId:   string
  universityName: string
  facultyId:      string
  subjectScores:  Record<string, string>
  fallbackScore:  string
}

function readPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

function writePersisted(state: PersistedState | null) {
  if (typeof window === "undefined") return
  try {
    if (!state || !state.universityId) {
      window.sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode errors
  }
}

// ── Pending history (anonymous → signed-in migration) ────────────────────────
// After a guest analysis, store the result here. Sign-up page reads + saves it.

const PENDING_KEY = "jknowledge:pending-save:v1"

type PendingHistory = { facultyId: string; userScore: number }

export function writePendingHistory(data: PendingHistory) {
  if (typeof window === "undefined") return
  try { window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(data)) } catch { /* noop */ }
}

export function readPendingHistory(): PendingHistory | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingHistory) : null
  } catch { return null }
}

export function clearPendingHistory() {
  if (typeof window === "undefined") return
  try { window.sessionStorage.removeItem(PENDING_KEY) } catch { /* noop */ }
}

// ── Recent universities (localStorage, cross-session) ─────────────────────────
// Surfaces the user's last few picks as quick-pick chips above the dropdown.
// localStorage (not sessionStorage) so a returning user tomorrow still sees them.

const RECENT_KEY = "jknowledge:recent-universities:v1"
const MAX_RECENT = 3

function readRecentIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []
  } catch {
    return []
  }
}

function pushRecentId(id: string) {
  if (typeof window === "undefined" || !id) return
  try {
    const current = readRecentIds()
    const next = [id, ...current.filter((x) => x !== id)].slice(0, MAX_RECENT)
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode errors
  }
}

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

// ── Helpers for search strings (module-level → stable refs for useMemo) ───────

function buildFacultySecondary(f: FacultyOption): string {
  return [
    programLabel(f.program),
    f.majorName,
    projectLabel(f.detail, f.name),
  ].filter(Boolean).join(" · ")
}

// Stable module-level helpers (avoid re-running useMemo / breaking referential equality)
//
// Display strings: clean text that ends up in the input after selection.
// Search strings:  same text + Thai synonyms — used only by the filter, never displayed.
const universityDisplayString = (u: { name: string }) => u.name
const universitySearchString = (u: { name: string; id: string }) =>
  expandThaiSynonyms(u.name)
const universityRegion = (u: { location: string | null }): ThaiRegion =>
  getRegion(u.location)

const facultyDisplayString = (f: FacultyOption) => {
  const secondary = buildFacultySecondary(f)
  return secondary ? `${f.name} · ${secondary}` : f.name
}
const facultySearchString = (f: FacultyOption) =>
  expandThaiSynonyms(facultyDisplayString(f))

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyzeForm({ universities, filterYear }: AnalyzeFormProps) {
  const { isSignedIn } = useAuth()
  const { toast }      = useToast()

  // ── Selection state ──────────────────────────────────────────────
  const [universityId,   setUniversityId]   = useState("")
  const [universityName, setUniversityName] = useState("")
  const [facultyId,      setFacultyId]      = useState("")
  const [faculties,      setFaculties]      = useState<FacultyOption[]>([])

  // ── Recent universities (localStorage) ──────────────────────────
  // Hydrated after mount so SSR + initial paint stays stable.
  const [recentIds, setRecentIds] = useState<string[]>([])
  useEffect(() => { setRecentIds(readRecentIds()) }, [])
  const recentUniversities = useMemo(() =>
    recentIds
      .map((id) => universities.find((u) => u.id === id))
      .filter((u): u is University => Boolean(u))
      .filter((u) => u.id !== universityId),  // hide the one already selected
    [recentIds, universities, universityId]
  )

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

  // ── Hydrate from sessionStorage on mount ────────────────────────
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const saved = readPersisted()
    if (!saved?.universityId) {
      setHydrated(true)
      return
    }
    setUniversityId(saved.universityId)
    setUniversityName(saved.universityName)
    startFetchFaculties(async () => {
      const data = await fetchFacultiesAction(saved.universityId, filterYear)
      setFaculties(data)
      // Restore faculty + scores only if the saved facultyId still exists this year
      if (saved.facultyId && data.some((f) => f.id === saved.facultyId)) {
        setFacultyId(saved.facultyId)
        setIsLoadingRequirement(true)
        try {
          const req = await getFacultyRequirementAction(saved.facultyId)
          setRequirement(req)
        } finally {
          setIsLoadingRequirement(false)
        }
        setSubjectScores(saved.subjectScores || {})
        setFallbackScore(saved.fallbackScore || "")
      }
      setHydrated(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist on every relevant state change (after hydration) ────
  useEffect(() => {
    if (!hydrated) return
    writePersisted({
      universityId,
      universityName,
      facultyId,
      subjectScores,
      fallbackScore,
    })
  }, [hydrated, universityId, universityName, facultyId, subjectScores, fallbackScore])

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
    // Save to recent — cross-session quick-pick row above the combobox
    pushRecentId(value)
    setRecentIds(readRecentIds())
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

  // Stable ref → SubjectRow's React.memo can skip re-renders for untouched rows
  const handleSubjectScore = useCallback((code: string, value: string) => {
    setSubjectScores((prev) => ({ ...prev, [code]: value }))
    setResult(null)
  }, [])

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
      if (isSignedIn) {
        // Server already persisted to PredictionHistory; tell the user it's saved.
        toast("บันทึกลง Dashboard แล้ว", "success")
        clearPendingHistory()
      } else {
        // Store for anonymous → signed-in migration (cleared after sign-up saves it)
        writePendingHistory({ facultyId, userScore: analyzed.userScore })
      }
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

  // ── Clear everything including saved state ───────────────────────
  function handleClearAll() {
    setUniversityId("")
    setUniversityName("")
    setFacultyId("")
    setFaculties([])
    setRequirement(null)
    setSubjectScores({})
    setFallbackScore("")
    setResult(null)
    setError("")
    writePersisted(null)
  }

  // Show clear button only when there's actually something to clear
  const hasAnyState = !!universityId || !!facultyId || Object.keys(subjectScores).length > 0 || !!fallbackScore

  // ── Derived step (1 | 2 | 3) ──────────────────────────────────────
  const currentStep = result ? 3 : facultyId ? 2 : 1

  // ── Render ────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="min-w-0">
      {/* Step progress bar */}
      <div className="mb-2 flex items-center justify-end gap-2 h-5">
        {hasAnyState && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            ล้างค่าทั้งหมด
          </button>
        )}
      </div>
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

            {/* Recent universities — quick pick row */}
            {recentUniversities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-gray-400">เลือกล่าสุด:</span>
                {recentUniversities.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => handleUniversityChange(u.id)}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-green-100 hover:text-green-700"
                  >
                    {u.shortName}
                  </button>
                ))}
              </div>
            )}

            {/* University — grouped by region */}
            <Combobox
              items={universities}
              value={universityId}
              onChange={handleUniversityChange}
              placeholder="ค้นหามหาวิทยาลัย..."
              ariaLabel="เลือกมหาวิทยาลัย"
              emptyText="ไม่พบมหาวิทยาลัย"
              buildDisplayString={universityDisplayString}
              buildSearchString={universitySearchString}
              groupBy={universityRegion}
              groupOrder={REGION_ORDER}
              renderItem={(u) => (
                <div className="text-sm font-medium text-gray-900 group-data-[highlighted]:text-green-800">
                  {u.name}
                </div>
              )}
            />

            {/* Faculty */}
            <Combobox
              items={faculties}
              value={facultyId}
              onChange={handleFacultyChange}
              disabled={!universityId}
              loading={isFetchingFaculties}
              placeholder={
                !universityId
                  ? "เลือกมหาวิทยาลัยก่อน"
                  : isFetchingFaculties
                  ? "กำลังโหลด..."
                  : "ค้นหาคณะ / สาขา..."
              }
              ariaLabel="เลือกคณะหรือสาขา"
              emptyText="ไม่พบคณะที่ค้นหา"
              buildDisplayString={facultyDisplayString}
              buildSearchString={facultySearchString}
              renderItem={(f) => {
                const secondary = buildFacultySecondary(f)
                return (
                  <>
                    <div className="text-sm font-medium leading-tight text-gray-900 group-data-[highlighted]:text-green-800">
                      {f.name}
                    </div>
                    {secondary && (
                      <div className="mt-0.5 truncate text-xs leading-tight text-gray-500 group-data-[highlighted]:text-green-600">
                        {secondary}
                      </div>
                    )}
                  </>
                )
              }}
            />
          </div>

          {/* ── Step 2: กรอกคะแนน ── */}
          {facultyId && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 animate-step-reveal">
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
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 animate-error-reveal">
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
        {/*
          Mobile: only render when there's a result (no empty placeholder wasting viewport).
          Desktop: always render — empty state fills the sticky column meaningfully.
        */}
        <div className={cn("lg:sticky lg:top-6", !result && "hidden lg:block")}>
          {result ? (
            <div className="animate-result-reveal">
              <ResultCard result={result} onReset={handleReset} />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-400">
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
