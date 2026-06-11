"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

// Stable reference required by react-pdf — an inline object literal would be
// recreated on every render and force pdf.js to reload the whole document.
// `disableAutoFetch` stops pdf.js from greedily downloading the rest of the
// (101MB) file in the background after the first page renders.
const PDF_LOAD_OPTIONS = {
  disableAutoFetch: true,
  disableStream: false,
}

const PAGE_LOADING = (
  <div className="flex h-64 w-full items-center justify-center text-gray-400">
    <Loader2 className="h-5 w-5 animate-spin" />
  </div>
)

export function PdfCanvasPreview({ fileUrl, maxWidth = 320 }: { fileUrl: string; maxWidth?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [direction, setDirection] = useState<"next" | "prev">("next")

  function goToPage(next: number) {
    setDirection(next > pageNumber ? "next" : "prev")
    setPageNumber(next)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(maxWidth, entry.contentRect.width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [maxWidth])

  return (
    <div>
      <div ref={containerRef} className="flex justify-center overflow-hidden rounded-xl bg-gray-100 p-2">
        {width > 0 && (
          <Document
            file={fileUrl}
            options={PDF_LOAD_OPTIONS}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={PAGE_LOADING}
          >
            <div
              key={pageNumber}
              className={cn(
                direction === "next" ? "animate-page-slide-right" : "animate-page-slide-left"
              )}
            >
              <Page
                pageNumber={pageNumber}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={PAGE_LOADING}
              />
            </div>
          </Document>
        )}
      </div>

      {numPages > 0 && (
        <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-600">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, pageNumber - 1))}
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
            onClick={() => goToPage(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-30"
            aria-label="หน้าถัดไป"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
