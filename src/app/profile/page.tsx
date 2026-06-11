import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import Header from "@/components/layout/header"
import { getProfilePageData } from "@/server/queries"
import { AvatarUpload } from "./_components/avatar-upload"
import { EditNameForm }  from "./_components/edit-name-form"
import { SignOutButton } from "./_components/sign-out-button"
import { DeleteAccountButton } from "./_components/delete-account-button"
import { getMBTIProfile } from "@/data/mbti-types"
import {
  BarChart2, KeyRound, Mail, CalendarDays, TrendingUp, Brain, ChevronRight,
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

  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const firstName = user.firstName ?? ""
  const lastName  = user.lastName  ?? ""
  const fullName  = [firstName, lastName].filter(Boolean).join(" ") || "ผู้ใช้"
  const email     = user.emailAddresses[0]?.emailAddress ?? "—"
  const initials  = (firstName[0] ?? (fullName[0] ?? "U")).toUpperCase()

  // Kick off DB work in parallel with rendering; Suspense streams the rest.
  const dataPromise = getProfilePageData(clerkId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-xl px-4 py-8 space-y-4">

        {/* ── Avatar + name hero ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-5">
            <AvatarUpload
              initialImageUrl={user.imageUrl}
              initials={initials}
              fullName={fullName}
            />

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-gray-900">{fullName}</h1>
              <p className="flex items-center gap-1 truncate text-sm text-gray-400 mt-0.5">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                {email}
              </p>
              <Suspense fallback={
                <p className="flex items-center gap-1 text-xs text-gray-300 mt-1">
                  <CalendarDays className="h-3 w-3 flex-shrink-0" />
                  <span className="inline-block h-3 w-32 rounded bg-gray-100 animate-pulse" />
                </p>
              }>
                <JoinedDate dataPromise={dataPromise} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection dataPromise={dataPromise} />
        </Suspense>

        {/* ── MBTI badge ── */}
        <Suspense fallback={<MbtiSkeleton />}>
          <MbtiSection dataPromise={dataPromise} />
        </Suspense>

        {/* ── Edit name ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">ข้อมูลส่วนตัว</h2>
          <div className="space-y-5">
            <EditNameForm firstName={firstName} lastName={lastName} />

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
          <ChevronRight className="h-4 w-4 text-gray-300" />
        </Link>

      </div>
    </div>
  )
}

type DataPromise = ReturnType<typeof getProfilePageData>

async function JoinedDate({ dataPromise }: { dataPromise: DataPromise }) {
  const { stats } = await dataPromise
  return (
    <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
      <CalendarDays className="h-3 w-3 flex-shrink-0" />
      สมาชิกตั้งแต่ {formatThaiDate(stats.joinedAt)}
    </p>
  )
}

async function StatsSection({ dataPromise }: { dataPromise: DataPromise }) {
  const { stats } = await dataPromise
  return (
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
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <div className="mx-auto mb-1.5 h-5 w-5 rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto h-7 w-10 rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto mt-1 h-3 w-16 rounded bg-gray-100 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

async function MbtiSection({ dataPromise }: { dataPromise: DataPromise }) {
  const { mbti } = await dataPromise

  if (!mbti) {
    return (
      <Link
        href="/mbti"
        className="flex items-center justify-between rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-600 transition-all hover:border-green-300 hover:bg-green-50/40"
      >
        <span className="flex items-center gap-2.5">
          <Brain className="h-4 w-4 text-green-600" />
          ทำ MBTI เพื่อรับคำแนะนำคณะ
        </span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </Link>
    )
  }

  const Icon = getMBTIProfile(mbti.type)?.icon ?? Brain
  return (
    <Link
      href={`/mbti/${mbti.type.toLowerCase()}`}
      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-green-200 hover:shadow-sm"
    >
      <span className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${mbti.color}1a` }}
          aria-hidden
        >
          <Icon className="h-5 w-5" style={{ color: mbti.color }} />
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {mbti.type} · {mbti.nickname}
          </span>
          <span className="text-xs text-gray-400">บุคลิกของคุณ</span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-gray-300" />
    </Link>
  )
}

function MbtiSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4">
      <span className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse" />
        <span className="flex flex-col gap-1">
          <span className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
          <span className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-gray-200" />
    </div>
  )
}
