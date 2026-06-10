"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

const GUEST_SEED_KEY = "mbti_guest_seed"

/**
 * Returns a stable per-user seed string used to deterministically select the
 * question subset for the quiz session.
 *
 *   • Signed-in users → Clerk userId (stable across devices)
 *   • Guests          → long-lived localStorage UUID (stable on this device)
 *   • SSR / pre-mount → null (caller should defer pick until mount)
 *
 * Same seed always returns the same 24-item subset and ordering, so retaking
 * the quiz produces a directly comparable result.
 */
export function useSessionSeed(): string | null {
  const { isLoaded, user } = useUser()
  const [guestSeed, setGuestSeed] = useState<string | null>(null)

  useEffect(() => {
    if (user) return // signed-in users don't need the guest fallback
    try {
      let s = localStorage.getItem(GUEST_SEED_KEY)
      if (!s) {
        // crypto.randomUUID is available in all modern browsers; fall back to
        // a timestamp+random combo for ancient embeds (Line in-app browser etc).
        s =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`
        localStorage.setItem(GUEST_SEED_KEY, s)
      }
      setGuestSeed(s)
    } catch {
      // storage blocked (private mode, embedded) — fall back to per-tab random
      setGuestSeed(`ephemeral-${Date.now()}`)
    }
  }, [user])

  if (!isLoaded) return null
  if (user) return user.id
  return guestSeed
}
