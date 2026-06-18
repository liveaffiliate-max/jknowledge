"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import manifest from "@/features/tcas-folio/data/pages-manifest.json"

const PRELOAD_NEIGHBORS = 1 // preload n-1 and n+1 to make nav feel instant

type Link = { url: string; left: number; top: number; width: number; height: number }

export function PdfImageGallery({ maxWidth = 800 }: { maxWidth?: number }) {
  const { numPages, width, height, basePath } = manifest
  const pageLinks = (manifest as { pageLinks?: Record<string, Link[]> }).pageLinks ?? {}
  const aspectRatio = width && height ? width / height : 1 / 1.414
  const [pageNumber, setPageNumber] = useState(1)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [loaded, setLoaded] = useState<Record<number, boolean>>({ 1: false })
  const containerRef = useRef<HTMLDivElement>(null)

  function goToPage(next: number) {
    if (next < 1 || next > numPages || next === pageNumber) return
    setDirection(next > pageNumber ? "next" : "prev")
    setPageNumber(next)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goToPage(pageNumber + 1)
      else if (e.key === "ArrowLeft") goToPage(pageNumber - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [pageNumber, numPages])

  if (numPages === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
        ยังไม่ได้ render หน้า PDF — ลองรัน <code className="mx-1">npm run render:tcas-folio</code>
      </div>
    )
  }

  const pagesToRender = new Set<number>([pageNumber])
  for (let d = 1; d <= PRELOAD_NEIGHBORS; d++) {
    if (pageNumber - d >= 1) pagesToRender.add(pageNumber - d)
    if (pageNumber + d <= numPages) pagesToRender.add(pageNumber + d)
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative mx-auto w-full overflow-hidden rounded-xl bg-gray-100"
        style={{ maxWidth, aspectRatio }}
      >
        {Array.from(pagesToRender).map((p) => {
          const isActive = p === pageNumber
          return (
            <img
              key={p}
              src={`${basePath}/${p}.webp`}
              alt={`หน้า ${p}`}
              width={width}
              height={height}
              loading={isActive ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={isActive ? "high" : "low"}
              onLoad={() => setLoaded((s) => ({ ...s, [p]: true }))}
              className={
                isActive
                  ? `absolute inset-0 h-full w-full object-contain ${
                      direction === "next" ? "animate-page-slide-right" : "animate-page-slide-left"
                    }`
                  : "pointer-events-none absolute inset-0 h-0 w-0 opacity-0"
              }
            />
          )
        })}
        {!loaded[pageNumber] && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {(pageLinks[String(pageNumber)] ?? []).map((link, i) => (
          <a
            key={`${pageNumber}-${i}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.url}
            className="absolute rounded-md ring-2 ring-transparent transition-colors hover:bg-green-500/10 hover:ring-green-500/60 focus-visible:bg-green-500/10 focus-visible:ring-green-500/60 focus-visible:outline-none"
            style={{
              left: `${link.left * 100}%`,
              top: `${link.top * 100}%`,
              width: `${link.width * 100}%`,
              height: `${link.height * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-600">
        <button
          type="button"
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-30"
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>
          หน้า {pageNumber} / {numPages}
        </span>
        <button
          type="button"
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
          className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-30"
          aria-label="หน้าถัดไป"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
