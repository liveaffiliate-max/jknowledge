"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { AuthShell } from "@/features/auth/components/auth-shell"
import { AuthField, AuthSubmitButton, AuthErrorBanner } from "@/features/auth/components/form-primitives"

type Step = "email" | "code" | "password"

export default function ForgotPasswordPage() {
  const { signIn, errors } = useSignIn()
  const router = useRouter()
  const [step,      setStep]      = useState<Step>("email")
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [submitting, setSubmitting] = useState(false)

  function advance(s: Step) { setDirection("forward"); setStep(s) }
  function retreat(s: Step) { setDirection("back");    setStep(s) }

  const loading   = submitting
  const animClass = direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const identifier = form.get("email") as string

    setSubmitting(true)
    try {
      const { error: createError } = await signIn.create({ identifier })
      if (createError) return

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode()
      if (!sendError) advance("code")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    setSubmitting(true)
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: form.get("code") as string,
      })
      if (!error) advance("password")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    setSubmitting(true)
    try {
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
    } finally {
      setSubmitting(false)
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
        <AuthErrorBanner error={globalError?.message} />

        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4">
            <AuthField id="email" name="email" type="email" label="อีเมล"
              autoComplete="email" required error={errors?.fields?.identifier?.message} />
            <AuthSubmitButton loading={loading} label="กำลังส่งรหัส…">ส่งรหัสยืนยัน</AuthSubmitButton>
          </form>
        )}

        {step === "code" && (
          <>
            <form onSubmit={handleCode} className="space-y-4">
              <AuthField id="code" name="code" type="text" label="รหัสยืนยัน"
                inputMode="numeric" maxLength={6} autoComplete="one-time-code"
                required placeholder="123456" error={errors?.fields?.code?.message} />
              <AuthSubmitButton loading={loading} label="กำลังตรวจสอบ…">ยืนยัน</AuthSubmitButton>
            </form>
            <button type="button" onClick={() => retreat("email")}
              className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700">
              <ArrowLeft className="h-3.5 w-3.5" />แก้ไขอีเมล
            </button>
          </>
        )}

        {step === "password" && (
          <form onSubmit={handlePassword} className="space-y-4">
            <AuthField id="password" name="password" type="password" label="รหัสผ่านใหม่"
              autoComplete="new-password" required placeholder="อย่างน้อย 8 ตัวอักษร"
              error={errors?.fields?.password?.message} />
            <AuthSubmitButton loading={loading} label="กำลังบันทึก…">บันทึกรหัสผ่านใหม่</AuthSubmitButton>
          </form>
        )}
      </div>
    </AuthShell>
  )
}

