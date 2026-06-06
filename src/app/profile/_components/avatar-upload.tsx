"use client"

import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { useRef, useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
  /** Initial values from Server Component (used for first render before hydration) */
  initialImageUrl: string | null
  initials:        string
  fullName:        string
}

export function AvatarUpload({ initialImageUrl, initials, fullName }: AvatarUploadProps) {
  const { user, isLoaded } = useUser()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState("")

  // After hydration use live Clerk data; fall back to server-passed values
  const imageUrl = isLoaded ? (user?.imageUrl ?? null) : initialImageUrl

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setError("เลือกเฉพาะไฟล์รูปภาพ")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 10 MB")
      return
    }

    setError("")
    setUploading(true)
    try {
      await user.setProfileImage({ file })
    } catch {
      setError("อัปโหลดไม่สำเร็จ ลองอีกครั้ง")
    } finally {
      setUploading(false)
      // Reset input so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Avatar wrapper — clickable */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="เปลี่ยนรูปโปรไฟล์"
        className={cn(
          "group relative h-20 w-20 flex-shrink-0 rounded-full",
          "ring-2 ring-green-500 ring-offset-2",
          "transition-opacity focus:outline-none focus-visible:ring-green-400",
          uploading ? "cursor-wait opacity-70" : "cursor-pointer"
        )}
      >
        {/* Photo or initials */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={fullName}
            fill
            className="rounded-full object-cover"
            sizes="80px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
            {initials}
          </span>
        )}

        {/* Overlay on hover / uploading */}
        <span
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 transition-opacity",
            uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          aria-hidden="true"
        >
          {uploading
            ? <Loader2 className="h-5 w-5 animate-spin text-white" />
            : <Camera className="h-5 w-5 text-white" />
          }
        </span>
      </button>

      {/* Label */}
      <p className="text-[11px] text-gray-400">
        {uploading ? "กำลังอัปโหลด…" : "กดเพื่อเปลี่ยนรูป"}
      </p>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
