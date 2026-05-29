"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, AlertCircle } from "lucide-react"
import { mbtiQuestions } from "@/data/mbti-questions"
import {
  computeMBTIResult,
  canFinishEarly,
  getPartialType,
  initialProgress,
  isNeutralSpamming,
  newlyCompletedDimensions,
  overallConfidence,
  pickNextQuestion,
  shuffleArray,
  updateProgress,
  type DimProgressMap,
} from "@/utils/mbti"
import { MBTIResultCard } from "./mbti-result-card"
import { MBTIReveal } from "./mbti-reveal"
import { saveQuizResult } from "../actions/save-result"
import type { MBTIAnswer, MBTIDimension, MBTIQuestion, MBTIResult } from "@/types/mbti"

// ── Scale config ──────────────────────────────────────────────────────────────

const SCALE = [
  { value: 1 as const, label: "ตรงมาก",    fill: "bg-green-600 text-white",   ring: "ring-green-500" },
  { value: 2 as const, label: "ค่อนข้างตรง", fill: "bg-green-300 text-green-900", ring: "ring-green-300" },
  { value: 3 as const, label: "กลาง ๆ",    fill: "bg-gray-400  text-white",   ring: "ring-gray-400" },
  { value: 4 as const, label: "ค่อนข้างตรง", fill: "bg-blue-300  text-blue-900",  ring: "ring-blue-300" },
  { value: 5 as const, label: "ตรงมาก",    fill: "bg-blue-600  text-white",   ring: "ring-blue-500" },
]

