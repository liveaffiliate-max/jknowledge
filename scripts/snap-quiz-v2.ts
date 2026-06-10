import { chromium } from "playwright"
async function main() {
  const b = await chromium.launch({ headless: true })
  const p = await b.newPage({ viewport: { width: 720, height: 1100 } })
  await p.goto("http://localhost:3000/mbti", { waitUntil: "networkidle" })
  await p.click('button:has-text("เริ่มค้นหาบุคลิกของฉัน")')
  await p.waitForSelector("text=/ฉัน/")
  await p.waitForTimeout(800) // let fade-in animation finish
  await p.screenshot({ path: "tmp/test-screenshots/11-quiz-v2-clean.png" })
  // Click a dot then capture again
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button"))
      .find((b) => b.getAttribute("aria-label") === "เห็นด้วย") as HTMLButtonElement | undefined
    btn?.click()
  })
  await p.waitForTimeout(300)
  await p.screenshot({ path: "tmp/test-screenshots/12-quiz-v2-selected.png" })
  await b.close()
}
main()
