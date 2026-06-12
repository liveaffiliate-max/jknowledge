"use client"

/**
 * Landing page after OAuth provider redirects back during sign-in.
 *
 * Possible outcomes from Clerk:
 *   1. signIn.status === "complete"      → existing user → finalize sign-in
 *   2. signIn.isTransferable === true    → new user (no Clerk account yet)
 *                                          → transfer to signUp (progressive sign-up)
 *   3. needs_second_factor / needs_new_password → back to /sign-in to handle
 *   4. existingSession                    → already signed in → activate session
 */

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { buildAuthNavigate } from "@/features/auth/lib/sso-finalize"
import { getSafeRedirect } from "@/features/auth/lib/validation"

export default function SignInSSOCallback() {
  const clerk = useClerk()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRun = useRef(false)

  useEffect(() => {
    if (!clerk.loaded || hasRun.current) return
    hasRun.current = true

    const redirectTo = getSafeRedirect(searchParams.get("redirect_url"))
    const navigateSignIn = buildAuthNavigate(router, "sign-in", redirectTo)
    const navigateSignUp = buildAuthNavigate(router, "sign-up", redirectTo)

    ;(async () => {
      try {
        // 1. Existing user → finalize sign-in
        if (signIn.status === "complete") {
          await signIn.finalize({ navigate: navigateSignIn })
          return
        }

        // 2. No Clerk user yet → transfer to sign-up (auto-create account)
        if (signIn.isTransferable) {
          await signUp.create({ transfer: true })
          if (signUp.status === "complete") {
            await signUp.finalize({ navigate: navigateSignUp })
            return
          }
          router.replace("/sign-up")
          return
        }

        // 3. MFA / new password required
        if (signIn.status === "needs_second_factor" || signIn.status === "needs_new_password") {
          router.replace("/sign-in")
          return
        }

        // 4. Already signed in
        const sessionId = signIn.existingSession?.sessionId || signUp.existingSession?.sessionId
        if (sessionId) {
          await clerk.setActive({ session: sessionId, navigate: navigateSignIn })
          return
        }

        router.replace("/sign-in")
      } catch {
        hasRun.current = false
        router.replace("/sign-in")
      }
    })()
  }, [clerk, signIn, signUp, router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="text-sm text-gray-500">กำลังเข้าสู่ระบบ…</p>
      <div id="clerk-captcha" />
    </div>
  )
}
