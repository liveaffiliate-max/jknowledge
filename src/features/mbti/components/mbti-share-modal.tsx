"use client"

import { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"
import { Download, X, Image as ImageIcon, Loader2, Check } from "lucide-react"
import { useToast } from "@/components/ui/toaster"
import { MBTIShareableCard } from "./mbti-shareable-card"
import { getTopFacultiesAction } from "../actions/get-faculties"
import { trackMBTIShareOpen, trackMBTIImageDownload } from "@/lib/analytics"
import type { MBTIResult, MBTIProfile } from "@/types/mbti"
import type { MBTIFacultyMatch } from "@/server/mbti-queries"

interface Props {
  open:    boolean
  onClose: () => void
  result:  MBTIResult
  profile: MBTIProfile
}

type Variant = "story" | "square"

export function MBTIShareModal({ open, onClose, result, profile }: Props) {
  const [variant, setVariant]       = useState<Variant>("story")
  const [faculties, setFaculties]   = useState<MBTIFacultyMatch[]>([])
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load top faculties once when modal first opens
  useEffect(() => {
    if (!open || faculties.length > 0) return
    getTopFacultiesAction(result.type, 5)
      .then(setFaculties)
      .catch(() => { /* render without faculty list */ })
  }, [open, result.type, faculties.length])

  // Track open event
  useEffect(() => {
    if (open) trackMBTIShareOpen({ mbtiType: result.type, variant })
  }, [open, variant, result.type])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  async function handleDownload() {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust:    true,
        pixelRatio:   1, // card is already 1080px wide
        backgroundColor: "#ffffff",
      })
      const link = document.createElement("a")
      link.download = `jknowledge-mbti-${result.type}-${variant}.png`
      link.href = dataUrl
      link.click()
      trackMBTIImageDownload({ mbtiType: result.type, variant })
      toast("บันทึกรูปแล้ว — ดูในโฟลเดอร์ Downloads")
    } catch {
      toast("บันทึกรูปไม่สำเร็จ ลองอีกครั้ง")
    } finally {
      setDownloading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 motion-safe:animate-in motion-safe:fade-in duration-200">
      {/* Backdrop click closes */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl motion-safe:animate-in motion-safe:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-bold text-gray-900">บันทึกเป็นรูป</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 motion-safe:transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Variant tabs */}
        <div className="flex gap-2 border-b border-gray-100 px-5 py-3">
          {([
            { value: "story",  label: "Story (9:16)" },
            { value: "square", label: "Feed (1:1)"   },
          ] as { value: Variant; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVariant(opt.value)}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2 text-xs font-semibold motion-safe:transition-colors",
                variant === opt.value
                  ? "border-green-300 bg-green-50 text-green-800"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              {variant === opt.value && <Check className="mr-1 inline h-3 w-3" />}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Preview — scaled-down via CSS transform; actual capture uses the original */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="mx-auto" style={{
            width: variant === "story" ? "270px" : "400px",
            height: variant === "story" ? "480px" : "400px",
          }}>
            <div
              style={{
                transform: `scale(${variant === "story" ? 270 / 1080 : 400 / 1080})`,
                transformOrigin: "top left",
                width:  "1080px",
                height: variant === "story" ? "1920px" : "1080px",
              }}
            >
              <MBTIShareableCard
                ref={cardRef}
                result={result}
                profile={profile}
                faculties={faculties}
                variant={variant}
              />
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold text-sm motion-safe:transition-colors",
              "bg-green-600 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            )}
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังสร้างรูป…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                บันทึกรูปลงเครื่อง
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            จากนั้นแชร์ใน IG Story · TikTok · Twitter ได้เลย
          </p>
        </div>
      </div>
    </div>
  )
}
