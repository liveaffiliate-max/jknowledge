"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, AlertCircle, Brain, ArrowRight } from "lucide-react"
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
import { trackMBTIStart, trackMBTIComplete, trackMBTIRestart } from "@/lib/analytics"
import type { MBTIAnswer, MBTIDimension, MBTIQuestion, MBTIResult } from "@/types/mbti"

// ── Scale config ──────────────────────────────────────────────────────────────

const SCALE = [
  { value: 1 as const, fill: "bg-green-600 text-white",   ring: "ring-green-500" },
  { value: 2 as const, fill: "bg-green-300 text-green-900", ring: "ring-green-300" },
  { value: 3 as const, fill: "bg-gray-400  text-white",   ring: "ring-gray-400" },
  { value: 4 as const, fill: "bg-blue-300  text-blue-900",  ring: "ring-blue-300" },
  { value: 5 as const, fill: "bg-blue-600  text-white",   ring: "ring-blue-500" },
]

// (spectrum slider removed — using simple 5-dot layout with smooth transitions)

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
  // intro screen before quiz starts
  const [started, setStarted]             = useState(false)

  const answeredCount = answered.length
  const currentQ      = pool.length > 0 ? pickNextQuestion(pool, progress) : null
  const overall       = overallConfidence(progress)
  const preview       = getPartialType(progress)
  // Key to trigger enter slide animation on each new question
  const [questionKey, setQuestionKey] = useState(0)
  // Ref to always-latest handleNext for auto-advance timer
  const handleNextRef = useRef<() => void>(() => {})

  // Shuffle once after mount — randomness isn't available at SSR, so shuffling
  // here (not in useState init) keeps the first client render matching the server.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only randomisation
    setPool((p) => shuffleArray(p))
  }, [])

  // Keep handleNextRef up-to-date every render
  useEffect(() => { handleNextRef.current = handleNext })

  // Keyboard shortcuts: 1-5 → select likert, Enter → next
  useEffect(() => {
    if (!started || revealing || result) return
    function onKey(e: KeyboardEvent) {
      const n = parseInt(e.key)
      if (n >= 1 && n <= 5) {
        setLikert(n as 1 | 2 | 3 | 4 | 5)
      } else if (e.key === "Enter" && likert) {
        handleNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleNext depends on many states
  }, [started, revealing, result, likert])

  // Auto-clear celebration toast
  useEffect(() => {
    if (!celebration) return
    const t = setTimeout(() => setCelebration(null), 1900)
    return () => clearTimeout(t)
  }, [celebration])

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Track previously answered questions for "go back"
  const [history, setHistory] = useState<{ question: MBTIQuestion; answer: MBTIAnswer }[]>([])

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
      setHistory((h) => [...h, { question: currentQ, answer: newAnswer }])
      setPendingResult(mbtiResult)
      setRevealing(true)

      // Fire-and-forget save — don't block the reveal animation
      const durationMs = Date.now() - quizStartTimeRef.current
      trackMBTIComplete({
        type:              mbtiResult.type,
        durationSec:       Math.round(durationMs / 1000),
        questionsAnswered: newAnswers.length,
      })
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
      setHistory((h) => [...h, { question: currentQ, answer: newAnswer }])
      setLikert(null)
      setQuestionStartTime(Date.now())
      setQuestionKey((k) => k + 1)
      setAnimating(false)
      if (completed.length > 0) {
        const dim = completed[0]
        setCelebration({ dim, label: DIM_META[dim].label })
      }
    }, 180)
  }

  function handleBack() {
    if (history.length === 0 || animating) return
    const prev = history[history.length - 1]
    const { question: prevQ, answer: prevA } = prev

    // Reverse the progress contribution
    const direction = prevA.isReverse ? -1 : 1
    const contribution = [0, 2, 1, 0, -1, -2][prevA.likert] * direction * prevA.weight
    const dim = prevA.dimension
    const p = progress[dim]

    setHistory((h) => h.slice(0, -1))
    setAnswered((a) => a.slice(0, -1))
    setPool((pool) => [...pool, prevQ])
    setProgress({
      ...progress,
      [dim]: {
        answered:    p.answered - 1,
        net:         p.net - contribution,
        maxPossible: p.maxPossible - prevA.weight * 2,
      },
    })
    setLikert(prevA.likert)
    setQuestionStartTime(Date.now())
  }

  function handleRestart() {
    trackMBTIRestart()
    setPool(shuffleArray([...mbtiQuestions]))
    setAnswered([])
    setProgress(initialProgress())
    setHistory([])
    setStarted(false)
    setLikert(null)
    setQuestionKey(0)
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

  // ── Intro screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-gray-200 bg-green-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <Brain className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">พร้อมค้นหาตัวเองแล้วหรือยัง?</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-2">
            ตอบคำถามสั้น ๆ เกี่ยวกับตัวคุณ ระบบจะวิเคราะห์บุคลิกภาพ
            <br />พร้อมแนะนำคณะที่เหมาะสม
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["ใช้เวลา ~3 นาที", "ไม่มีคำตอบถูก/ผิด", "ตอบตามใจจริง"].map((tag) => (
              <span key={tag} className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => { setStarted(true); trackMBTIStart() }}
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 text-sm font-semibold text-white shadow-sm hover:bg-green-700 motion-safe:transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            เริ่มทำแบบทดสอบ
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const meta = DIM_META[currentQ.dimension]

  return (
    <div className="relative mx-auto max-w-xl">

      {/* ── Celebration toast — absolute overlay, zero layout shift ──── */}
      {celebration && (
        <div className="absolute -top-2 inset-x-0 z-20 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 duration-300 pointer-events-none">
          <Check className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-xs font-semibold text-green-800">
            เข้าใจ{celebration.label}ของคุณแล้ว
          </span>
        </div>
      )}

      {/* ── Live personality preview (hero) ───────────────────────────────── */}
      <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500">กำลังวิเคราะห์บุคลิก…</span>
          {/* Hide % until first answer — "0%" at start looks like an error */}
          {answeredCount > 0 && (
            <span className="text-xs font-semibold text-green-700">ความมั่นใจ {Math.round(overall * 100)}%</span>
          )}
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

      {/* ── Neutral spam warning ──────────────────────────────────────────── */}
      {isNeutralSpamming(answered) && (
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-800">เลือก &ldquo;กลาง ๆ&rdquo; บ่อยเกินไปนะ</p>
            <p className="mt-0.5 text-xs text-amber-600">ลองเลือกข้างที่ตรงกับตัวคุณมากกว่า เพื่อผลที่แม่นยำขึ้น</p>
          </div>
        </div>
      )}

      {/* ── Question card ────────────────────────────────────────────────── */}
      <div
        key={questionKey}
        className={cn(
          "rounded-2xl border border-gray-200 bg-white shadow-sm",
          animating
            ? "motion-safe:transition-all motion-safe:duration-200 motion-safe:opacity-0 motion-safe:translate-x-4 motion-safe:scale-[0.98]"
            : "motion-safe:animate-in motion-safe:slide-in-from-left-3 motion-safe:fade-in duration-200"
        )}
      >
        {/* Adaptive framing + question */}
        <div className="px-6 pt-5 pb-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", meta.barColor)} />
            <span className="text-xs font-medium text-gray-400">
              ข้อที่ {answeredCount + 1} · ทำความเข้าใจ{meta.label}ของคุณ
            </span>
          </div>
          <p className="text-base font-semibold leading-snug text-gray-900">
            {currentQ.text}
          </p>
        </div>

        {/* ── Spectrum layout (vertical on mobile, horizontal on desktop) */}
        <div className="px-5 pb-6 pt-2 space-y-3">

          {/* Option A label */}
          <button
            type="button"
            onClick={() => setLikert(1)}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-left text-sm leading-snug motion-safe:transition-[background-color,border-color,color] duration-150 cursor-pointer border outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1",
              likert && likert <= 2
                ? "border-green-300 bg-green-50 text-green-800 font-medium"
                : "border-gray-100 text-gray-700 hover:bg-gray-50"
            )}
          >
            {currentQ.optionA}
          </button>

          {/* 5 spectrum dots with connecting line */}
          <div className="flex items-center justify-center py-2">
            {SCALE.map((s, i) => {
              const isSelected = likert === s.value
              return (
                <div key={s.value} className="flex items-center">
                  {i > 0 && (
                    <div className={cn(
                      "h-0.5 w-6 sm:w-8 transition-colors duration-300 ease-in-out",
                      (likert && (
                        (s.value <= likert && SCALE[i - 1].value <= likert) ||
                        (s.value >= likert && SCALE[i - 1].value >= likert)
                      )) ? (likert <= 2 ? "bg-green-300" : likert >= 4 ? "bg-blue-300" : "bg-gray-300")
                        : "bg-gray-200"
                    )} />
                  )}
                  <button
                    type="button"
                    onClick={() => setLikert(s.value)}
                    aria-label={
                      s.value === 1 ? `เห็นด้วยกับตัวเลือกแรกมากที่สุด` :
                      s.value === 2 ? `ค่อนข้างเห็นด้วยกับตัวเลือกแรก` :
                      s.value === 3 ? `กลางๆ ไม่ได้โน้มเอียง` :
                      s.value === 4 ? `ค่อนข้างเห็นด้วยกับตัวเลือกที่สอง` :
                      `เห็นด้วยกับตัวเลือกที่สองมากที่สุด`
                    }
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border-2",
                      "motion-safe:transition-[background-color,border-color,box-shadow] duration-300 ease-in-out",
                      isSelected
                        ? cn("shadow-lg", s.fill, s.ring.replace("ring-", "border-"))
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Option B label */}
          <button
            type="button"
            onClick={() => setLikert(5)}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-left text-sm leading-snug motion-safe:transition-[background-color,border-color,color] duration-150 cursor-pointer border outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1",
              likert && likert >= 4
                ? "border-blue-300 bg-blue-50 text-blue-800 font-medium"
                : "border-gray-100 text-gray-700 hover:bg-gray-50"
            )}
          >
            {currentQ.optionB}
          </button>

          {/* Scale hint */}
          <div className="flex justify-between px-1 text-xs text-gray-400">
            <span>← ตัวเลือกแรก</span>
            <span>ตัวเลือกที่สอง →</span>
          </div>

          {/* Back + Next — back always rendered to prevent layout shift */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={history.length === 0}
              aria-hidden={history.length === 0 ? "true" : undefined}
              className={cn(
                "h-11 px-4 rounded-xl text-sm font-medium motion-safe:transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1",
                history.length > 0
                  ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  : "invisible"
              )}
            >
              ← ย้อน
            </button>
            <button
              onClick={handleNext}
              disabled={!likert}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold motion-safe:transition-[background-color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1",
                likert
                  ? "bg-green-600 text-white shadow-sm hover:bg-green-700"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              )}
            >
              {likert ? (
                <>ถัดไป <ArrowRight className="h-4 w-4" /></>
              ) : "เลือกคำตอบก่อน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
