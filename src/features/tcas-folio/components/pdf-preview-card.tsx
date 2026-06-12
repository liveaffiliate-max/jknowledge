"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Download, FileText, Loader2, Lock, Maximize2, X } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TCAS_FOLIO_PDF } from "@/features/tcas-folio/data/content"

const SIGN_IN_HREF = "/sign-in?redirect_url=/tcas-folio"

// pdfjs-dist relies on browser-only APIs (e.g. DOMMatrix) — must not run during SSR.
// Only imported when user actually opens fullscreen, so locked / in-tab visitors
// never pay the cost of fetching the 100MB+ PDF or the pdf.js worker bundle.
const PdfCanvasPreview = dynamic(
  () => import("@/features/tcas-folio/components/pdf-canvas-preview").then((m) => m.PdfCanvasPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    ),
  }
)

export function PdfPreviewCard({ pdf }: { pdf: typeof TCAS_FOLIO_PDF }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0) // 0-100; 0 when total unknown
  const { isSignedIn, isLoaded } = useAuth()
  const locked = isLoaded && !isSignedIn

  async function handleDownload() {
    if (downloading) return
    setDownloading(true)
    setProgress(0)
    try {
      const res = await fetch(pdf.fileUrl)
      if (!res.ok || !res.body) throw new Error("fetch failed")
      const total = Number(res.headers.get("Content-Length")) || 0
      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        if (total) setProgress(Math.round((received / total) * 100))
      }
      const blob = new Blob(chunks as BlobPart[], { type: res.headers.get("Content-Type") ?? "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${pdf.title}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      window.open(pdf.fileUrl, "_blank", "noopener,noreferrer")
    } finally {
      setDownloading(false)
      setProgress(0)
    }
  }

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen])

  return (
    <div>
      {/* In-tab cover — a lightweight placeholder. The real PDF is loaded only
          when the user opens fullscreen (or is required to sign in first). */}
      <CoverCard
        title={pdf.title}
        locked={locked}
        onOpen={() => setFullscreen(true)}
      />

      <div className="pt-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
            <FileText className="h-4.5 w-4.5 text-green-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{pdf.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{pdf.description}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              PDF · {pdf.fileSizeLabel}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-row flex-wrap gap-2">
          {locked ? (
            <Link
              href={SIGN_IN_HREF}
              className={cn(buttonVariants({ size: "lg" }), "w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto")}
            >
              <Lock className="h-4 w-4" />
              เข้าสู่ระบบเพื่ออ่านเอกสาร
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className={cn(buttonVariants({ size: "lg" }), "flex-1 bg-green-600 px-3 text-white hover:bg-green-700")}
              >
                <Maximize2 className="h-4 w-4" />
                เปิดอ่านแบบเต็มจอ
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "relative flex-1 overflow-hidden border-green-600 px-3 text-green-700 hover:bg-green-50 disabled:opacity-90")}
              >
                {downloading && progress > 0 && (
                  <span
                    className="absolute inset-y-0 left-0 bg-green-100 transition-[width] duration-150"
                    style={{ width: `${progress}%` }}
                    aria-hidden
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {downloading
                    ? progress > 0
                      ? `กำลังดาวน์โหลด ${progress}%`
                      : "กำลังเริ่มดาวน์โหลด..."
                    : "ดาวน์โหลด PDF"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {fullscreen && !locked && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 motion-safe:animate-in motion-safe:fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="truncate pr-4 text-sm font-semibold text-white">{pdf.title}</h3>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="flex-shrink-0 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="ปิด"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 pb-4">
            <PdfCanvasPreview fileUrl={pdf.fileUrl} maxWidth={800} />
          </div>
        </div>
      )}
    </div>
  )
}

function CoverCard({
  title,
  locked,
  onOpen,
}: {
  title: string
  locked: boolean
  onOpen: () => void
}) {
  const inner = (
    <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-6 text-center transition-colors group-hover:from-green-100 group-hover:to-emerald-200">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
        {locked ? (
          <Lock className="h-6 w-6 text-green-700" />
        ) : (
          <FileText className="h-6 w-6 text-green-700" />
        )}
      </div>
      <p className="line-clamp-3 text-sm font-medium text-green-900/80">{title}</p>
      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-green-700">
        {locked ? "เข้าสู่ระบบเพื่ออ่าน" : "แตะเพื่อเปิดอ่าน"}
      </span>
    </div>
  )

  if (locked) {
    return (
      <Link
        href={SIGN_IN_HREF}
        aria-label="เข้าสู่ระบบเพื่ออ่านเอกสาร"
        className="group block"
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="เปิดอ่านแบบเต็มจอ"
      className="group block w-full"
    >
      {inner}
    </button>
  )
}
