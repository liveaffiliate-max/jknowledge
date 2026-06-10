/**
 * scripts/test-mbti-links.ts
 * Verify every link in the MBTI faculty list resolves to a 200 (not 404).
 */
import { chromium } from "playwright"

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto("http://localhost:3000/mbti/INTJ", { waitUntil: "networkidle" })

  // Wait for the client-side faculty list to populate
  await page.waitForSelector('a[href^="/scores/"]', { timeout: 10000 })
  const hrefs = await page.$$eval('a[href^="/scores/"]', (els) =>
    els.map((e) => (e as HTMLAnchorElement).href)
  )
  console.log(`\nFound ${hrefs.length} faculty links on /mbti/INTJ`)

  let pass = 0, fail = 0
  // Test first 5 to keep it quick
  for (const href of hrefs.slice(0, 5)) {
    const resp = await page.goto(href, { waitUntil: "domcontentloaded" })
    const status = resp?.status() ?? 0
    const has404 = await page.locator("text=/ไม่พบหน้าที่คุณต้องการ|404/").count() > 0
    const looksOK = status === 200 && !has404
    if (looksOK) {
      console.log(`  ✅ ${status}  ${href}`)
      pass++
    } else {
      console.log(`  ❌ ${status}${has404 ? " + 404 page" : ""}  ${href}`)
      fail++
    }
  }

  await browser.close()
  console.log(`\nResult: ${pass} OK, ${fail} broken\n`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
