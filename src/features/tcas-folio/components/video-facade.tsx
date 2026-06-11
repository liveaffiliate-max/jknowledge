"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Lock } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { getYoutubeVideoId } from "@/features/tcas-folio/utils/youtube"

const SIGN_IN_HREF = "/sign-in?redirect_url=/tcas-folio"

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
  const { isSignedIn, isLoaded } = useAuth()

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

  const locked = isLoaded && !isSignedIn

  const thumb = (
    <>
      <Image
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 transition-colors group-hover:bg-black/40">
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-white/90 text-green-700 transition-transform group-hover:scale-110",
            playButtonClassName ?? "h-12 w-12"
          )}
        >
          {locked ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
        </span>
        {locked && (
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-700">
            เข้าสู่ระบบเพื่อดูวิดีโอ
          </span>
        )}
      </span>
    </>
  )

  if (locked) {
    return (
      <Link
        href={SIGN_IN_HREF}
        className="group absolute inset-0 h-full w-full"
        aria-label={`เข้าสู่ระบบเพื่อดูวิดีโอ ${title}`}
      >
        {thumb}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group absolute inset-0 h-full w-full"
      aria-label={`เล่นวิดีโอ ${title}`}
    >
      {thumb}
    </button>
  )
}
