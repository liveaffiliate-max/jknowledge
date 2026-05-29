"use client"

import { useSignUp } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Step = "details" | "verify"

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()
  const [step, setStep] = useState<Step>("details")

  const loading = fetchStatus === "fetching"

  async function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const { error } = await signUp.password({
      emailAddress: form.get("email") as string,
      password: form.get("password") as string,
      firstName: (form.get("firstName") as string) || undefined,
      lastName: (form.get("lastName") as string) || undefined,
    })
    if (error) return

    const { error: sendError } = await signUp.verifications.sendEmailCode()
    if (!sendError) setStep("verify")
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const { error } = await signUp.verifications.verifyEmailCode({
      code: form.get("code") as string,
    })
    if (error) return

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          const dest = session?.currentTask ? `/sign-up/tasks/${session.currentTask.key}` : "/"
          const url = decorateUrl(dest)
          if (url.startsWith("http")) window.location.href = url
          else router.push(url)
        },
      })
    }
  }

  return (
    <AuthLayout>
      {step === "details" ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              สร้างบัญชีใหม่
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              เริ่มต้นวิเคราะห์คะแนน TCAS ได้เลย ฟรี!
            </p>
          </div>

          {errors?.global && errors.global.length > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errors.global[0].message}
            </div>
          )}

          <form onSubmit={handleDetails} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium">
                  ชื่อ
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="สมชาย"
                  autoComplete="given-name"
                />
                {errors?.fields?.firstName && (
                  <p className="text-xs text-destructive">{errors.fields.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium">
                  นามสกุล
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="ใจดี"
                  autoComplete="family-name"
                />
                {errors?.fields?.lastName && (
                  <p className="text-xs text-destructive">{errors.fields.lastName.message}</p>
                )}
              </div>
            </div>

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
              {errors?.fields?.emailAddress && (
                <p className="text-xs text-destructive">{errors.fields.emailAddress.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                รหัสผ่าน
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                autoComplete="new-password"
                required
              />
              {errors?.fields?.password && (
                <p className="text-xs text-destructive">{errors.fields.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
            </Button>
          </form>

          {/* Required by Clerk for bot protection */}
          <div id="clerk-captcha" />

          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ยืนยันอีเมล
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              เราส่งรหัส 6 หลักไปยังอีเมลของคุณแล้ว
            </p>
          </div>

          {errors?.global && errors.global.length > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errors.global[0].message}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="code" className="text-sm font-medium">
                รหัสยืนยัน
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
              {loading ? "กำลังยืนยัน..." : "ยืนยันอีเมล"}
            </Button>
          </form>

          <div className="space-y-2 text-center">
            <button
              type="button"
              onClick={() => signUp.verifications.sendEmailCode()}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ส่งรหัสอีกครั้ง
            </button>
            <br />
            <button
              type="button"
              onClick={() => { signUp.reset(); setStep("details") }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← กลับแก้ไขข้อมูล
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
