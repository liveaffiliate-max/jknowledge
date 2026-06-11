/**
 * Extracts the 11-character YouTube video ID from a full URL
 * (watch, youtu.be, embed, shorts — playlist params etc. are ignored).
 * If the input already looks like a bare video ID, it's returned as-is.
 */
export function getYoutubeVideoId(input: string): string {
  const trimmed = input.trim()

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)

    const v = url.searchParams.get("v")
    if (v) return v

    // youtu.be/<id>, /embed/<id>, /shorts/<id>
    const segments = url.pathname.split("/").filter(Boolean)
    const last = segments[segments.length - 1]
    if (last) return last
  } catch {
    // not a valid URL — fall through and return the raw input
  }

  return trimmed
}
