"use client"

// ── Cookie consent state — PDPA-compliant ────────────────────────────────────
// User must opt in to analytics + marketing cookies. Essential cookies
// (auth, security) always load. Consent is persisted in localStorage and
// versioned so we can re-prompt when our policy changes.

export const CONSENT_KEY = "jknowledge:cookie-consent:v1"
export const CONSENT_VERSION = "1.0"

export type ConsentCategory = "essential" | "analytics" | "marketing"

export interface ConsentState {
  essential:   true               // always true — cannot be turned off
  analytics:   boolean            // GA, Vercel SpeedInsights
  marketing:   boolean            // currently unused — reserved
  consentedAt: string             // ISO timestamp
  version:     string             // policy version at time of consent
}

const DEFAULT_DENY: ConsentState = {
  essential:   true,
  analytics:   false,
  marketing:   false,
  consentedAt: "",
  version:     CONSENT_VERSION,
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    if (parsed.version !== CONSENT_VERSION) return null  // policy changed → re-prompt
    return {
      ...DEFAULT_DENY,
      ...parsed,
      essential: true,    // enforce
      version:   CONSENT_VERSION,
    } as ConsentState
  } catch {
    return null
  }
}

export function writeConsent(partial: Partial<Omit<ConsentState, "essential" | "version">>) {
  if (typeof window === "undefined") return
  const next: ConsentState = {
    ...DEFAULT_DENY,
    ...(readConsent() ?? {}),
    ...partial,
    essential:   true,
    consentedAt: new Date().toISOString(),
    version:     CONSENT_VERSION,
  }
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next))
    // Notify listeners (banner, analytics loader) of the change
    window.dispatchEvent(new CustomEvent("consent-change", { detail: next }))
  } catch {
    // private mode / quota — best effort
  }
}

export function acceptAll() {
  writeConsent({ analytics: true, marketing: true })
}

export function acceptEssentialOnly() {
  writeConsent({ analytics: false, marketing: false })
}
