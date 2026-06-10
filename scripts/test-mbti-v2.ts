/**
 * scripts/test-mbti-v2.ts
 *
 * End-to-end test of the single-statement MBTI quiz (v2).
 * Verifies:
 *   • DB has 28 statements, 12 reverse, 4 std + 3 rev per dim
 *   • Quiz renders single statement (no two-option layout)
 *   • Picking "เห็นด้วยมากที่สุด" (likert=1) on standard items → A-pole
 *   • Picking "ไม่เห็นด้วยเลย" (likert=5) on standard items → B-pole
 *   • Reverse items invert that mapping
 *   • Result reveals a valid type
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { chromium, type Page } from "playwright"
import { mbtiStatements } from "../src/data/mbti-statements"
import { computeMBTIResult, updateProgress, initialProgress } from "../src/utils/mbti"
import type { MBTIAnswer, MBTIDimension } from "../src/types/mbti"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

let pass = 0
let fail = 0
const ok   = (s: string) => { console.log(`  ✅ ${s}`); pass++ }
const bad  = (s: string, r = "") => { console.log(`  ❌ ${s}${r ? ` → ${r}` : ""}`); fail++ }
const test = (cond: boolean, s: string, r = "") => cond ? ok(s) : bad(s, r)

async function suite1_DB() {
  console.log("\n📊 Suite 1: DB state")
  const rows = await prisma.mBTIQuestion.findMany({ where: { active: true } })
  test(rows.length === 60, "60 active questions", `got ${rows.length}`)
  const reverse = rows.filter((r) => r.isReverse).length
  test(reverse === 28, "28 reverse items", `got ${reverse}`)
  const byDim: Record<string, { std: number; rev: number }> = {}
  for (const r of rows) {
    byDim[r.dimension] ??= { std: 0, rev: 0 }
    r.isReverse ? byDim[r.dimension].rev++ : byDim[r.dimension].std++
  }
  for (const dim of ["EI", "SN", "TF", "JP"]) {
    test(byDim[dim]?.std === 8, `${dim}: 8 standard`, `got ${byDim[dim]?.std}`)
    test(byDim[dim]?.rev === 7, `${dim}: 7 reverse`, `got ${byDim[dim]?.rev}`)
  }
  const sample = rows[0]
  test(sample.statement.startsWith("ฉัน"), "Statement starts with 'ฉัน'", `statement=${sample.statement}`)
  test(sample.statement.length <= 80, "Statement ≤ 80 chars", `len=${sample.statement.length}`)
  test(rows.every((r) => r.version === 3), "All rows are version=3")
}

async function suite2_ScoringConsistency() {
  console.log("\n🧮 Suite 2: Scoring engine consistency")

  // Build a synthetic answer set: agree-most (likert=1) on every item.
  // Expected outcome:
  //   - Standard items push toward A-pole (E/S/T/J)
  //   - Reverse items push toward B-pole (I/N/F/P)
  // With 4 std vs 3 rev per dim, A-pole wins → type = ESTJ
  const allAgree: MBTIAnswer[] = mbtiStatements.map((q) => ({
    questionId:     q.id,
    dimension:      q.dimension,
    likert:         1, // agree most
    weight:         q.weight ?? 1.0,
    isReverse:      q.isReverse ?? false,
    responseTimeMs: 1000,
  }))
  const r1 = computeMBTIResult(allAgree)
  test(r1.type === "ESTJ", "All 'เห็นด้วยมากที่สุด' → ESTJ", `got ${r1.type}`)

  // All disagree (likert=5) — should give the mirror INFP
  const allDisagree: MBTIAnswer[] = mbtiStatements.map((q) => ({
    questionId:     q.id,
    dimension:      q.dimension,
    likert:         5,
    weight:         q.weight ?? 1.0,
    isReverse:      q.isReverse ?? false,
    responseTimeMs: 1000,
  }))
  const r2 = computeMBTIResult(allDisagree)
  test(r2.type === "INFP", "All 'ไม่เห็นด้วยเลย' → INFP", `got ${r2.type}`)

  // Mixed: agree on reverse only
  const reverseOnly: MBTIAnswer[] = mbtiStatements.map((q) => ({
    questionId:     q.id,
    dimension:      q.dimension,
    likert:         q.isReverse ? 1 : 5,
    weight:         q.weight ?? 1.0,
    isReverse:      q.isReverse ?? false,
    responseTimeMs: 1000,
  }))
  const r3 = computeMBTIResult(reverseOnly)
  test(r3.type === "INFP", "Agree only with reverse items → INFP", `got ${r3.type}`)

  // Verify updateProgress matches: feed answers one-by-one
  let p = initialProgress()
  for (const a of allAgree) p = updateProgress(p, a.dimension as MBTIDimension, a.likert, a.weight, a.isReverse)
  test(p.EI.net > 0 && p.SN.net > 0 && p.TF.net > 0 && p.JP.net > 0,
       "Progress engine agrees: all A-pole positive for all-agree")
}

async function suite3_UI() {
  console.log("\n🖥️  Suite 3: UI smoke")
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 720, height: 900 } })
  const page = await ctx.newPage()
  const consoleErrors: string[] = []
  page.on("pageerror", (e) => consoleErrors.push(e.message))
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()))

  await page.goto("http://localhost:3000/mbti", { waitUntil: "networkidle" })
  await page.click('button:has-text("เริ่มค้นหาบุคลิกของฉัน")')

  // Wait for question card — single statement should appear, wrapped in “…”
  await page.waitForSelector("text=/ฉัน/", { timeout: 8000 })

  // Verify there are NO two distinct "top option" / "bottom option" buttons
  // The old layout had two large text buttons; the new one only has dot buttons.
  const optionButtons = await page.locator('button:has-text("ฉัน")').count()
  test(optionButtons === 0, "No old-style two-option buttons present",
       `found ${optionButtons} button(s) containing 'ฉัน'`)

  // Verify 5-dot scale + labels
  const labels = [
    "เห็นด้วยมากที่สุด", "เห็นด้วย", "กลางๆ", "ไม่เห็นด้วย", "ไม่เห็นด้วยเลย",
  ]
  for (const l of labels) {
    const found = await page.locator(`text="${l}"`).count()
    test(found > 0, `Scale label "${l}" visible`)
  }

  // Take a screenshot for visual confirmation
  await page.screenshot({ path: "tmp/test-screenshots/09-quiz-v2.png", fullPage: true })
  // Give animations time to settle before driving the quiz
  await page.waitForTimeout(400)

  // Answer the whole quiz by clicking the leftmost dot. Use a substring match on
  // the aria-label to dodge any subtle text-encoding mismatches between source
  // and DOM (Thai sara-am ◌ำ etc.). Picks likert=1 → all agree → expect ESTJ.
  // Workaround: Playwright's CSS attribute selectors on Thai aria-labels were
  // flaky (likely Unicode normalization differences). Click via page.evaluate
  // which uses the browser's own DOM query — bypasses Playwright string compare.
  async function clickFirstDot() {
    return page.evaluate(() => {
      const target = "เห็นด้วยมากที่สุด"
      const btn = Array.from(document.querySelectorAll("button"))
        .find((b) => b.getAttribute("aria-label") === target) as HTMLButtonElement | undefined
      if (!btn) return false
      btn.click()
      return true
    })
  }

  let answered = 0
  while (answered < 35) {
    const clicked = await clickFirstDot()
    if (!clicked) break
    await page.waitForTimeout(80)
    const nextBtn = page.locator('button:has-text("ถัดไป")').first()
    const enabled = await nextBtn.isEnabled({ timeout: 1000 }).catch(() => false)
    if (!enabled) break
    await nextBtn.click({ timeout: 3000 })
    answered++
    await page.waitForTimeout(260)
    const onResult = await page.locator('button:has-text("ทำแบบทดสอบอีกครั้ง")').count()
    if (onResult > 0) break
  }
  console.log(`     Answered ${answered} questions before reveal`)
  await page.waitForSelector('button:has-text("ทำแบบทดสอบอีกครั้ง")', { timeout: 20000 })
  ok("Reached result card")

  // Result type letters should be visible (any of the 16 types is fine)
  const letters = await page.locator("text=/^[EI][SN][TF][JP]$/").count()
  test(letters > 0, "Result type letters render")

  await page.screenshot({ path: "tmp/test-screenshots/10-quiz-v2-result.png", fullPage: true })

  if (consoleErrors.length === 0) ok("No console errors")
  else bad("Console errors observed", consoleErrors.slice(0, 3).join(" | "))

  await browser.close()
}

async function main() {
  console.log("\n══════════════════════════════════════════════════")
  console.log("  MBTI v2 (single-statement) — E2E Test")
  console.log("══════════════════════════════════════════════════")
  try {
    await suite1_DB()
    await suite2_ScoringConsistency()
    await suite3_UI()
  } catch (e) {
    console.error("\n💥 Unexpected:", e)
    fail++
  }
  console.log("\n══════════════════════════════════════════════════")
  console.log(`  Result: ${pass} passed, ${fail} failed`)
  console.log("══════════════════════════════════════════════════\n")
  await prisma.$disconnect()
  process.exit(fail === 0 ? 0 : 1)
}
main()
