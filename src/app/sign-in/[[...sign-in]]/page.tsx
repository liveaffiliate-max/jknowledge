"use client"

import { useSignIn } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Step = "credentials" | "mfa"

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const [step, setStep] = useState<Step>("credentials")

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
      setStep("mfa")
    } else if (signIn.status === "complete") {
      await finalize()
    }
  }

  async function handleMFA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const { error } = await signIn.mfa.verifyEmailCode({
      code: form.get("code") as string,
    })
    if (error) return
    if (signIn.status === "complete") await finalize()
  }

  async function finalize() {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        const dest = session?.currentTask ? `/sign-in/tasks/${session.currentTask.key}` : "/"
        const url = decorateUrl(dest)
        if (url.startsWith("http")) window.location.href = url
        else router.push(url)
      },
    })
  }

  return (
    <AuthLayout>
      {step === "credentials" ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ยินดีต้อนรับกลับ
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              เข้าสู่ระบบเพื่อวิเคราะห์คะแนน TCAS ของคุณ
            </p>
          </div>

          {/* Global errors */}
          {errors?.global && errors.global.length > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errors.global[0].message}
            </div>
          )}

          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                อีเมล
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              {errors?.fields?.identifier && (
                <p className="text-xs text-destructive">{errors.fields.identifier.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  รหัสผ่าน
                </label>
                <Link
                  href="/sign-in/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              {errors?.fields?.password && (
                <p className="text-xs text-destructive">{errors.fields.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              สมัครสมาชิกฟรี
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ยืนยันตัวตน
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              กรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ
            </p>
          </div>

          {errors?.global && errors.global.length > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errors.global[0].message}
            </div>
          )}

          <form onSubmit={handleMFA} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="code" className="text-sm font-medium">
                รหัส OTP
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                maxLength={6}
                autoComplete="one-time-code"
                required
              />
              {errors?.fields?.code && (
                <p className="text-xs text-destructive">{errors.fields.code.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังยืนยัน..." : "ยืนยัน"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setStep("credentials")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← กลับหน้าเข้าสู่ระบบ
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
