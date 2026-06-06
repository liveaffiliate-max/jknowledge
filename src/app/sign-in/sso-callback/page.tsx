"use client"

/**
 * Landing page after OAuth provider redirects back.
 * Clerk has already exchanged the authorization code on its servers by this
 * point — signIn.status should be "complete". We just need to finalize the
 * session and redirect the user home.
 */

import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function SignInSSOCallback() {
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()

  useEffect(() => {
    // Wait until Clerk finishes resolving the OAuth response
    if (fetchStatus !== "idle") return
    if (!signIn) return

    if (signIn.status === "complete") {
      signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/")
          if (url.startsWith("http")) window.location.href = url
          else router.push(url)
        },
      })
    } else {
      // Unexpected state — fall back to sign-in page
      router.replace("/sign-in")
    }
  }, [signIn?.status, fetchStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="text-sm text-gray-500">กำลังเข้าสู่ระบบ…</p>
    </div>
  )
}
