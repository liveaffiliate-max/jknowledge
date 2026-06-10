import { chromium } from "playwright"

async function main() {
  const b = await chromium.launch({ headless: true })
  const p = await b.newPage({ viewport: { width: 720, height: 900 } })
  await p.goto("http://localhost:3000/mbti", { waitUntil: "networkidle" })
  await p.click('button:has-text("เริ่มค้นหาบุคลิกของฉัน")')
  await p.waitForSelector('button:has-text("ถัดไป"), button:has-text("เลือกคำตอบก่อน")')
  await p.screenshot({ path: "tmp/test-screenshots/07-progress-start.png" })
  for (let i = 0; i < 14; i++) {
    await p.locator('button[aria-label*="ตัวเลือกบนมากที่สุด"]').first().click()
    await p.waitForTimeout(100)
    await p.locator('button:has-text("ถัดไป")').first().click()
    await p.waitForTimeout(280)
  }
  await p.screenshot({ path: "tmp/test-screenshots/08-progress-mid.png" })
  await b.close()
}
main()
