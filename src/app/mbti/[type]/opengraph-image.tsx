import { ImageResponse } from "next/og"
import { getMBTIProfile } from "@/data/mbti-types"
import { MBTI_ROLE_META } from "@/types/mbti"
import type { MBTIType } from "@/types/mbti"

export const runtime = "edge"
export const alt = "MBTI Result"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const VALID_TYPES = new Set<string>([
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
])

export default async function OGImage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const upperType = type.toUpperCase()

  if (!VALID_TYPES.has(upperType)) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", fontSize: 48, color: "#9ca3af" }}>
        Jknowledge MBTI
      </div>,
      { ...size }
    )
  }

  const profile = getMBTIProfile(upperType as MBTIType)
  if (!profile) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", fontSize: 48, color: "#9ca3af" }}>
        {upperType}
      </div>,
      { ...size }
    )
  }

  const roleMeta = MBTI_ROLE_META[profile.role]

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdf4 100%)",
        padding: "60px",
      }}
    >
      {/* Type letters */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        {upperType.split("").map((letter, i) => (
          <span
            key={i}
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: "#16a34a",
              letterSpacing: "-2px",
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Nickname */}
      <p style={{ fontSize: 40, fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
        "{profile.nickname}"
      </p>

      {/* Role badge */}
      <p style={{ fontSize: 22, color: "#6b7280", marginBottom: "4px" }}>
        {roleMeta.label}
      </p>

      {/* Tagline */}
      <p style={{ fontSize: 24, color: "#9ca3af", textAlign: "center", maxWidth: "800px" }}>
        {profile.tagline}
      </p>

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "40px" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>Jknowledge</span>
        <span style={{ fontSize: 16, color: "#d1d5db" }}>·</span>
        <span style={{ fontSize: 16, color: "#9ca3af" }}>มาทำแบบทดสอบ MBTI กัน!</span>
      </div>
    </div>,
    { ...size }
  )
}
