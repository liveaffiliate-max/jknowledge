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
  pickQuestionsForSession,
  SESSION_TOTAL,
  updateProgress,
  type DimProgressMap,
} from "@/utils/mbti"
import { useSessionSeed } from "../hooks/use-session-seed"
import { MBTIResultCard } from "./mbti-result-card"
import { MBTIReveal } from "./mbti-reveal"
import { saveQuizResult } from "../actions/save-result"
import { trackMBTIStart, trackMBTIComplete, trackMBTIRestart } from "@/lib/analytics"
import type { MBTIAnswer, MBTIDimension, MBTIQuestion, MBTIResult } from "@/types/mbti"

// ── Scale config ──────────────────────────────────────────────────────────────

const SCALE = [
  { value: 1 as const, fill: "bg-green-600 text-white",    ring: "ring-green-500", passive: "bg-green-100 border-green-200" },
  { value: 2 as const, fill: "bg-green-300 text-green-900", ring: "ring-green-300", passive: "bg-green-50  border-green-100" },
  { value: 3 as const, fill: "bg-gray-400  text-white",    ring: "ring-gray-400",   passive: "bg-gray-100  border-gray-200"  },
  { value: 4 as const, fill: "bg-blue-300  text-blue-900", ring: "ring-blue-300",   passive: "bg-blue-50   border-blue-100"  },
  { value: 5 as const, fill: "bg-blue-600  text-white",    ring: "ring-blue-500",   passive: "bg-blue-100  border-blue-200"  },
]

// Permanent labels under each dot — matches the 5-point agree scale
const SCALE_LABEL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "เห็นด้วยมากที่สุด",
  2: "เห็นด้วย",
  3: "กลางๆ",
  4: "ไม่เห็นด้วย",
  5: "ไม่เห็นด้วยเลย",
}