const DIM_META: Record<MBTIDimension, { label: string; color: string; barColor: string }> = {
  EI: { label: "ด้านพลังงาน",   color: "text-blue-600",   barColor: "bg-blue-400" },
  SN: { label: "การรับรู้",     color: "text-amber-600",  barColor: "bg-amber-400" },
  TF: { label: "การตัดสินใจ",   color: "text-purple-600", barColor: "bg-purple-400" },
  JP: { label: "การใช้ชีวิต",   color: "text-green-600",  barColor: "bg-green-400" },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MBTIQuiz() {
  // Start unshuffled so SSR and first client render match; shuffle after mount.
  const [pool, setPool]                   = useState<MBTIQuestion[]>(() => [...mbtiQuestions])
  const [answered, setAnswered]           = useState<MBTIAnswer[]>([])
  const [progress, setProgress]           = useState<DimProgressMap>(initialProgress)
  const [likert, setLikert]               = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [animating, setAnimating]         = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState<number>(() => Date.now())
  // Tracks when the quiz session started (for durationMs)
  const quizStartTimeRef = useRef<number>(Date.now())
  // result flow
  const [revealing, setRevealing]         = useState(false)
  const [pendingResult, setPendingResult] = useState<MBTIResult | null>(null)
  const [result, setResult]               = useState<MBTIResult | null>(null)
  // transient dimension-complete celebration
  const [celebration, setCelebration]     = useState<{ dim: MBTIDimension; label: string } | null>(null)

  const answeredCount = answered.length
  const currentQ      = pool.length > 0 ? pickNextQuestion(pool, progress) : null
  const overall       = overallConfidence(progress)
  const preview       = getPartialType(progress)

  // Shuffle once after mount — randomness isn't available at SSR, so shuffling
  // here (not in useState init) keeps the first client render matching the server.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only randomisation
    setPool((p) => shuffleArray(p))
  }, [])

  // Auto-clear celebration toast
  useEffect(() => {
    if (!celebration) return
    const t = setTimeout(() => setCelebration(null), 1900)
    return () => clearTimeout(t)
  }, [celebration])

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleNext() {
    if (!likert || !currentQ || animating) return

    const weight    = currentQ.weight    ?? 1.0
    const isReverse = currentQ.isReverse ?? false

    const newAnswer: MBTIAnswer = {
      questionId:     currentQ.id,
      dimension:      currentQ.dimension,
      likert,
      weight,
      isReverse,
      responseTimeMs: Date.now() - questionStartTime,
    }
    const newAnswers  = [...answered, newAnswer]
    const newPool     = pool.filter((q) => q.id !== currentQ.id)
    const newProgress = updateProgress(progress, currentQ.dimension, likert, weight, isReverse)
    const completed   = newlyCompletedDimensions(progress, newProgress)

    // Auto-finish: enough confidence OR ran out of questions → cinematic reveal
    if (newPool.length === 0 || canFinishEarly(newProgress)) {
      const mbtiResult = computeMBTIResult(newAnswers)
      setAnswered(newAnswers)
      setProgress(newProgress)
      setPendingResult(mbtiResult)
      setRevealing(true)

      // Fire-and-forget save — don't block the reveal animation
      const durationMs = Date.now() - quizStartTimeRef.current
      saveQuizResult({ result: mbtiResult, answers: newAnswers, durationMs })
        .then((id) => {
          try { localStorage.setItem("mbti_result_id", id) } catch { /* storage blocked */ }
        })
        .catch(console.error)

      return
    }

    setAnimating(true)
    setTimeout(() => {
      setAnswered(newAnswers)
      setPool(newPool)
      setProgress(newProgress)
      setLikert(null)
      setQuestionStartTime(Date.now())
      setAnimating(false)
      if (completed.length > 0) {
        const dim = completed[0]
        setCelebration({ dim, label: DIM_META[dim].label })
      }
    }, 180)
  }

  function handleRestart() {
    setPool(shuffleArray([...mbtiQuestions]))
    setAnswered([])
    setProgress(initialProgress())
    setLikert(null)
    setAnimating(false)
    setQuestionStartTime(Date.now())
    quizStartTimeRef.current = Date.now()
    setRevealing(false)
    setPendingResult(null)
    setResult(null)
    setCelebration(null)
  }

  // ── Result / reveal screens ───────────────────────────────────────────────────

  if (result) {
    return <MBTIResultCard result={result} onRestart={handleRestart} />
  }

  if (revealing && pendingResult) {
    return <MBTIReveal type={pendingResult.type} onDone={() => setResult(pendingResult)} />
  }

  if (!currentQ) return null

  const meta = DIM_META[currentQ.dimension]

  // Option card style based on selection
  const aHighlight =
    likert === 1 ? "border-green-500 bg-green-50 ring-1 ring-green-400"
    : likert === 2 ? "border-green-300 bg-green-50/60"
    : "border-gray-200 bg-white"
  const bHighlight =
    likert === 5 ? "border-blue-500 bg-blue-50 ring-1 ring-blue-400"
    : likert === 4 ? "border-blue-300 bg-blue-50/60"
    : "border-gray-200 bg-white"

  return (
    <div className="mx-auto max-w-xl">

      {/* ── Live personality preview (hero) ───────────────────────────────── */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50/50 to-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500">กำลังวิเคราะห์บุคลิก…</span>
          <span className="text-xs font-semibold text-green-700">ความมั่นใจ {Math.round(overall * 100)}%</span>
        </div>

        {/* 4 letters */}
        <div className="flex justify-center gap-3">
          {preview.map((p) => {
            const opacity = p.letter === "?" ? 0.35 : Math.max(0.45, p.confidence)
            return (
              <div key={p.dimension} className="flex w-16 flex-col items-center gap-1.5">
                <div className="relative">
                  <span
                    className={cn(
                      "text-3xl font-black tracking-tight transition-all duration-300",
                      p.solid ? "text-green-600" : p.letter === "?" ? "text-gray-300" : "text-gray-600"
                    )}
                    style={{ opacity }}
                  >
                    {p.letter}
                  </span>
                  {p.solid && (
                    <Check className="absolute -right-2.5 -top-1 h-3.5 w-3.5 text-green-500" />
                  )}
                </div>
                {/* per-letter confidence bar */}
                <div className="h-1 w-10 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      p.solid ? "bg-green-500" : DIM_META[p.dimension].barColor
                    )}
                    style={{ width: `${Math.round(p.confidence * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* overall confidence bar */}
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.round(overall * 100)}%` }}
          />
        </div>
      </div>

      {/* ── Dimension-complete celebration ────────────────────────────────── */}
      {celebration && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
          <Check className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-xs font-semibold text-green-800">
            เข้าใจ{celebration.label}ของคุณแล้ว
          </span>
        </div>
      )}

      {/* ── Neutral spam warning ──────────────────────────────────────────── */}
      {isNeutralSpamming(answered) && (
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-800">เลือก &ldquo;กลาง ๆ&rdquo; บ่อยเกินไปนะ</p>
            <p className="mt-0.5 text-[11px] text-amber-600">ลองเลือกข้างที่ตรงกับตัวคุณมากกว่า เพื่อผลที่แม่นยำขึ้น</p>
          </div>
        </div>
      )}

      {/* ── Question card ────────────────────────────────────────────────── */}
      <div
        className={cn(
          "rounded-2xl border border-gray-200 bg-white shadow-sm transition-opacity duration-200",
          animating ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Adaptive framing + question */}
        <div className="px-6 pt-5 pb-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", meta.barColor)} />
            <span className="text-[11px] font-medium text-gray-400">
              ข้อที่ {answeredCount + 1} · ทำความเข้าใจ{meta.label}ของคุณ
            </span>
          </div>
          <p className="text-base font-semibold leading-snug text-gray-900">
            {currentQ.text}
          </p>
        </div>

        <div className="px-4 pb-6 space-y-2">
          {/* Option A */}
          <div className={cn("rounded-xl border-2 px-4 py-3 transition-all duration-150", aHighlight)}>
            <div className="flex items-start gap-2.5">
              <span className={cn(
                "mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                likert && likert <= 2 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
              )}>A</span>
              <p className="text-sm leading-snug text-gray-700">{currentQ.optionA}</p>
            </div>
          </div>

          {/* Scale */}
          <div className="py-1">
            <div className="mb-2 flex justify-between px-1 text-[10px] text-gray-400">
              <span>← ตรงกับ A มากกว่า</span>
              <span>ตรงกับ B มากกว่า →</span>
            </div>
            <div className="flex justify-center gap-2">
              {SCALE.map((s) => {
                const isSelected = likert === s.value
                return (
                  <button
                    key={s.value}
                    onClick={() => setLikert(s.value)}
                    className="group flex flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-150",
                        isSelected
                          ? cn(s.fill, s.ring, "scale-110 shadow-md ring-2 ring-offset-1")
                          : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-gray-100 group-hover:scale-105"
                      )}
                    >
                      {isSelected ? "✓" : s.value}
                    </span>
                    <span className={cn(
                      "w-10 text-center text-[9px] leading-tight",
                      isSelected ? "font-medium text-gray-600" : "text-gray-300"
                    )}>
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Option B */}
          <div className={cn("rounded-xl border-2 px-4 py-3 transition-all duration-150", bHighlight)}>
            <div className="flex items-start gap-2.5">
              <span className={cn(
                "mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                likert && likert >= 4 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
              )}>B</span>
              <p className="text-sm leading-snug text-gray-700">{currentQ.optionB}</p>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={!likert}
            className={cn(
              "mt-3 h-11 w-full rounded-xl text-sm font-semibold transition-all duration-150",
              likert
                ? "bg-green-600 text-white shadow-sm hover:bg-green-700"
                : "cursor-not-allowed bg-gray-100 text-gray-300"
            )}
          >
            ถัดไป →
          </button>
        </div>
      </div>
    </div>
  )
}
