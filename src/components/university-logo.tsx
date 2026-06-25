"use client"

import { useState } from "react"
import Image from "next/image"
import { getUniversityLogoUrl } from "@/lib/university-logo"
import { cn } from "@/lib/utils"

interface UniversityLogoProps {
  slug: string
  shortName: string
  color: string
  /** Tailwind size classes, e.g. "h-10 w-10". Defaults to "h-10 w-10". */
  className?: string
  /** Border-radius class. Defaults to "rounded-xl". */
  rounded?: string
}

/**
 * Displays a pre-optimized university logo from public/logos/.
 * Falls back to a colored letter-avatar if the image fails to load.
 */
export function UniversityLogo({
  slug,
  shortName,
  color,
  className = "h-10 w-10",
  rounded = "rounded-xl",
}: UniversityLogoProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-shrink-0 items-center justify-center text-white font-bold shadow-sm",
          className,
          rounded
        )}
        style={{ backgroundColor: color }}
      >
        <span className="text-sm leading-none">{shortName.slice(0, 2)}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden bg-white shadow-sm",
        className,
        rounded
      )}
    >
      <Image
        src={getUniversityLogoUrl(slug)}
        alt={`${shortName} logo`}
        fill
        unoptimized
        className="object-contain p-1"
        onError={() => setError(true)}
      />
    </div>
  )
}
