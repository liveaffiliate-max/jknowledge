import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"
import { getMBTIProfile } from "@/data/mbti-types"
import { MBTI_ROLE_META } from "@/types/mbti"
import type { MBTIType } from "@/types/mbti"

export const runtime = "nodejs" // needs Prisma — not edge-compatible
export const alt = "MBTI Result"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Dynamic OG image for a specific MBTI quiz result.
 * Renders the user's actual dimension ratios (E vs I percentage, etc.)
 * — differentiates one INTJ session from another even though they share the type page.
 */
export default async function OGImage({ params }: Props) {
  const { id } = await params
  const result = await prisma.mBTIResult.findUnique({
    where:  { id },
    select: { mbtiType: true, scores: true },
  })

  if (!result) {
    return fallback("Jknowledge MBTI")
  }

  const profile = getMBTIProfile(result.mbtiType as MBTIType)
  if (!profile) return fallback(result.mbtiType)

  const roleMeta = MBTI_ROLE_META[profile.role]
  const scores = result.scores as Record<string, number>

  // Compute dimension percentages
  const pct = (a: number, b: number) => {
    const total = a + b
    return total === 0 ? 50 : Math.round((a / total) * 100)
  }
  const ePct = pct(scores.E ?? 0, scores.I ?? 0)
  const sPct = pct(scores.S ?? 0, scores.N ?? 0)
  const tPct = pct(scores.T ?? 0, scores.F ?? 0)
  const jPct = pct(scores.J ?? 0, scores.P ?? 0)

  return new ImageResponse(
    <div
      style={{
        display:         "flex",
        flexDirection:   "row",
        width:           "100%",
        height:          "100%",
        background:      "linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdf4 100%)",
        padding:         "50px 60px",
      }}
    >
      {/* Left column — type + nickname */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", paddingRight: "40px" }}>
        <span style={{ fontSize: 28, color: "#6b7280", fontWeight: 500, marginBottom: "8px" }}>
          บุคลิกของฉัน
        </span>
        <div style={{ display: "flex", fontSize: 160, fontWeight: 900, color: "#16a34a", letterSpacing: "-4px", lineHeight: 1 }}>
          {result.mbtiType}
        </div>
        <span style={{ fontSize: 42, fontWeight: 700, color: "#1f2937", marginTop: "16px" }}>
          &ldquo;{profile.nickname}&rdquo;
        </span>
        <span
          style={{
            display:        "flex",
            alignSelf:      "flex-start",
            marginTop:      "16px",
            padding:        "8px 20px",
            borderRadius:   "9999px",
            border:         "2px solid #d1fae5",
            backgroundColor: "#ecfdf5",
            color:          "#047857",
            fontSize:       20,
            fontWeight:     700,
          }}
        >
          {roleMeta.label}
        </span>
        <span style={{ display: "flex", marginTop: "auto", alignItems: "center", gap: "10px", fontSize: 22 }}>
          <span style={{ fontWeight: 700, color: "#16a34a" }}>Jknowledge</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span style={{ color: "#9ca3af" }}>ทำ MBTI ของคุณเองที่ /mbti</span>
        </span>
      </div>

      {/* Right column — 4 dimension bars (the differentiator) */}
      <div style={{ display: "flex", flexDirection: "column", width: "440px", justifyContent: "center", gap: "20px" }}>
        <DimRow leftLabel="E" rightLabel="I" leftPct={ePct} />
        <DimRow leftLabel="S" rightLabel="N" leftPct={sPct} />
        <DimRow leftLabel="T" rightLabel="F" leftPct={tPct} />
        <DimRow leftLabel="J" rightLabel="P" leftPct={jPct} />
      </div>
    </div>,
    { ...size }
  )
}

function DimRow({ leftLabel, rightLabel, leftPct }: { leftLabel: string; rightLabel: string; leftPct: number }) {
  const dominantLeft = leftPct >= 50
  return (
    <div style={{
      display:         "flex",
      flexDirection:   "column",
      padding:         "14px 18px",
      borderRadius:    "16px",
      backgroundColor: "rgba(255,255,255,0.7)",
      border:          "2px solid #e5e7eb",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 900 }}>
        <span style={{ color: dominantLeft ? "#111827" : "#d1d5db" }}>{leftLabel}</span>
        <span style={{ color: !dominantLeft ? "#111827" : "#d1d5db" }}>{rightLabel}</span>
      </div>
      <div style={{
        display:         "flex",
        marginTop:       "8px",
        height:          "10px",
        borderRadius:    "9999px",
        backgroundColor: "#f3f4f6",
        overflow:        "hidden",
      }}>
        <div style={{
          display:         "flex",
          width:           `${leftPct}%`,
          height:          "100%",
          backgroundColor: "#22c55e",
          borderRadius:    "9999px",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: 18, color: "#6b7280", fontWeight: 600 }}>
        <span style={{ color: dominantLeft ? "#047857" : "#9ca3af" }}>{leftPct}%</span>
        <span style={{ color: !dominantLeft ? "#047857" : "#9ca3af" }}>{100 - leftPct}%</span>
      </div>
    </div>
  )
}

function fallback(text: string) {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", fontSize: 48, color: "#9ca3af" }}>
      {text}
    </div>,
    { ...size }
  )
}
