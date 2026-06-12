"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { AuthShell, AuthDivider } from "@/features/auth/components/auth-shell"
import { OAuthButtons } from "@/features/auth/components/oauth-buttons"
import { AuthField, AuthSubmitButton, AuthErrorBanner } from "@/features/auth/components/form-primitives"
import { buildAuthNavigate } from "@/features/auth/lib/sso-finalize"
import { useClerkErrorToast } from "@/features/auth/lib/use-clerk-error-toast"
import { validateEmail, getSafeRedirect } from "@/features/auth/lib/validation"
import { useToast } from "@/components/ui/toaster"

type Step = "credentials" | "mfa"
type MFAMode = "email" | "backup"

export default function SignInPage() {
  const { signIn, errors } = useSignIn()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get("redirect_url"))
  const { toast } = useToast()
  const [step,    setStep]    = useState<Step>("credentials")
  const [mfaMode, setMfaMode] = useState<MFAMode>("email")
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [submitting, setSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | undefined>(undefined)

  useClerkErrorToast(errors)

  function advance(s: Step) { setDirection("forward"); setStep(s) }
  function retreat(s: Step) { setDirection("back");    setStep(s) }

  const loading = submitting

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = (form.get("email") as string).trim()

    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      toast(emailErr, "error")
      return
    }
    setEmailError(undefined)

    setSubmitting(true)
    try {
      const { error } = await signIn.password({
        identifier: email,
        password: form.get("password") as string,
      })
      if (error) return

      if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        await signIn.mfa.sendEmailCode()
        advance("mfa")
      } else if (signIn.status === "complete") {
        await finalize()
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMFA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const code = form.get("code") as string

    setSubmitting(true)
    try {
      const { error } =
        mfaMode === "backup"
          ? await signIn.mfa.verifyBackupCode({ code })
          : await signIn.mfa.verifyEmailCode({ code })
      if (error) return
      if (signIn.status === "complete") await finalize()
    } finally {
      setSubmitting(false)
    }
  }

  async function finalize() {
    await signIn.finalize({ navigate: buildAuthNavigate(router, "sign-in", redirectTo) })
  }

  async function handleOAuth(
    strategy: "oauth_google" | "oauth_line" | "oauth_apple" | "oauth_facebook" | "oauth_x"
  ) {
    // Preserve redirect_url through the OAuth round-trip so sso-callback can honour it
    const callback = `/sign-in/sso-callback?redirect_url=${encodeURIComponent(redirectTo)}`
    await signIn.sso({
      strategy,
      redirectUrl:         redirectTo,
      redirectCallbackUrl: callback,
    })
  }

  const isBackup  = mfaMode === "backup"
  const animClass = direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"

  const redirectQuery = redirectTo === "/" ? "" : `?redirect_url=${encodeURIComponent(redirectTo)}`
  const cfg = step === "credentials"
    ? { title: "เข้าสู่ระบบ", subtitle: "ยินดีต้อนรับกลับมา",
        toggle: { question: "ยังไม่มีบัญชี?", linkText: "สมัครสมาชิก", href: `/sign-up${redirectQuery}` } }
    : { title: "ยืนยันตัวตน",
        subtitle: isBackup ? "กรอก backup code ที่บันทึกไว้" : "กรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ",
        toggle: { question: "พบปัญหา?", linkText: "เริ่มใหม่", href: `/sign-in${redirectQuery}` } }

  return (
    <AuthShell title={cfg.title} subtitle={cfg.subtitle} toggle={cfg.toggle}>
      <div key={step} className={animClass}>

        {step === "credentials" && (
          <>
            <OAuthButtons onSelect={handleOAuth} disabled={loading} />
            <AuthDivider label="หรือใช้อีเมล" />
          </>
        )}

        <AuthErrorBanner error={errors?.global?.[0]?.message} />

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} noValidate className="space-y-4">
            <AuthField id="email" name="email" type="email" label="อีเมล"
              autoComplete="email" required
              onChange={() => emailError && setEmailError(undefined)}
              error={emailError ?? errors?.fields?.identifier?.message} />
            <AuthField id="password" name="password" type="password" label="รหัสผ่าน"
              autoComplete="current-password" required error={errors?.fields?.password?.message}
              trailingLink={{ href: "/sign-in/forgot-password", text: "ลืมรหัสผ่าน?" }} />
            <AuthSubmitButton loading={loading} label="กำลังเข้าสู่ระบบ…">เข้าสู่ระบบ</AuthSubmitButton>
          </form>
        ) : (
          <form onSubmit={handleMFA} className="space-y-4">
            {isBackup ? (
              <AuthField key="backup" id="code" name="code" type="text" label="Backup code"
                autoComplete="off" required placeholder="xxxxxxxx-xxxx"
                error={errors?.fields?.code?.message} />
            ) : (
              <AuthField key="otp" id="code" name="code" type="text" label="รหัส OTP 6 หลัก"
                inputMode="numeric" maxLength={6} autoComplete="one-time-code" required
                error={errors?.fields?.code?.message} />
            )}
            <AuthSubmitButton loading={loading} label="กำลังยืนยัน…">ยืนยัน</AuthSubmitButton>

            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={() => retreat("credentials")}
                className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700">
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับ
              </button>
              <button type="button" onClick={() => setMfaMode(isBackup ? "email" : "backup")}
                className="text-sm text-green-700 transition-colors hover:text-green-800">
                {isBackup ? "ใช้รหัส OTP แทน" : "ไม่มีรหัส OTP? ใช้ backup code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  )
}

