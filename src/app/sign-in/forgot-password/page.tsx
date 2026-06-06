"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthShell } from "@/features/auth/components/auth-shell"

type Step = "email" | "code" | "password"

export default function ForgotPasswordPage() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const [step,      setStep]      = useState<Step>("email")
  const [direction, setDirection] = useState<"forward" | "back">("forward")

  function advance(s: Step) { setDirection("forward"); setStep(s) }
  function retreat(s: Step) { setDirection("back");    setStep(s) }

  const loading   = fetchStatus === "fetching"
  const animClass = direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const identifier = form.get("email") as string

    const { error: createError } = await signIn.create({ identifier })
    if (createError) return

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode()
    if (!sendError) advance("code")
  }

  async function handleCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: form.get("code") as string,
    })
    if (!error) advance("password")
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password:               form.get("password") as string,
      signOutOfOtherSessions: true,
    })
    if (error) return

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/")
          if (url.startsWith("http")) window.location.href = url
          else router.push(url)
        },
      })
    }
  }

  const globalError = errors?.global?.[0]

  const cfg = {
    email:    { title: "ลืมรหัสผ่าน",    subtitle: "กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งรหัสยืนยันให้",
                toggle: { question: "จำรหัสผ่านได้แล้ว?", linkText: "เข้าสู่ระบบ", href: "/sign-in" } },
    code:     { title: "กรอกรหัสยืนยัน", subtitle: "ตรวจสอบอีเมลของคุณ แล้วกรอกรหัส 6 หลัก",
                toggle: { question: "ไม่ได้รับอีเมล?",    linkText: "ลองใหม่",     href: "/sign-in/forgot-password" } },
    password: { title: "ตั้งรหัสผ่านใหม่", subtitle: "เลือกรหัสผ่านใหม่ที่จำง่ายสำหรับคุณ",
                toggle: { question: "กลับไปหน้าหลัก?",    linkText: "เข้าสู่ระบบ", href: "/sign-in" } },
  }[step]

  return (
    <AuthShell title={cfg.title} subtitle={cfg.subtitle} toggle={cfg.toggle}>
      <div key={step} className={animClass}>
        <ErrorBanner error={globalError?.message} />

        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4">
            <Field id="email" name="email" type="email" label="อีเมล"
              autoComplete="email" required error={errors?.fields?.identifier?.message} />
            <SubmitButton loading={loading} label="กำลังส่งรหัส…">ส่งรหัสยืนยัน</SubmitButton>
          </form>
        )}

        {step === "code" && (
          <>
            <form onSubmit={handleCode} className="space-y-4">
              <Field id="code" name="code" type="text" label="รหัสยืนยัน"
                inputMode="numeric" maxLength={6} autoComplete="one-time-code"
                required placeholder="123456" error={errors?.fields?.code?.message} />
              <SubmitButton loading={loading} label="กำลังตรวจสอบ…">ยืนยัน</SubmitButton>
            </form>
            <button type="button" onClick={() => retreat("email")}
              className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700">
              <ArrowLeft className="h-3.5 w-3.5" />แก้ไขอีเมล
            </button>
          </>
        )}

        {step === "password" && (
          <form onSubmit={handlePassword} className="space-y-4">
            <Field id="password" name="password" type="password" label="รหัสผ่านใหม่"
              autoComplete="new-password" required placeholder="อย่างน้อย 8 ตัวอักษร"
              error={errors?.fields?.password?.message} />
            <SubmitButton loading={loading} label="กำลังบันทึก…">บันทึกรหัสผ่านใหม่</SubmitButton>
          </form>
        )}
      </div>
    </AuthShell>
  )
}

// ── Primitives ────────────────────────────────────────────────────────────────

function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null
  return (
    <div className="animate-error-reveal mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )
}

function Field({
  id,
  label,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id:    string
  label: string
  error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
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
  children,
  loading,
  label,
}: {
  children: React.ReactNode
  loading?: boolean
  label?:   string
}) {
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
