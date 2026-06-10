import { chromium } from "playwright"
async function main() {
  const b = await chromium.launch({ headless: true })
  const p = await b.newPage()
  await p.goto("http://localhost:3000/mbti", { waitUntil: "networkidle" })
  await p.click('button:has-text("เริ่มค้นหาบุคลิกของฉัน")')
  await p.waitForSelector("text=/ฉัน/")
  const labels = await p.$$eval("button", (els) => els.map((e) => e.getAttribute("aria-label")).filter(Boolean))
  console.log("aria-labels:", JSON.stringify(labels))
  await b.close()
}
main()
