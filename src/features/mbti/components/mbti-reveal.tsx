"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import type { MBTIType } from "@/types/mbti"

/** Short Thai descriptor revealed alongside each letter */
const LETTER_LABEL: Record<string, string> = {
  E: "ได้พลังจากผู้คน",
  I: "ได้พลังจากโลกภายใน",
  S: "ยึดความเป็นจริง",
  N: "เชื่อในสัญชาตญาณ",
  T: "ตัดสินด้วยเหตุผล",
  F: "ตัดสินด้วยความรู้สึก",
  J: "ชอบความเป็นระเบียบ",
  P: "ยืดหยุ่นเปิดกว้าง",
}

const FIRST_DELAY = 700   // pause before first letter
const STEP        = 650   // gap between letters
const MERGE_GAP   = 500   // pause before letters merge into the type
const HOLD        = 1100  // hold the final type before handing off to the card

interface MBTIRevealProps {
  type:   MBTIType
  onDone: () => void
}

/**
 * Cinematic result reveal — builds anticipation before the result card.
 *  1. "กำลังสรุปบุคลิกของคุณ…"
 *  2. each letter fades in one-by-one with its descriptor
 *  3. the four letters merge into the final type with a glow
 */
export function MBTIReveal({ type, onDone }: MBTIRevealProps) {
  const letters = type.split("")
  const [revealed, setRevealed] = useState(0)   // count of letters shown so far
  const [merged, setMerged]     = useState(false)

  // keep latest onDone without re-triggering the timeline
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= 4; i++) {
      timers.push(setTimeout(() => setRevealed(i), FIRST_DELAY + i * STEP))
    }
    const mergeAt = FIRST_DELAY + 4 * STEP + MERGE_GAP
    timers.push(setTimeout(() => setMerged(true), mergeAt))
    timers.push(setTimeout(() => onDoneRef.current(), mergeAt + HOLD))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium text-green-700 transition-opacity duration-500",
          merged ? "opacity-0" : "opacity-100"
        )}
      >
        <Sparkles className="h-4 w-4 animate-pulse" />
        กำลังสรุปบุคลิกของคุณ…
      </p>

      {/* Letters */}
      <div
        className={cn(
          "mt-8 flex items-start justify-center transition-all duration-500",
          merged ? "gap-0" : "gap-3"
        )}
      >
        {letters.map((ch, i) => {
          const shown = i < revealed
          return (
            <div key={i} className="flex w-16 flex-col items-center">
              <span
                className={cn(
                  "font-black tracking-tight transition-all duration-500",
                  merged ? "text-5xl text-green-600" : "text-5xl",
                  shown
                    ? "scale-100 text-green-600 opacity-100 blur-0"
                    : "scale-75 text-gray-300 opacity-40 blur-[2px]"
                )}
              >
                {shown ? ch : "?"}
              </span>
              {!merged && (
                <span
                  className={cn(
                    "mt-2 text-[10px] leading-tight text-gray-500 transition-all duration-500",
                    shown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  )}
                >
                  {shown ? LETTER_LABEL[ch] : ""}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {merged && (
        <p className="mt-6 animate-pulse text-sm font-semibold text-gray-500">
          คุณคือ…
        </p>
      )}
    </div>
  )
}
