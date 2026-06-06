"use client"

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function EditNameForm({
  firstName: initialFirst,
  lastName:  initialLast,
}: {
  firstName: string
  lastName:  string
}) {
  const { user } = useUser()
  const [editing,   setEditing]   = useState(false)
  const [first,     setFirst]     = useState(initialFirst)
  const [last,      setLast]      = useState(initialLast)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [saved,     setSaved]     = useState(false)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError("")
    try {
      await user.update({ firstName: first.trim(), lastName: last.trim() })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError("บันทึกไม่สำเร็จ ลองอีกครั้ง")
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setFirst(initialFirst)
    setLast(initialLast)
    setEditing(false)
    setError("")
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</p>
          <p className="mt-0.5 text-base font-semibold text-gray-900">
            {[first, last].filter(Boolean).join(" ") || "—"}
          </p>
          {saved && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" /> บันทึกแล้ว
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-green-300 hover:text-green-700"
        >
          <Pencil className="h-3 w-3" />
          แก้ไข
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          placeholder="ชื่อ"
          className={cn(
            "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors",
            "placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 border-gray-200"
          )}
        />
        <input
          value={last}
          onChange={(e) => setLast(e.target.value)}
          placeholder="นามสกุล"
          className={cn(
            "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors",
            "placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 border-gray-200"
          )}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-xl bg-green-600 px-4 text-xs font-semibold text-white transition-all",
            "hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400"
          )}
        >
          <Check className="h-3.5 w-3.5" />
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-4 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300"
        >
          <X className="h-3.5 w-3.5" />
          ยกเลิก
        </button>
      </div>
    </div>
  )
}
