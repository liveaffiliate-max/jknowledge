"use client"

import { useState, useTransition } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toaster"
import { deleteAccountAction } from "@/server/actions"

const CONFIRM_PHRASE = "ลบบัญชี"

export function DeleteAccountButton() {
  const [open, setOpen]         = useState(false)
  const [phrase, setPhrase]     = useState("")
  const [pending, startDelete]  = useTransition()
  const { signOut }             = useClerk()
  const { user }                = useUser()
  const router                  = useRouter()
  const { toast }               = useToast()

  function handleDelete() {
    if (phrase.trim() !== CONFIRM_PHRASE) {
      toast(`พิมพ์ "${CONFIRM_PHRASE}" ให้ตรงเพื่อยืนยัน`, "error")
      return
    }

    startDelete(async () => {
      // 1) Wipe DB rows (predictions + MBTI results + User row)
      const res = await deleteAccountAction()
      if (!res.ok) {
        toast("ลบข้อมูลไม่สำเร็จ ลองอีกครั้ง", "error")
        return
      }

      // 2) Delete Clerk account from the client (uses the signed-in session)
      try {
        if (user) await user.delete()
      } catch {
        // If Clerk delete fails, sign out instead — DB rows are gone, account is orphan
        await signOut(() => router.push("/"))
        toast("ลบข้อมูลแล้ว แต่ลบบัญชี Clerk ไม่สำเร็จ — ติดต่อ admin", "info")
        return
      }

      // 3) Sign out + go home
      await signOut(() => router.push("/"))
      toast("ลบบัญชีและข้อมูลเรียบร้อยแล้ว", "success")
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        )}
      >
        <Trash2 className="h-4 w-4" />
        ลบบัญชีถาวร
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-3">
      <div className="flex gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
        <div className="text-xs text-red-700 leading-relaxed">
          <p className="font-semibold mb-1">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          <p>ระบบจะลบบัญชี + ประวัติการวิเคราะห์ + ผล MBTI ออกจากระบบทั้งหมดทันที</p>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1.5">
          พิมพ์ <span className="font-mono font-semibold text-red-700">{CONFIRM_PHRASE}</span> เพื่อยืนยัน
        </label>
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          disabled={pending}
          autoFocus
          className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setPhrase("") }}
          disabled={pending}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending || phrase.trim() !== CONFIRM_PHRASE}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          {pending ? "กำลังลบ…" : "ลบบัญชีถาวร"}
        </button>
      </div>
    </div>
  )
}
