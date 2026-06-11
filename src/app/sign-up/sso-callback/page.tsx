"use client"

/**
 * Landing page after OAuth provider redirects back during sign-up.
 *
 * Three possible outcomes from Clerk:
 *   1. signUp.status === "complete"      → new user, finalize sign-up
 *   2. signUp.isTransferable === true    → email already exists as a user
 *                                          → transfer to signIn (link OAuth to existing account)
 *   3. existingSession                    → already signed in → activate session
 */

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { buildAuthNavigate } from "@/features/auth/lib/sso-finalize"

export default function SignUpSSOCallback() {
  const clerk = useClerk()
  const { signUp } = useSignUp()
  const { signIn } = useSignIn()
  const router = useRouter()
  const hasRun = useRef(false)

  useEffect(() => {
    if (!clerk.loaded || hasRun.current) return
    hasRun.current = true

    const navigateSignUp = buildAuthNavigate(router, "sign-up")
    const navigateSignIn = buildAuthNavigate(router, "sign-in")

    ;(async () => {
      try {
        // 1. Brand-new user via OAuth → finalize sign-up
        if (signUp.status === "complete") {
          await signUp.finalize({ navigate: navigateSignUp })
          return
        }

        // 2. Email already in use → transfer to sign-in (link OAuth to existing account)
        if (signUp.isTransferable) {
          await signIn.create({ transfer: true })
          if (signIn.status === "complete") {
            await signIn.finalize({ navigate: navigateSignIn })
            return
          }
          router.replace("/sign-in")
          return
        }

        // 3. Already signed in (e.g. re-clicked OAuth while authed)
        const sessionId = signUp.existingSession?.sessionId || signIn.existingSession?.sessionId
        if (sessionId) {
          await clerk.setActive({ session: sessionId, navigate: navigateSignUp })
          return
        }

        router.replace("/sign-up")
      } catch {
        hasRun.current = false
        router.replace("/sign-up")
      }
    })()
  }, [clerk, signIn, signUp, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="text-sm text-gray-500">กำลังสร้างบัญชี…</p>
      <div id="clerk-captcha" />
    </div>
  )
}
