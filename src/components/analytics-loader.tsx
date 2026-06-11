"use client"

import { useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { readConsent, type ConsentState } from "@/lib/consent"
import { MetaPixel } from "@/components/meta-pixel"

interface AnalyticsLoaderProps {
  gaId?: string
  metaPixelId?: string
}

/**
 * Loads GA + Vercel SpeedInsights when the user has accepted analytics
 * cookies, and Meta Pixel when the user has accepted marketing cookies.
 * Re-evaluates when the consent state changes (via custom "consent-change"
 * event emitted by writeConsent()).
 */
export function AnalyticsLoader({ gaId, metaPixelId }: AnalyticsLoaderProps) {
  const [consent, setConsent] = useState<ConsentState | null>(null)

  useEffect(() => {
    setConsent(readConsent())
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<ConsentState>).detail
      setConsent(next)
    }
    window.addEventListener("consent-change", onChange)
    return () => window.removeEventListener("consent-change", onChange)
  }, [])

  return (
    <>
      {consent?.analytics && (
        <>
          {gaId && <GoogleAnalytics gaId={gaId} />}
          <SpeedInsights />
        </>
      )}
      {consent?.marketing && metaPixelId && <MetaPixel pixelId={metaPixelId} />}
    </>
  )
}
