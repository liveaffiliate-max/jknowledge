"use client"

import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthShell, AuthDivider } from "@/features/auth/components/auth-shell"
import { OAuthButtons } from "@/features/auth/components/oauth-buttons"
import { readPendingHistory, clearPendingHistory } from "@/features/analyze/components/analyze-form"
import { savePendingHistoryAction } from "@/server/actions"
import { claimAnonymousMBTIResult } from "@/lib/mbti-claim"

type Step      = "details" | "verify"
type Direction = "forward" | "back"

const STEP_CONFIG = {
  details: {
    title:    "สมัครสมาชิก",
    subtitle: "เริ่มต้นวิเคราะห์คะแนน TCAS ของคุณ",
    toggle:   { question: "มีบัญชีอยู่แล้ว?", linkText: "เข้าสู่ระบบ", href: "/sign-in" },
  },
  verify: {
    title:    "ยืนยันอีเมล",
    subtitle: "เราส่งรหัส 6 หลักไปยังอีเมลของคุณแล้ว",
    toggle:   { question: "พบปัญหา?", linkText: "เริ่มใหม่", href: "/sign-up" },
  },
} satisfies Record<Step, { title: string; subtitle: string; toggle: object }>

export default function SignUpPage() {
  const { signUp, errors } = useSignUp()
  const router    = useRouter()
  const [step,      setStep]      = useState<Step>("details")
  const [direction, setDirection] = useState<Direction>("forward")
  const [password,  setPassword]  = useState("")
  const [submitting, setSubmitting] = useState(false)

  const loading  = submitting
  const animClass = direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"

  function advance(s: Step) { setDirection("forward"); setStep(s) }
  function retreat(s: Step) { setDirection("back");    setStep(s) }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    setSubmitting(true)
    try {
      const { error } = await signUp.password({
        emailAddress: form.get("email")     as string,
        password:     form.get("password")  as string,
        firstName:    (form.get("firstName") as string) || undefined,
        lastName:     (form.get("lastName")  as string) || undefined,
      })
      if (error) return

      if (signUp.status === "complete") { await finalize(); return }

      const { error: sendError } = await signUp.verifications.sendEmailCode()
      if (!sendError) advance("verify")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    setSubmitting(true)
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: form.get("code") as string,
      })
      if (error) return
      if (signUp.status === "complete") await finalize()
    } finally {
      setSubmitting(false)
    }
  }

  async function finalize() {
    await signUp.finalize({
      navigate: async ({ session, decorateUrl }) => {
        const pending = readPendingHistory()
        if (pending) {
          await savePendingHistoryAction(pending.facultyId, pending.userScore)
          clearPendingHistory()
        }
        await claimAnonymousMBTIResult()
        const dest = session?.currentTask ? `/sign-up/tasks/${session.currentTask.key}` : "/"
        const url  = decorateUrl(dest)
        if (url.startsWith("http")) window.location.href = url
        else router.push(url)
      },
    })
  }

  async function handleOAuth(
    strategy: "oauth_google" | "oauth_line" | "oauth_apple" | "oauth_facebook" | "oauth_x"
  ) {
    await signUp.sso({
      strategy,
      redirectUrl:         "/",
      redirectCallbackUrl: "/sign-up/sso-callback",
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const cfg = STEP_CONFIG[step]

  return (
    <AuthShell title={cfg.title} subtitle={cfg.subtitle} toggle={cfg.toggle}>
      {/* key forces React to remount on step change → CSS entrance fires */}
      <div key={step} className={animClass}>

        {step === "details" && (
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

        {step === "details" ? (
          <form onSubmit={handleDetails} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="firstName" name="firstName" type="text"
                label="ชื่อ" autoComplete="given-name"
                error={errors?.fields?.firstName?.message}
              />
              <Field
                id="lastName" name="lastName" type="text"
                label="นามสกุล" autoComplete="family-name"
                error={errors?.fields?.lastName?.message}
              />
            </div>

            <Field
              id="email" name="email" type="email"
              label="อีเมล" autoComplete="email" required
              error={errors?.fields?.emailAddress?.message}
            />

            <PasswordField
              value={password}
              onChange={setPassword}
              serverError={errors?.fields?.password?.message}
            />

            {/* Clerk bot-protection widget */}
            <div id="clerk-captcha" />

            <SubmitButton loading={loading} label="กำลังสร้างบัญชี…">
              สมัครสมาชิก
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <OtpInput
              name="code"
              error={errors?.fields?.code?.message}
            />

            <SubmitButton loading={loading} label="กำลังยืนยัน…">
              ยืนยันอีเมล
            </SubmitButton>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { signUp.reset(); retreat("details") }}
                className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                แก้ไขข้อมูล
              </button>
              <ResendButton onResend={() => signUp.verifications.sendEmailCode()} />
            </div>
          </form>
        )}

        {step === "details" && (
          <p className="mt-4 text-center text-xs text-gray-400">
            การสมัครสมาชิกเท่ากับยอมรับ{" "}
            <a href="/terms"   className="underline-offset-4 hover:underline">เงื่อนไขการใช้งาน</a>
            {" "}และ{" "}
            <a href="/privacy" className="underline-offset-4 hover:underline">นโยบายข้อมูลส่วนตัว</a>
          </p>
        )}
      </div>
    </AuthShell>
  )
}

// ── OTP Input ────────────────────────────────────────────────────────────────
// 6 individual digit boxes with stagger entrance, auto-advance, and paste.

function OtpInput({ name, error }: { name: string; error?: string }) {
  const [digits, setDigits] = useState(Array<string>(6).fill(""))
  const refs    = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  // Auto-focus first box when this step mounts
  useEffect(() => { refs.current[0]?.focus() }, [])

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const val  = e.target.value.replace(/\D/g, "").slice(-1)
    const next = [...digits]; next[i] = val; setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
    if (e.key === "ArrowLeft"  && i > 0) refs.current[i - 1]?.focus()
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = Array<string>(6).fill("")
    text.split("").forEach((c, i) => { next[i] = c })
    setDigits(next)
    // Focus the box after the last pasted digit
    refs.current[Math.min(text.length, 5)]?.focus()
  }

  const fullValue = digits.join("")

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">รหัสยืนยัน</label>
      <div className="flex gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            aria-label={`หลักที่ ${i + 1}`}
            style={{ animationDelay: `${i * 35}ms` }}
            className={cn(
              "animate-otp-digit h-12 w-full rounded-xl border text-center text-xl font-bold",
              "outline-none transition-all duration-150",
              "focus:ring-2 focus:ring-green-100 focus:border-green-400",
              d
                ? "border-green-300 bg-green-50 text-green-900"
                : "border-gray-200 bg-white text-gray-900",
              error ? "border-red-300" : ""
            )}
          />
        ))}
      </div>
      {/* Hidden input consumed by handleVerify FormData */}
      <input type="hidden" name={name} value={fullValue} />
      {error && <p className="mt-1.5 animate-error-reveal text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Resend button with cooldown ───────────────────────────────────────────────

function ResendButton({ onResend }: { onResend: () => void }) {
  const [cooldown, setCooldown]  = useState(0)
  const [sent,     setSent]      = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function handleClick() {
    if (cooldown > 0) return
    onResend()
    setSent(true)
    setCooldown(30)
    timerRef.current = setInterval(() => {
      setCooldown(v => {
        if (v <= 1) { clearInterval(timerRef.current!); return 0 }
        return v - 1
      })
    }, 1000)
    setTimeout(() => setSent(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cooldown > 0}
      className={cn(
        "text-sm transition-colors duration-150",
        cooldown > 0
          ? "text-gray-400 cursor-not-allowed"
          : "text-green-700 hover:text-green-800"
      )}
    >
      {sent
        ? "ส่งแล้ว ✓"
        : cooldown > 0
          ? `ส่งอีกครั้งใน ${cooldown}s`
          : "ส่งรหัสอีกครั้ง"}
    </button>
  )
}

// ── Form primitives ───────────────────────────────────────────────────────────

function Field({
  id, label, error, ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 outline-none",
          "placeholder:text-gray-400 transition-colors duration-150",
          "focus:border-green-400 focus:ring-2 focus:ring-green-100",
          error ? "border-red-300" : "border-gray-200"
        )}
        {...inputProps}
      />
      {error && (
        <p className="mt-1 animate-error-reveal text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

// ── Password strength ─────────────────────────────────────────────────────────

type Strength = "empty" | "short" | "weak" | "fair" | "strong"

function getStrength(pw: string): Strength {
  if (!pw) return "empty"
  if (pw.length < 8) return "short"
  const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length
  if (checks <= 2) return "weak"
  if (checks === 3) return "fair"
  return "strong"
}

const STRENGTH_CFG: Record<Strength, { bars: number; color: string; label: string; textColor: string }> = {
  empty:  { bars: 0, color: "bg-gray-200",    label: "",                              textColor: "" },
  short:  { bars: 1, color: "bg-red-400",     label: "สั้นเกินไป (ต้องการ 8+ ตัว)",   textColor: "text-red-500" },
  weak:   { bars: 1, color: "bg-red-400",     label: "ความปลอดภัยต่ำ",               textColor: "text-red-500" },
  fair:   { bars: 2, color: "bg-yellow-400",  label: "พอใช้ได้",                      textColor: "text-yellow-600" },
  strong: { bars: 3, color: "bg-green-500",   label: "แข็งแกร่ง",                    textColor: "text-green-600" },
}

function PasswordField({
  value, onChange, serverError,
}: { value: string; onChange: (v: string) => void; serverError?: string }) {
  const strength = getStrength(value)
  const cfg      = STRENGTH_CFG[strength]
  const hasError = !!serverError || strength === "short"

  return (
    <div>
      <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
        รหัสผ่าน
      </label>
      <input
        id="password" name="password" type="password"
        autoComplete="new-password" required
        placeholder="อย่างน้อย 8 ตัวอักษร"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 outline-none",
          "placeholder:text-gray-400 transition-colors duration-150",
          "focus:border-green-400 focus:ring-2 focus:ring-green-100",
          hasError ? "border-red-300" : "border-gray-200"
        )}
      />

      {/* Strength meter — animates in on first keystroke */}
      {value && (
        <div className="mt-2 animate-step-reveal space-y-1">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                {i <= cfg.bars && (
                  <div
                    className={cn("absolute inset-0 rounded-full animate-bar-fill", cfg.color)}
                    /* each bar slightly staggers */
                    style={{ animationDelay: `${(i - 1) * 60}ms` }}
                  />
                )}
              </div>
            ))}
          </div>
          {cfg.label && (
            <p className={cn("text-xs transition-colors duration-200", cfg.textColor)}>
              {cfg.label}
            </p>
          )}
        </div>
      )}

      {serverError && (
        <p className="mt-1 animate-error-reveal text-xs text-red-600">{serverError}</p>
      )}
    </div>
  )
}

// ── Submit button ─────────────────────────────────────────────────────────────

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
        "transition-all duration-150",
        "hover:bg-green-700",
        "active:scale-[0.97]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {label ?? "กำลังดำเนินการ…"}
        </>
      ) : children}
    </button>
  )
}
