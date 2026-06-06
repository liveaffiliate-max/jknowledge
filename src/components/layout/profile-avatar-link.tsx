"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"

/**
 * Replaces Clerk's <UserButton> — a simple avatar link to /profile.
 * Uses the user's photo if available, otherwise shows initials.
 */
export function ProfileAvatarLink({ size = 36 }: { size?: number }) {
  const { user, isLoaded } = useUser()

  if (!isLoaded || !user) return null

  const firstName = user.firstName ?? ""
  const lastName  = user.lastName  ?? ""
  const initials  = (firstName[0] ?? lastName[0] ?? "U").toUpperCase()

  return (
    <Link
      href="/profile"
      aria-label="โปรไฟล์ของฉัน"
      className="relative flex-shrink-0 rounded-full ring-2 ring-green-600 ring-offset-2 ring-offset-white transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-green-400"
      style={{ width: size, height: size }}
    >
      {user.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={[firstName, lastName].filter(Boolean).join(" ") || "โปรไฟล์"}
          fill
          className="rounded-full object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
    </Link>
  )
}
