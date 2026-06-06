"use client"

import { useSignIn } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthShell, AuthDivider } from "@/features/auth/components/auth-shell"
import { OAuthButtons } from "@/features/auth/components/oauth-buttons"
import { readPendingHistory, clearPendingHistory } from "@/features/analyze/components/analyze-form"
import { savePendingHistoryAction } from "@/server/actions"

type Step = "credentials" | "mfa"
type MFAMode = "email" | "backup"

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const [step,    setStep]    = useState<Step>("credentials")
  const [mfaMode, setMfaMode] = useState<MFAMode>("email")
  const [direction, setDirection] = useState<"forward" | "back">("forward")

  function advance(s: Step) { setDirection("forward"); setStep(s) }
  function retreat(s: Step) { setDirection("back");    setStep(s) }

  const loading = fetchStatus === "fetching"

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const { error } = await signIn.password({
      identifier: form.get("email") as string,
      password: form.get("password") as string,
    })
    if (error) return

    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      await signIn.mfa.sendEmailCode()
      advance("mfa")
    } else if (signIn.status === "complete") {
      await finalize()
    }
  }

  async function handleMFA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const code = form.get("code") as string

    const { error } =
      mfaMode === "backup"
        ? await signIn.mfa.verifyBackupCode({ code })
        : await signIn.mfa.verifyEmailCode({ code })
    if (error) return
    if (signIn.status === "complete") await finalize()
  }

  async function finalize() {
    await signIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        // Migrate any analysis done while anonymous → PredictionHistory
        const pending = readPendingHistory()
        if (pending) {
          await savePendingHistoryAction(pending.facultyId, pending.userScore)
          clearPendingHistory()
        }

        const dest = session?.currentTask ? `/sign-in/tasks/${session.currentTask.key}` : "/"
        const url = decorateUrl(dest)
        if (url.startsWith("http")) window.location.href = url
        else router.push(url)
      },
    })
  }

  async function handleOAuth(
    strategy: "oauth_google" | "oauth_line" | "oauth_apple" | "oauth_facebook" | "oauth_x"
  ) {
    await signIn.sso({
      strategy,
      redirectUrl:         "/",
      redirectCallbackUrl: "/sign-in/sso-callback",
    })
  }

  const isBackup  = mfaMode === "backup"
  const animClass = direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"

  const cfg = step === "credentials"
    ? { title: "เข้าสู่ระบบ", subtitle: "ยินดีต้อนรับกลับมา",
        toggle: { question: "ยังไม่มีบัญชี?", linkText: "สมัครสมาชิก", href: "/sign-up" } }
    : { title: "ยืนยันตัวตน",
        subtitle: isBackup ? "กรอก backup code ที่บันทึกไว้" : "กรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ",
        toggle: { question: "พบปัญหา?", linkText: "เริ่มใหม่", href: "/sign-in" } }

  return (
    <AuthShell title={cfg.title} subtitle={cfg.subtitle} toggle={cfg.toggle}>
      <div key={step} className={animClass}>

        {step === "credentials" && (
          <>
            <OAuthButtons onSelect={handleOAuth} disabled={loading} />
            <AuthDivider label="หรือใช้อีเมล" />
          </>
        )}

        {errors?.global?.[0] && (
          <div className="animate-error-reveal mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errors.global[0].message}</span>
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <Field id="email" name="email" type="email" label="อีเมล"
              autoComplete="email" required error={errors?.fields?.identifier?.message} />
            <Field id="password" name="password" type="password" label="รหัสผ่าน"
              autoComplete="current-password" required error={errors?.fields?.password?.message}
              trailingLink={{ href: "/sign-in/forgot-password", text: "ลืมรหัสผ่าน?" }} />
            <SubmitButton loading={loading} label="กำลังเข้าสู่ระบบ…">เข้าสู่ระบบ</SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleMFA} className="space-y-4">
            {isBackup ? (
              <Field id="code" name="code" type="text" label="Backup code"
                autoComplete="off" required placeholder="xxxxxxxx-xxxx"
                error={errors?.fields?.code?.message} />
            ) : (
              <Field id="code" name="code" type="text" label="รหัส OTP 6 หลัก"
                inputMode="numeric" maxLength={6} autoComplete="one-time-code" required
                error={errors?.fields?.code?.message} />
            )}
            <SubmitButton loading={loading} label="กำลังยืนยัน…">ยืนยัน</SubmitButton>

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

// ── Form primitives (kept local — auth-specific styling) ─────────────────────

function Field({
  id,
  label,
  trailingLink,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id:    string
  label: string
  error?: string
  trailingLink?: { href: string; text: string }
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {trailingLink && (
          <Link
            href={trailingLink.href}
            className="text-xs text-gray-500 hover:text-green-700"
          >
            {trailingLink.text}
          </Link>
        )}
      </div>
      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors",
          "placeholder:text-gray-400",
          "focus:border-green-400 focus:ring-2 focus:ring-green-100",
          error ? "border-red-300" : "border-gray-200"
        )}
        {...inputProps}
      />
      {error && <p className="mt-1 animate-error-reveal text-xs text-red-600">{error}</p>}
    </div>
  )
}

function SubmitButton({
  children, loading, label,
}: { children: React.ReactNode; loading?: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl",
        "bg-green-600 text-sm font-semibold text-white",
        "transition-all duration-150 active:scale-[0.97]",
        "hover:bg-green-700",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      )}
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" />{label ?? "กำลังดำเนินการ…"}</>
      ) : children}
    </button>
  )
}
