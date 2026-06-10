import { chromium } from "playwright"
async function main() {
  const b = await chromium.launch({ headless: true })
  const p = await b.newPage()
  await p.goto("http://localhost:3000/scores/kmutt", { waitUntil: "networkidle" })
  // Click a link inside the faculty list
  const link = p.locator('a[href="/scores/kmutt/cmps8m5um00uer8e651iwt2p1"]').first()
  await link.click()
  await p.waitForLoadState("networkidle")
  const url = p.url()
  const has404 = await p.locator("text=/ไม่พบหน้าที่คุณต้องการ|404/").count()
  const facName = await p.locator("h1, h2").first().textContent().catch(() => "")
  console.log(`After click: url=${url} 404Text=${has404} title="${facName?.trim()}"`)
  await b.close()
}
main()
