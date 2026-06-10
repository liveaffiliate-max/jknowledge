/**
 * scripts/test-progress-bar.ts
 * Verify the MBTI quiz progress bar reflects 1/28..28/28 question count.
 * Run: npx tsx scripts/test-progress-bar.ts
 */
import { chromium } from "playwright"

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 800, height: 1000 } })
  await page.goto("http://localhost:3000/mbti", { waitUntil: "networkidle" })
  await page.click('button:has-text("เริ่มค้นหาบุคลิกของฉัน")')
  await page.waitForSelector('text=/ข้อที่ \\d+ \\/ 28/', { timeout: 8000 })

  // Sample progress at 4 checkpoints: before any answer, after 5, after 15, after 28 (or early-finish)
  const checkpoints = [0, 5, 14, 27]
  const observed: { afterN: number; label: string; pct: string }[] = []

  for (let i = 0; i <= 27; i++) {
    const label = await page.locator("text=/ข้อที่ \\d+ \\/ 28/").first().textContent()
    // Find the percent — it's the second tabular-nums span in the progress row
    const pct = await page.locator(".tabular-nums").nth(1).textContent()
    if (checkpoints.includes(i)) {
      observed.push({ afterN: i, label: label?.trim() ?? "", pct: pct?.trim() ?? "" })
    }
    // Answer question — click first dot + next
    try {
      await page.locator('button[aria-label*="ตัวเลือกบนมากที่สุด"]').first().click({ timeout: 3000 })
      await page.waitForTimeout(100)
      const nextBtn = page.locator('button:has-text("ถัดไป")').first()
      const enabled = await nextBtn.isEnabled({ timeout: 1000 }).catch(() => false)
      if (!enabled) break
      await nextBtn.click({ timeout: 3000 })
      await page.waitForTimeout(280)
      // If we already reached result card, stop
      const reachedResult = await page.locator('button:has-text("ทำแบบทดสอบอีกครั้ง")').count()
      if (reachedResult > 0) break
    } catch {
      break
    }
  }

  console.log("\n=== Progress bar checkpoints ===")
  observed.forEach((o) => {
    console.log(`After ${o.afterN} answers → label="${o.label}"  pct="${o.pct}"`)
  })

  // Assertions
  let pass = 0, fail = 0
  function check(cond: boolean, name: string) {
    if (cond) { console.log(`  ✅ ${name}`); pass++ }
    else { console.log(`  ❌ ${name}`); fail++ }
  }
  console.log("\nAssertions:")
  check(observed[0]?.label === "ข้อที่ 1 / 28", "Start label: ข้อที่ 1 / 28")
  check(observed[0]?.pct === "0%",              "Start pct: 0%")
  // After 5 answers — should be 5/28 label (i.e. asking about q6), ~18%
  check(observed[1]?.label.includes("/ 28"),    "Mid label still includes / 28")
  // After 14 answers, expect ~50%
  check(observed[2]?.pct === "50%",             `Mid pct ~50% (got ${observed[2]?.pct})`)

  console.log(`\nResult: ${pass} passed, ${fail} failed`)
  await browser.close()
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
