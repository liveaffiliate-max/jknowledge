"use client"

import { useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { readConsent, type ConsentState } from "@/lib/consent"

interface AnalyticsLoaderProps {
  gaId?: string
}

/**
 * Loads GA + Vercel SpeedInsights only when the user has accepted analytics
 * cookies. Re-evaluates when the consent state changes (via custom
 * "consent-change" event emitted by writeConsent()).
 */
export function AnalyticsLoader({ gaId }: AnalyticsLoaderProps) {
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

  if (!consent?.analytics) return null

  return (
    <>
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <SpeedInsights />
    </>
  )
}
