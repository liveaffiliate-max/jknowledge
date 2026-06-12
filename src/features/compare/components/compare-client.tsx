"use client"

// ── CompareClient ────────────────────────────────────────────────────────────
// Orchestrates the entire compare flow:
//   slot pickers ─→ shared score input ─→ batch analyze ─→ comparison table
//
// Slot count: 2 default, up to COMPARE_MAX_SLOTS (4).
// Score input renders a union of subject codes across all slots' requirements.
// Each slot computes its own weighted score from the shared inputs; slots
// without weights fall back to a single total input.

import { useState, useEffect, useMemo, useTransition, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CompareSlotPicker } from "./compare-slot-picker"
import { CompareScoreInput } from "./compare-score-input"
import { CompareTable } from "./compare-table"
import { CompareTrendChartLazy } from "./compare-trend-chart-lazy"
import { CompareShareButton } from "./compare-share-button"
import {
  getFacultyRequirementAction,
  getMultipleAnalysisAction,
  getFacultyMetaAction,
} from "@/server/actions"
import { weightsToSubjects, calculateWeightedScore } from "@/lib/subjects"
import { trackCompareAdd, trackCompareSubmit } from "@/lib/analytics"
import {
  readCompareState,
  writeCompareState,
  clearCompareState,
} from "@/features/compare/lib/storage"
import { COMPARE_MIN_SLOTS, COMPARE_MAX_SLOTS } from "@/types/tcas"
import type { University, AdmissionResult, RequirementData } from "@/types/tcas"
import { Plus, AlertTriangle, GitCompareArrows } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

interface FacultyOption {
  id:        string
  name:      string
  program:   string
  majorName?: string
  detail?:   string
}

interface SlotState {
  facultyId:    string | null
  facultyMeta:  FacultyOption | null
  universityId: string | null
  requirement:  RequirementData | null
}

interface CompareClientProps {
  universities: University[]
  filterYear?:  number
}

