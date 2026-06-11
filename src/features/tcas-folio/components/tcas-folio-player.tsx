"use client"

import { useState } from "react"
import { Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { VideoFacade } from "@/features/tcas-folio/components/video-facade"
import { PdfPreviewCard } from "@/features/tcas-folio/components/pdf-preview-card"
import type { TcasFolioEpisode, TCAS_FOLIO_PDF } from "@/features/tcas-folio/data/content"

type SidebarTab = "content" | "document"

export function TcasFolioPlayer({
  episodes,
  pdf,
}: {
  episodes: TcasFolioEpisode[]
  pdf: typeof TCAS_FOLIO_PDF
}) {
  const [activeId, setActiveId] = useState(episodes[0]?.id)
  const [tab, setTab] = useState<SidebarTab>("content")
  const activeEpisode = episodes.find((ep) => ep.id === activeId) ?? episodes[0]

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Main player */}
      <div className="min-w-0 flex-1">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900">
          <VideoFacade
            key={activeEpisode.id}
            youtubeUrl={activeEpisode.youtubeUrl}
            title={activeEpisode.title}
            playButtonClassName="h-14 w-14"
          />
        </div>
        <div className="mt-4">
          <h2 className="text-base font-semibold text-gray-900">{activeEpisode.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">{activeEpisode.description}</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:w-[360px] lg:flex-shrink-0">
        <div className="rounded-2xl border border-gray-100 bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setTab("content")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                tab === "content" ? "border-b-2 border-green-600 text-green-700" : "text-gray-500 hover:text-gray-700"
              )}
            >
              เนื้อหา
            </button>
            <button
              type="button"
              onClick={() => setTab("document")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                tab === "document" ? "border-b-2 border-green-600 text-green-700" : "text-gray-500 hover:text-gray-700"
              )}
            >
              เอกสาร
            </button>
          </div>

          {/* Tab content */}
          <div className="p-4">
            {tab === "content" ? (
              <div>
                {episodes.map((ep, i) => {
                  const isActive = ep.id === activeEpisode.id
                  const isLast = i === episodes.length - 1
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => setActiveId(ep.id)}
                      className="flex w-full items-stretch gap-3 text-left"
                    >
                      <span className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                            isActive ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"
                          )}
                        >
                          <Video className="h-4 w-4" />
                        </span>
                        {!isLast && <span className="my-1 w-px flex-1 bg-gray-200" />}
                      </span>
                      <span
                        className={cn(
                          "flex-1 py-1.5 text-sm font-medium",
                          isActive ? "text-green-700" : "text-gray-700"
                        )}
                      >
                        {ep.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <PdfPreviewCard pdf={pdf} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
