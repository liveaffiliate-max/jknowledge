/**
 * Quick unit test for getDimensionBreakdown (Phase 1 / A.4)
 */
import { getDimensionBreakdown, EDGE_BAND } from "../src/utils/mbti"

let pass = 0, fail = 0
const ok  = (s: string) => { console.log(`  ✅ ${s}`); pass++ }
const bad = (s: string, r = "") => { console.log(`  ❌ ${s}${r ? ` → ${r}` : ""}`); fail++ }
const t   = (cond: boolean, s: string, r = "") => cond ? ok(s) : bad(s, r)

console.log("\n🧮 getDimensionBreakdown")

// Case 1: clear ESTJ — strong dominance everywhere
{
  const b = getDimensionBreakdown({
    E: 10, I: 2, S: 8, N: 1, T: 9, F: 3, J: 12, P: 2,
  })
  t(b[0].letter === "E" && b[0].pct === 83, "E dominant 83%", `got ${b[0].letter} ${b[0].pct}%`)
  t(b[1].letter === "S" && b[1].pct === 89, "S dominant 89%", `got ${b[1].letter} ${b[1].pct}%`)
  t(b[2].letter === "T" && b[2].pct === 75, "T dominant 75%", `got ${b[2].letter} ${b[2].pct}%`)
  t(b[3].letter === "J" && b[3].pct === 86, "J dominant 86%", `got ${b[3].letter} ${b[3].pct}%`)
  t(b.every((x) => !x.edge), "No edge flags on strong result")
}

// Case 2: edge — 51% J
{
  const b = getDimensionBreakdown({
    E: 10, I: 2, S: 8, N: 1, T: 9, F: 3, J: 51, P: 49,
  })
  t(b[3].letter === "J" && b[3].pct === 51, "J 51%", `got ${b[3].letter} ${b[3].pct}%`)
  t(b[3].edge === true, "J 51% flagged as edge")
}

// Case 3: total-zero defaults to 50/50, dominant defaults to A
{
  const b = getDimensionBreakdown({
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
  })
  t(b[0].letter === "E" && b[0].pct === 50, "Zero scores → E 50%")
  t(b[0].edge === true, "Zero scores → edge")
}

// Case 4: exact 50/50 tie
{
  const b = getDimensionBreakdown({
    E: 5, I: 5, S: 10, N: 1, T: 9, F: 3, J: 12, P: 2,
  })
  t(b[0].pct === 50 && b[0].edge === true, "E=I tie → 50% edge")
}

// Case 5: EDGE_BAND boundary
{
  // 53% — should be edge (≤ 53)
  const b = getDimensionBreakdown({
    E: 53, I: 47, S: 8, N: 1, T: 9, F: 3, J: 12, P: 2,
  })
  t(b[0].pct === 53 && b[0].edge === true, `53% is edge (band=${EDGE_BAND})`)

  // 54% — should NOT be edge
  const b2 = getDimensionBreakdown({
    E: 54, I: 46, S: 8, N: 1, T: 9, F: 3, J: 12, P: 2,
  })
  t(b2[0].pct === 54 && b2[0].edge === false, "54% is not edge")
}

console.log(`\n  Result: ${pass} passed, ${fail} failed\n`)
process.exit(fail === 0 ? 0 : 1)
