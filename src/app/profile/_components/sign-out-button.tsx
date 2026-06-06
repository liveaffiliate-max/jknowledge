"use client"

import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => signOut(() => router.push("/"))}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors",
        "hover:bg-red-50"
      )}
    >
      <LogOut className="h-4 w-4" />
      ออกจากระบบ
    </button>
  )
}
