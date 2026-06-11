/** Lightweight email shape check. Server (Clerk) does the authoritative validation. */
export function validateEmail(value: string): string | undefined {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com"
  }
  return undefined
}
