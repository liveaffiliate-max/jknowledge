import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header"
import { getProfileStats, getLatestMBTIForUser } from "@/server/queries"
import { AvatarUpload } from "./_components/avatar-upload"
import { EditNameForm }  from "./_components/edit-name-form"
import { SignOutButton } from "./_components/sign-out-button"
import { DeleteAccountButton } from "./_components/delete-account-button"
import {
  BarChart2, KeyRound, Mail, CalendarDays, TrendingUp, Brain,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "โปรไฟล์ — Jknowledge",
}

function formatThaiDate(date: Date | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric", month: "long", year: "numeric",
  }).format(date)
}

export default async function ProfilePage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const [user, stats, mbti] = await Promise.all([
    currentUser(),
    getProfileStats(clerkId),
    getLatestMBTIForUser(clerkId),
  ])
  if (!user) redirect("/sign-in")

  const firstName = user.firstName ?? ""
  const lastName  = user.lastName  ?? ""
  const fullName  = [firstName, lastName].filter(Boolean).join(" ") || "ผู้ใช้"
  const email     = user.emailAddresses[0]?.emailAddress ?? "—"
  const initials  = (firstName[0] ?? (fullName[0] ?? "U")).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-xl px-4 py-8 space-y-4">

        {/* ── Avatar + name hero ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-5">
            {/* Clickable avatar upload */}
            <AvatarUpload
              initialImageUrl={user.imageUrl}
              initials={initials}
              fullName={fullName}
            />

            {/* Name + email */}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-gray-900">{fullName}</h1>
              <p className="flex items-center gap-1 truncate text-sm text-gray-400 mt-0.5">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                {email}
              </p>
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <CalendarDays className="h-3 w-3 flex-shrink-0" />
                สมาชิกตั้งแต่ {formatThaiDate(stats.joinedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <BarChart2 className="mx-auto mb-1.5 h-5 w-5 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
            <p className="text-xs text-gray-500 mt-0.5">วิเคราะห์แล้ว</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <TrendingUp className="mx-auto mb-1.5 h-5 w-5 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">{stats.highChanceCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">โอกาสสูง</p>
          </div>
        </div>

        {/* ── MBTI badge ── */}
        {mbti ? (
          <Link
            href={`/mbti/${mbti.type.toLowerCase()}`}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-green-200 hover:shadow-sm"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>{mbti.emoji}</span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {mbti.type} · {mbti.nickname}
                </span>
                <span className="text-xs text-gray-400">บุคลิกของคุณ</span>
              </span>
            </span>
            <span className="text-gray-300">→</span>
          </Link>
        ) : (
          <Link
            href="/mbti"
            className="flex items-center justify-between rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-600 transition-all hover:border-green-300 hover:bg-green-50/40"
          >
            <span className="flex items-center gap-2.5">
              <Brain className="h-4 w-4 text-green-600" />
              ทำ MBTI เพื่อรับคำแนะนำคณะ
            </span>
            <span className="text-gray-300">→</span>
          </Link>
        )}

        {/* ── Edit name ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">ข้อมูลส่วนตัว</h2>
          <div className="space-y-5">
            <EditNameForm firstName={firstName} lastName={lastName} />

            {/* Email — read-only */}
            <div>
              <p className="text-sm font-medium text-gray-500">อีเมล</p>
              <p className="mt-0.5 text-base text-gray-900">{email}</p>
            </div>
          </div>
        </section>

        {/* ── Account actions ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-2">
          <Link
            href="/sign-in/forgot-password"
            className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <KeyRound className="h-4 w-4 text-gray-400" />
            เปลี่ยนรหัสผ่าน
          </Link>
          <div className="mx-4 h-px bg-gray-100" />
          <SignOutButton />
        </section>

        {/* ── Danger zone ── */}
        <section className="rounded-2xl border border-red-100 bg-white p-2">
          <DeleteAccountButton />
        </section>

        {/* ── Quick links ── */}
        <Link
          href="/dashboard"
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-700 transition-all hover:border-green-200 hover:shadow-sm"
        >
          <span className="flex items-center gap-2.5">
            <BarChart2 className="h-4 w-4 text-green-600" />
            ดูประวัติการวิเคราะห์
          </span>
          <span className="text-gray-300">→</span>
        </Link>

      </div>
    </div>
  )
}
