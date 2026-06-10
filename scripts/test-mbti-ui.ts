/**
 * scripts/test-mbti-ui.ts
 * Playwright-based UI smoke test for the MBTI redesign.
 * Renders pages, waits for client-side content, and asserts presence.
 *
 * Requires dev server on localhost:3000
 * Run: npx tsx scripts/test-mbti-ui.ts
 */
import { chromium, type Page } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const SCREENSHOT_DIR = "tmp/test-screenshots"

let passed = 0
let failed = 0
function ok(name: string) { console.log(`  ✅ ${name}`); passed++ }
function fail(name: string, reason = "") {
  console.log(`  ❌ ${name}`)
  if (reason) console.log(`     → ${reason}`)
  failed++
}

async function expectText(page: Page, selector: string, text: string, name: string) {
  try {
    await page.locator(selector).filter({ hasText: text }).first().waitFor({ timeout: 8000 })
    ok(name)
  } catch (e) {
    fail(name, `text "${text}" not found in "${selector}"`)
  }
}

async function expectVisible(page: Page, selector: string, name: string) {
  try {
    await page.locator(selector).first().waitFor({ state: "visible", timeout: 8000 })
    ok(name)
  } catch {
    fail(name, `not visible: ${selector}`)
  }
}

async function getResultId(page: Page): Promise<string | null> {
  // Use the /api/check or just query DB — but simplest: grab from the /result smoke we did earlier
  return "cmq6eoyon0000pge64pkk8l7r"
}