const emptySlot = (): SlotState => ({
  facultyId:    null,
  facultyMeta:  null,
  universityId: null,
  requirement:  null,
})

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export function CompareClient({ universities, filterYear }: CompareClientProps) {
  const searchParams = useSearchParams()

  const [slots,         setSlots]         = useState<SlotState[]>([emptySlot(), emptySlot()])
  const [subjectScores, setSubjectScores] = useState<Record<string, string>>({})
  const [fallbackScore, setFallbackScore] = useState("")
  const [results,       setResults]       = useState<(AdmissionResult | null)[]>([])
  const [error,         setError]         = useState("")
  const [hydrated,      setHydrated]      = useState(false)
  const [isAnalyzing,    startAnalyze]    = useTransition()

  // ── Hydrate from URL (?ids=a,b,c) or sessionStorage ─────────────────────────
  useEffect(() => {
    if (hydrated) return
    const urlIds = searchParams.get("ids")?.split(",").filter(Boolean) ?? []

    async function loadSlotFromId(facultyId: string): Promise<SlotState> {
      const meta = await getFacultyMetaAction(facultyId)
      if (!meta) return emptySlot()
      const requirement = await getFacultyRequirementAction(facultyId)
      return {
        facultyId,
        universityId: meta.universityId,
        facultyMeta: {
          id:        meta.id,
          name:      meta.name,
          program:   meta.program,
          majorName: meta.majorName,
          detail:    meta.detail,
        },
        requirement,
      }
    }

    async function hydrate() {
      // Prefer URL params over sessionStorage so a shared link wins.
      let ids: (string | null)[] = []
      let scoresFromStorage: Record<string, string> = {}
      let fallbackFromStorage = ""

      if (urlIds.length > 0) {
        ids = urlIds.slice(0, COMPARE_MAX_SLOTS)
      } else {
        const saved = readCompareState()
        if (saved) {
          ids = saved.facultyIds
          scoresFromStorage = saved.subjectScores
          fallbackFromStorage = saved.fallbackScore
        }
      }

      if (ids.length === 0) {
        setHydrated(true)
        return
      }

      // Pad to at least COMPARE_MIN_SLOTS
      while (ids.length < COMPARE_MIN_SLOTS) ids.push(null)

      const nextSlots: SlotState[] = await Promise.all(
        ids.map(async (id) => {
          if (!id) return emptySlot()
          return loadSlotFromId(id)
        })
      )

      setSlots(nextSlots)
      if (Object.keys(scoresFromStorage).length) setSubjectScores(scoresFromStorage)
      if (fallbackFromStorage) setFallbackScore(fallbackFromStorage)
      setHydrated(true)
    }

    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist slot state after every change ──────────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    writeCompareState({
      facultyIds:    slots.map((s) => s.facultyId),
      subjectScores,
      fallbackScore,
    })
  }, [hydrated, slots, subjectScores, fallbackScore])

  // ── Slot handlers ──────────────────────────────────────────────────────────

  const handleSlotChange = useCallback(
    (
      idx: number,
      next: {
        facultyId:      string | null
        facultyMeta:    FacultyOption | null
        universityId:   string | null
        universityName: string
      }
    ) => {
      setResults([])     // invalidate any previous result
      setError("")
      setSlots((prev) => {
        const copy = [...prev]
        copy[idx] = {
          facultyId:    next.facultyId,
          facultyMeta:  next.facultyMeta,
          universityId: next.universityId,
          requirement:  null,
        }
        return copy
      })
      if (next.facultyId && next.facultyMeta) {
        trackCompareAdd({
          slotIndex:      idx,
          universityName: next.universityName,
          facultyName:    next.facultyMeta.name,
        })
      }
    },
    []
  )

  // Load requirement whenever a slot's facultyId changes
  useEffect(() => {
    if (!hydrated) return
    slots.forEach((slot, idx) => {
      if (slot.facultyId && slot.requirement === null) {
        getFacultyRequirementAction(slot.facultyId).then((req) => {
          setSlots((prev) => {
            const copy = [...prev]
            // Guard: the slot's facultyId may have changed while we awaited
            if (copy[idx]?.facultyId !== slot.facultyId) return prev
            copy[idx] = { ...copy[idx], requirement: req }
            return copy
          })
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, hydrated])

  function handleAddSlot() {
    if (slots.length >= COMPARE_MAX_SLOTS) return
    setSlots((prev) => [...prev, emptySlot()])
  }

  function handleRemoveSlot(idx: number) {
    if (slots.length <= COMPARE_MIN_SLOTS) return
    setResults([])
    setError("")
    setSlots((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Score input change → invalidate results ────────────────────────────────
  const handleScoreChange = useCallback((code: string, value: string) => {
    setSubjectScores((prev) => ({ ...prev, [code]: value }))
    setResults([])
  }, [])

  const handleFallbackChange = useCallback((value: string) => {
    setFallbackScore(value)
    setResults([])
  }, [])

  // ── Derived: union of all subject codes + whether fallback needed ──────────
  const { unionSubjectCodes, needsFallback } = useMemo(() => {
    const codes = new Set<string>()
    let needsFallback = false
    for (const slot of slots) {
      if (!slot.facultyId) continue
      if (!slot.requirement || Object.keys(slot.requirement.weights).length === 0) {
        if (slot.facultyId) needsFallback = true
        continue
      }
      const subjects = weightsToSubjects(slot.requirement.weights)
      for (const s of subjects) {
        if (s.bestOf) {
          for (const c of s.bestOf.codes) codes.add(c)
        } else {
          codes.add(s.code)
        }
      }
    }
    return { unionSubjectCodes: Array.from(codes), needsFallback }
  }, [slots])

  // Ready to submit when:
  //  - At least COMPARE_MIN_SLOTS slots filled
  //  - Either subjectScores has ≥ 1 numeric input OR fallback is set
  const filledSlots   = slots.filter((s) => s.facultyId).length
  const hasAnyScore   = Object.values(subjectScores).some((v) => parseFloat(v) > 0)
  const hasFallback   = parseFloat(fallbackScore) > 0
  const allReqsLoaded = slots.every((s) => !s.facultyId || s.requirement !== null)
  const isReady       = filledSlots >= COMPARE_MIN_SLOTS && (hasAnyScore || hasFallback) && allReqsLoaded

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    setError("")
    const entries: { facultyId: string; userScore: number }[] = []
    const orderedSlots = slots.map((slot) => {
      if (!slot.facultyId || !slot.requirement) return { facultyId: null, score: 0 }

      const subjects = weightsToSubjects(slot.requirement.weights)
      if (subjects.length === 0) {
        const num = parseFloat(fallbackScore)
        return {
          facultyId: slot.facultyId,
          score:     isNaN(num) ? 0 : num,
        }
      }
      const score = calculateWeightedScore(subjects, subjectScores)
      return { facultyId: slot.facultyId, score }
    })

    let avgUserScore = 0
    let nonZero = 0
    for (const s of orderedSlots) {
      if (s.facultyId) entries.push({ facultyId: s.facultyId, userScore: s.score })
      if (s.score > 0) { avgUserScore += s.score; nonZero++ }
    }
    if (nonZero === 0) {
      setError("กรุณากรอกคะแนนอย่างน้อย 1 วิชา หรือคะแนนรวม")
      return
    }
    avgUserScore = avgUserScore / nonZero

    trackCompareSubmit({
      slotCount:  filledSlots,
      hasWeights: unionSubjectCodes.length > 0,
      userScore:  avgUserScore,
    })

    startAnalyze(async () => {
      const analyzed = await getMultipleAnalysisAction(entries)
      // Re-thread analyzed back into the slot order (entries skips empty slots)
      let cursor = 0
      const next: (AdmissionResult | null)[] = slots.map((s) =>
        s.facultyId ? analyzed[cursor++] ?? null : null
      )
      setResults(next)
    })
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function handleClearAll() {
    setSlots([emptySlot(), emptySlot()])
    setSubjectScores({})
    setFallbackScore("")
    setResults([])
    setError("")
    clearCompareState()
  }

  const hasAnyState = slots.some((s) => s.facultyId) || Object.keys(subjectScores).length > 0 || fallbackScore !== ""
  const filledFacultyIds = slots.map((s) => s.facultyId ?? "").filter(Boolean)
  const canShare = filledFacultyIds.length >= COMPARE_MIN_SLOTS

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end h-5">
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

      {/* Slot pickers grid */}
      <div className={cn(
        "grid gap-3 sm:grid-cols-2",
        slots.length >= 3 && "lg:grid-cols-3",
        slots.length >= 4 && "lg:grid-cols-4",
      )}>
        {slots.map((slot, idx) => (
          <CompareSlotPicker
            key={idx}
            index={idx}
            universities={universities}
            filterYear={filterYear}
            facultyId={slot.facultyId}
            initialUniversityId={slot.universityId}
            onChange={(next) => handleSlotChange(idx, next)}
            onRemove={slots.length > COMPARE_MIN_SLOTS ? () => handleRemoveSlot(idx) : undefined}
          />
        ))}
      </div>

      {/* Add slot button */}
      {slots.length < COMPARE_MAX_SLOTS && (
        <button
          type="button"
          onClick={handleAddSlot}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          เพิ่มช่องเปรียบเทียบ ({slots.length}/{COMPARE_MAX_SLOTS})
        </button>
      )}

      {/* Score input */}
      <CompareScoreInput
        subjectCodes={unionSubjectCodes}
        scores={subjectScores}
        onScoreChange={handleScoreChange}
        needsFallback={needsFallback}
        fallbackScore={fallbackScore}
        onFallbackChange={handleFallbackChange}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!isReady || isAnalyzing}
        className={cn(
          "w-full h-12 rounded-xl text-base font-semibold transition-all",
          isReady && !isAnalyzing
            ? "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2 text-gray-500">
            <Spinner />
            กำลังเปรียบเทียบ...
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-1.5">
            <GitCompareArrows className="h-4 w-4" />
            วิเคราะห์เปรียบเทียบ
          </span>
        )}
      </Button>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">ผลเปรียบเทียบ</h2>
            {canShare && <CompareShareButton facultyIds={filledFacultyIds} />}
          </div>

          {/* Hero: cross-faculty trend chart (skip if < 2 valid results) */}
          {results.filter((r): r is NonNullable<typeof r> => r !== null).length >= 2 && (
            <CompareTrendChartLazy
              results={results.filter((r): r is NonNullable<typeof r> => r !== null)}
            />
          )}

          <CompareTable
            slots={slots.map((s, i) => ({
              result: results[i] ?? null,
              reason: !s.facultyId
                ? "empty"
                : results[i] === null
                  ? "no_data"
                  : undefined,
            }))}
          />
        </div>
      )}
    </div>
  )
}
