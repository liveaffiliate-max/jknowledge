"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { getYoutubeVideoId } from "@/features/tcas-folio/utils/youtube"

export function VideoFacade({
  youtubeUrl,
  title,
  playButtonClassName,
}: {
  youtubeUrl: string
  title: string
  playButtonClassName?: string
}) {
  const [playing, setPlaying] = useState(false)
  const videoId = getYoutubeVideoId(youtubeUrl)

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group absolute inset-0 h-full w-full"
      aria-label={`เล่นวิดีโอ ${title}`}
    >
      <Image
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-white/90 text-green-700 transition-transform group-hover:scale-110",
            playButtonClassName ?? "h-12 w-12"
          )}
        >
          <Play className="h-5 w-5 fill-current" />
        </span>
      </span>
    </button>
  )
}