const DIM_META: Record<MBTIDimension, { label: string; color: string; barColor: string }> = {
  EI: { label: "ด้านพลังงาน",   color: "text-blue-600",   barColor: "bg-blue-400" },
  SN: { label: "การรับรู้",     color: "text-amber-600",  barColor: "bg-amber-400" },
  TF: { label: "การตัดสินใจ",   color: "text-purple-600", barColor: "bg-purple-400" },
  JP: { label: "การใช้ชีวิต",   color: "text-green-600",  barColor: "bg-green-400" },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MBTIQuiz() {
  // Pool starts empty on SSR so the server renders an intro skeleton; the
  // useEffect below builds the per-session subset once the seed is known.
  const sessionSeed = useSessionSeed()
  const [pool, setPool]                   = useState<MBTIQuestion[]>([])
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
  const [resultId, setResultId]           = useState<string | undefined>(undefined)
  // transient dimension-complete celebration
  const [celebration, setCelebration]     = useState<{ dim: MBTIDimension; label: string } | null>(null)
  // intro screen before quiz starts
  const [started, setStarted]             = useState(false)

  const answeredCount = answered.length
  const currentQ      = pool.length > 0 ? pickNextQuestion(pool, progress) : null
  const overall       = overallConfidence(progress)
  const preview       = getPartialType(progress)
  // Question-count progress (1..TOTAL_QUESTIONS) — drives the bottom progress bar.
  // Confidence still drives the hero preview at top; the two metrics complement each other.
  // Session length is the stratified subset size (24), not the full pool (60).
  const totalQuestions = SESSION_TOTAL
  const questionProgress = Math.min(1, answeredCount / totalQuestions)
  // Key to trigger enter slide animation on each new question
  const [questionKey, setQuestionKey] = useState(0)
  // Ref to always-latest handleNext for auto-advance timer
  const handleNextRef = useRef<() => void>(() => {})

  // Build the per-session stratified subset once the seed is available.
  // The seed comes from Clerk userId (signed-in) or a persisted guest uuid —
  // same seed always yields the same 24 items in the same order, so retakes
  // are directly comparable.
  useEffect(() => {
    if (!sessionSeed) return
    if (pool.length > 0) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot session build
    setPool(pickQuestionsForSession(mbtiQuestions, sessionSeed))
  }, [sessionSeed, pool.length])

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

    // Single-statement format — likert 1=strongly agree (toward A-pole),
    // 5=strongly disagree (toward B-pole). isReverse flips polarity at scoring time.
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
          setResultId(id)
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

    // Reverse the progress contribution (prevA.likert is scoring value)
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
    // Same seed → same subset, so retake is directly comparable.
    setPool(sessionSeed ? pickQuestionsForSession(mbtiQuestions, sessionSeed) : [])
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
    setResultId(undefined)
    setCelebration(null)
  }

  // ── Result / reveal screens ───────────────────────────────────────────────────

  if (result) {
    return <MBTIResultCard result={result} onRestart={handleRestart} resultId={resultId} />
  }

  if (revealing && pendingResult) {
    return <MBTIReveal type={pendingResult.type} onDone={() => setResult(pendingResult)} />
  }

  if (!currentQ) return null

  // ── Intro screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-8">

          {/* Icon */}
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <Brain className="h-6 w-6 text-green-600" />
          </div>

          {/* Heading — show end state, not just the action */}
          <h2
            className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            รู้บุคลิก แล้วรับคำแนะนำคณะ
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            ระบบจะวิเคราะห์แนวคิดและวิธีมองโลกของคุณ แล้วแนะนำคณะที่เหมาะกับบุคลิกภาพนั้น
          </p>

          {/* Checklist — staggered fade-in */}
          <ul className="mb-6 space-y-2.5">
            {[
              "ใช้เวลา ~3 นาที ไม่ต้องเตรียมตัว",
              "ไม่มีคำตอบถูกหรือผิด — ตอบตามที่รู้สึกจริง",
              "รับคำแนะนำคณะพร้อมเหตุผลที่ตรงกับตัวคุณ",
            ].map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-gray-600 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
                style={{ animationDuration: "400ms", animationDelay: `${i * 130}ms`, animationFillMode: "both" }}
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                {item}
              </li>
            ))}
          </ul>

          {/* Scale explanation */}
          <div className="mb-7 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
            <p className="mb-3 text-xs font-medium text-gray-500">วิธีตอบแต่ละข้อ</p>
            <p className="mb-3 text-xs text-gray-500 leading-relaxed">
              แต่ละข้อมีประโยคหนึ่งประโยค เลือกระดับว่าตรงกับคุณแค่ไหน
            </p>
            {/* Mini scale preview — 5 dots with permanent labels */}
            {(() => {
              const previewDots = [
                { passive: "bg-green-200 border-green-400", label: "เห็นด้วย\nมากที่สุด" },
                { passive: "bg-green-100 border-green-300", label: "เห็นด้วย" },
                { passive: "bg-gray-200 border-gray-400",  label: "กลางๆ" },
                { passive: "bg-blue-100 border-blue-300",  label: "ไม่เห็นด้วย" },
                { passive: "bg-blue-200 border-blue-400",  label: "ไม่เห็นด้วย\nเลย" },
              ]
              return (
                <div className="flex items-start justify-between">
                  {previewDots.map((dot, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: "20%" }}>
                      <div className="flex items-center w-full">
                        <div className={cn("h-px flex-1", i > 0 ? "bg-gray-200" : "bg-transparent")} />
                        <div className={cn("h-8 w-8 flex-shrink-0 rounded-full border-2", dot.passive)} />
                        <div className={cn("h-px flex-1", i < 4 ? "bg-gray-200" : "bg-transparent")} />
                      </div>
                      <span className="w-full whitespace-pre-line text-center text-[10px] leading-tight text-gray-500">
                        {dot.label}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* CTA */}
          <button
            onClick={() => { setStarted(true); trackMBTIStart() }}
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 motion-safe:transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            เริ่มค้นหาบุคลิกของฉัน
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
        {/* Progress bar — based on question count (1..N), not confidence */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex items-center justify-end mb-1">
            <span className="text-[10px] text-gray-400 tabular-nums">
              {Math.round(questionProgress * 100)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-700 ease-out"
              style={{ width: `${Math.round(questionProgress * 100)}%` }}
            />
          </div>
        </div>

        {/* Adaptive framing + single statement */}
        <div className="px-6 pt-4 pb-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", meta.barColor)} />
            <span className="text-xs font-medium text-gray-400">
              ทำความเข้าใจ{meta.label}ของคุณ
            </span>
          </div>
          {/* Statement card — slightly larger to feel like the main focal point */}
          <div className="mt-1 rounded-xl bg-gray-50 px-5 py-5">
            <p className="text-center text-base font-semibold leading-relaxed text-gray-900 sm:text-lg">
              &ldquo;{currentQ.statement}&rdquo;
            </p>
          </div>
        </div>

        {/* ── 5-dot agree scale ── */}
        <div className="px-5 pb-6 pt-2">
          <div
            className="motion-safe:animate-in motion-safe:fade-in"
            style={{ animationDuration: "260ms", animationDelay: "200ms", animationFillMode: "both" }}
          >
            {/* Dots row */}
            <div className="flex items-center justify-center py-2">
              {SCALE.map((s, i) => {
                const isSelected = likert === s.value
                return (
                  <div key={s.value} className="flex items-center">
                    {i > 0 && (
                      <div className={cn(
                        "h-0.5 w-6 sm:w-10 transition-colors duration-300 ease-in-out",
                        likert && (
                          (s.value <= likert && SCALE[i - 1].value <= likert) ||
                          (s.value >= likert && SCALE[i - 1].value >= likert)
                        ) ? (likert <= 2 ? "bg-green-300" : likert >= 4 ? "bg-blue-300" : "bg-gray-300")
                          : "bg-gray-200"
                      )} />
                    )}
                    <button
                      type="button"
                      onClick={() => setLikert(s.value)}
                      aria-label={SCALE_LABEL[s.value]}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 sm:h-11 sm:w-11",
                        "motion-safe:transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out",
                        isSelected
                          ? cn("shadow-md scale-110", s.fill, s.ring.replace("ring-", "border-"))
                          : cn(s.passive, "hover:scale-110 hover:shadow-sm")
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

            {/* Permanent labels under each dot — sizes the visible scale */}
            <div className="mt-1 grid grid-cols-5 gap-1 px-1 text-center">
              {SCALE.map((s) => (
                <span
                  key={s.value}
                  className={cn(
                    "text-[10px] leading-tight motion-safe:transition-colors",
                    likert === s.value
                      ? (s.value <= 2 ? "font-semibold text-green-700" :
                         s.value >= 4 ? "font-semibold text-blue-700" : "font-semibold text-gray-700")
                      : "text-gray-400"
                  )}
                >
                  {SCALE_LABEL[s.value]}
                </span>
              ))}
            </div>
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
