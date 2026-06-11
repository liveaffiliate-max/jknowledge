"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { FileText, Loader2, Maximize2, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TCAS_FOLIO_PDF } from "@/features/tcas-folio/data/content"

// pdfjs-dist relies on browser-only APIs (e.g. DOMMatrix) — must not run during SSR.
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
      <PdfCanvasPreview fileUrl={pdf.fileUrl} maxWidth={320} />

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

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className={cn(buttonVariants({ size: "lg" }), "w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto")}
          >
            <Maximize2 className="h-4 w-4" />
            เปิดอ่านแบบเต็มจอ
          </button>
        </div>
      </div>

      {fullscreen && (
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