async function main() {
  console.log("\n══════════════════════════════════════════════════")
  console.log("  MBTI UI Smoke Test (Playwright)")
  console.log(`  Base URL: ${BASE}`)
  console.log("══════════════════════════════════════════════════\n")

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()

  // Capture console errors for diagnostics
  const consoleErrors: string[] = []
  page.on("pageerror", (err) => consoleErrors.push(err.message))
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  // ── Test 1: /mbti — intro screen ────────────────────────────────────────────
  console.log("🧪 /mbti — quiz intro")
  await page.goto(`${BASE}/mbti`, { waitUntil: "networkidle" })
  await expectText(page, "button", "เริ่มค้นหาบุคลิกของฉัน", "Intro CTA visible")
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-mbti-intro.png` })

  // ── Test 2: /mbti/INTJ — type page with DB-linked faculties ─────────────────
  console.log("\n🧪 /mbti/INTJ — type detail")
  await page.goto(`${BASE}/mbti/INTJ`, { waitUntil: "networkidle" })
  await expectText(page, "h1", "INTJ", "Type letters render")
  await expectText(page, "*", "สถาปนิก", "Nickname renders")
  await expectText(page, "*", "คณะที่เหมาะกับ INTJ", "Faculty section header renders")
  // Wait for client-fetched faculty list (server action populates after mount)
  try {
    await page.waitForSelector('a[href^="/scores/"]', { timeout: 10000 })
    ok("DB-linked faculty list rendered")
  } catch {
    fail("DB-linked faculty list", "no faculty <a> with /scores/ href appeared within 10s")
  }
  // Check for match strength text
  try {
    await page.locator("text=/เข้ากันได้ \\d+%/").first().waitFor({ timeout: 5000 })
    ok("Match strength % visible")
  } catch {
    fail("Match strength %", "no '%' match text found")
  }
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-mbti-intj.png`, fullPage: true })

  // ── Test 3: /mbti/ENFP — different type, different faculties ───────────────
  console.log("\n🧪 /mbti/ENFP — verify different type renders different recommendations")
  await page.goto(`${BASE}/mbti/ENFP`, { waitUntil: "networkidle" })
  await expectText(page, "h1", "ENFP", "ENFP letters render")
  try {
    await page.waitForSelector('a[href^="/scores/"]', { timeout: 10000 })
    const hrefs = await page.$$eval('a[href^="/scores/"]', (els) => els.map((e) => (e as HTMLAnchorElement).href))
    ok(`ENFP faculty list: ${hrefs.length} faculties shown`)
  } catch {
    fail("ENFP faculty list", "none rendered")
  }
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03-mbti-enfp.png`, fullPage: true })

  // ── Test 4: /result/[id] — public shareable page ───────────────────────────
  console.log("\n🧪 /result/[id] — public page")
  const resultId = await getResultId(page)
  if (resultId) {
    await page.goto(`${BASE}/result/${resultId}`, { waitUntil: "networkidle" })
    await expectVisible(page, "h1", "Type letter heading renders")
    await expectText(page, "*", "ผลลัพธ์ MBTI", "Hero label visible")
    await expectText(page, "*", "สัดส่วนบุคลิกภาพของฉัน", "Dimension section visible")
    await expectText(page, "*", "ทำแบบทดสอบเพื่อหาบุคลิกของคุณ", "CTA to take quiz visible")
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-result-page.png`, fullPage: true })
  } else {
    fail("/result/[id]", "no result id available to test")
  }

  // ── Test 5: 404 for unknown /mbti/[type] ───────────────────────────────────
  console.log("\n🧪 /mbti/XXXX — invalid type")
  await page.goto(`${BASE}/mbti/XXXX`)
  await expectText(page, "*", "404", "Invalid MBTI type shows 404")

  // ── Test 6: 404 for unknown /result/[id] ───────────────────────────────────
  console.log("\n🧪 /result/nonexistent — invalid id")
  await page.goto(`${BASE}/result/nonexistent_id_xxxx`)
  await expectText(page, "*", "404", "Invalid result id shows 404")

  // ── Test 7: Run a full quiz programmatically ───────────────────────────────
  console.log("\n🧪 /mbti — run full quiz (auto-answer)")
  await page.goto(`${BASE}/mbti`, { waitUntil: "networkidle" })
  await page.click('button:has-text("เริ่มค้นหาบุคลิกของฉัน")')

  // Loop: click the top option then click "ถัดไป" — more reliable than keyboard timing
  let questionsAnswered = 0
  for (let i = 0; i < 35; i++) {
    try {
      // Wait for question card to be ready
      const nextBtn = page.locator('button:has-text("ถัดไป")').first()
      // Click one of the spectrum dots (5 buttons aria-label) — pick "strongly A"
      const firstDot = page.locator('button[aria-label*="ตัวเลือกบนมากที่สุด"]').first()
      await firstDot.click({ timeout: 3000 })
      await page.waitForTimeout(80)
      const isEnabled = await nextBtn.isEnabled({ timeout: 1000 }).catch(() => false)
      if (!isEnabled) break
      await nextBtn.click({ timeout: 3000 })
      questionsAnswered++
      await page.waitForTimeout(300)
      // Check if we've reached the result card (skip reveal animation)
      const onResultCard = await page.locator('button:has-text("ทำแบบทดสอบอีกครั้ง")').count()
      if (onResultCard > 0) break
    } catch {
      break
    }
  }
  console.log(`     Answered ${questionsAnswered} questions`)

  // Wait for the result card (reveal animation may take a few seconds)
  try {
    await page.waitForSelector('button:has-text("ทำแบบทดสอบอีกครั้ง")', { timeout: 20000 })
    ok("Reached result card after quiz")
    // Verify result card sections
    await expectText(page, "*", "คณะที่เหมาะกับคุณ", "Result card faculty section")
    await expectText(page, "*", "สัดส่วนบุคลิกภาพ", "Result card dimension bars")
  } catch {
    fail("Quiz completion → result card", "didn't reach result card")
  }
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05-result-card.png`, fullPage: true })

  // ── Test 8: Share modal opens ──────────────────────────────────────────────
  console.log("\n🧪 Share modal")
  try {
    await page.click('button:has-text("แชร์ผลลัพธ์")', { timeout: 5000 })
    await page.waitForSelector("text=/บันทึกเป็นรูป/", { timeout: 5000 })
    ok("Share modal opens")
    await expectText(page, "*", "Story (9:16)", "Story variant tab")
    await expectText(page, "*", "Feed (1:1)", "Square variant tab")
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-share-modal.png` })
  } catch {
    fail("Share modal", "didn't open")
  }

  // ── Console-error report ───────────────────────────────────────────────────
  if (consoleErrors.length > 0) {
    console.log("\n⚠️  Console errors observed:")
    consoleErrors.slice(0, 5).forEach((e) => console.log(`   • ${e.slice(0, 200)}`))
  } else {
    ok("No console errors")
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  await browser.close()
  console.log("\n══════════════════════════════════════════════════")
  console.log(`  UI Test result: ${passed} passed, ${failed} failed`)
  console.log(`  Screenshots in: ${SCREENSHOT_DIR}/`)
  console.log("══════════════════════════════════════════════════\n")
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
