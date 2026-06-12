/** Lightweight email shape check. Server (Clerk) does the authoritative validation. */
export function validateEmail(value: string): string | undefined {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com"
  }
  return undefined
}

/**
 * Validate a post-auth redirect target. Only same-origin paths starting with "/" are allowed
 * (rejects "//evil.com", "http://...", javascript:, etc.) to prevent open-redirect attacks.
 * Auth routes themselves are skipped — bouncing back to /sign-in after sign-in is useless.
 */
export function getSafeRedirect(raw: string | null | undefined): string {
  if (!raw) return "/"
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/"
  if (raw.startsWith("/sign-in") || raw.startsWith("/sign-up")) return "/"
  return raw
}

/**
 * Attach `?redirect_url=<current>` to an auth link so the user lands back where they came from
 * after signing in. Skips when current path is already an auth route or the home page.
 */
export function withRedirect(authHref: string, currentPath: string): string {
  const safe = getSafeRedirect(currentPath)
  if (safe === "/") return authHref
  return `${authHref}?redirect_url=${encodeURIComponent(safe)}`
}
