"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/toaster"

/** Minimal shape of the `errors` object returned by Clerk's useSignIn / useSignUp hooks. */
interface ClerkErrorsLike {
  global?: readonly { message: string }[] | null
}

/**
 * Fire a toast whenever Clerk surfaces a new global error (wrong password, email taken, rate
 * limit, etc). Deduplicates so the same message isn't shown repeatedly while React re-renders.
 */
export function useClerkErrorToast(errors: ClerkErrorsLike | null | undefined) {
  const { toast } = useToast()
  const lastShown = useRef<string | undefined>(undefined)

  useEffect(() => {
    const msg = errors?.global?.[0]?.message
    if (msg && msg !== lastShown.current) {
      toast(msg, "error")
      lastShown.current = msg
    }
    if (!msg) lastShown.current = undefined
  }, [errors, toast])
}
