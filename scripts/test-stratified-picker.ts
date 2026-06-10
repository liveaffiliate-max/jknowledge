/**
 * scripts/test-stratified-picker.ts
 *
 * Verifies the deterministic stratified picker (Phase A.1).
 *   • Same seed → identical subset & order
 *   • Different seed → different subset
 *   • Quota per dim respected (4 std + 2 rev per dim = 24 total)
 *   • Scoring still works: "all agree" on the drawn subset → ESTJ
 *   • Round-robin interleaving keeps consecutive items in different dims
 */
import {
  pickQuestionsForSession,
  SESSION_PER_DIM,
  SESSION_TOTAL,
  hashStringToSeed,
  mulberry32,
  computeMBTIResult,
} from "../src/utils/mbti"
import { mbtiStatements } from "../src/data/mbti-statements"
import type { MBTIAnswer, MBTIDimension } from "../src/types/mbti"

let pass = 0, fail = 0
const ok  = (s: string) => { console.log(`  ✅ ${s}`); pass++ }
const bad = (s: string, r = "") => { console.log(`  ❌ ${s}${r ? ` → ${r}` : ""}`); fail++ }
const t   = (cond: boolean, s: string, r = "") => cond ? ok(s) : bad(s, r)

console.log("\n📦 Pool sanity")
t(mbtiStatements.length === 60, `Pool size = 60`, `got ${mbtiStatements.length}`)

const byDim: Record<string, { std: number; rev: number }> = {}
for (const q of mbtiStatements) {
  byDim[q.dimension] ??= { std: 0, rev: 0 }
  q.isReverse ? byDim[q.dimension].rev++ : byDim[q.dimension].std++
}
for (const d of ["EI", "SN", "TF", "JP"]) {
  t(byDim[d].std === 8, `${d}: 8 standard`, `got ${byDim[d]?.std}`)
  t(byDim[d].rev === 7, `${d}: 7 reverse`, `got ${byDim[d]?.rev}`)
}

console.log("\n🎲 Determinism")
const seedA = "user_alice"
const seedB = "user_bob"
const a1 = pickQuestionsForSession(mbtiStatements, seedA)
const a2 = pickQuestionsForSession(mbtiStatements, seedA)
const b1 = pickQuestionsForSession(mbtiStatements, seedB)

t(a1.length === SESSION_TOTAL, `Session length = ${SESSION_TOTAL}`, `got ${a1.length}`)
t(a1.length === 24, "Session length = 24 (4 dims × 6/dim)")
t(a1.every((q, i) => q.id === a2[i].id), "Same seed → identical order")
t(JSON.stringify(a1.map(q=>q.id)) !== JSON.stringify(b1.map(q=>q.id)), "Different seed → different subset")

console.log("\n📊 Quota per dim")
for (const dim of ["EI", "SN", "TF", "JP"] as MBTIDimension[]) {
  const items = a1.filter((q) => q.dimension === dim)
  const std = items.filter((q) => !q.isReverse).length
  const rev = items.filter((q) =>  q.isReverse).length
  t(std === SESSION_PER_DIM.std, `${dim}: ${SESSION_PER_DIM.std} std`, `got ${std}`)
  t(rev === SESSION_PER_DIM.rev, `${dim}: ${SESSION_PER_DIM.rev} rev`, `got ${rev}`)
}

console.log("\n🔀 Round-robin interleaving")
// First 4 items should be one from each dim (the round-robin layer)
const firstFourDims = new Set(a1.slice(0, 4).map((q) => q.dimension))
t(firstFourDims.size === 4, "First 4 items span 4 dims",
  `got dims: ${[...firstFourDims].join(",")}`)

console.log("\n🧮 Scoring still correct on subset")
const allAgree: MBTIAnswer[] = a1.map((q) => ({
  questionId:     q.id,
  dimension:      q.dimension,
  likert:         1,
  weight:         q.weight ?? 1.0,
  isReverse:      q.isReverse ?? false,
  responseTimeMs: 1000,
}))
const r = computeMBTIResult(allAgree)
t(r.type === "ESTJ", `All agree → ESTJ`, `got ${r.type}`)

console.log("\n🧪 RNG primitives")
const h1 = hashStringToSeed("hello")
const h2 = hashStringToSeed("hello")
const h3 = hashStringToSeed("world")
t(h1 === h2 && h1 !== h3, "hashStringToSeed deterministic + sensitive")
const rng = mulberry32(42)
const values = Array.from({ length: 5 }, () => rng())
const rng2 = mulberry32(42)
const values2 = Array.from({ length: 5 }, () => rng2())
t(JSON.stringify(values) === JSON.stringify(values2), "mulberry32 reproducible from same seed")
t(values.every((v) => v >= 0 && v < 1), "mulberry32 in [0,1)")

console.log(`\n  Result: ${pass} passed, ${fail} failed\n`)
process.exit(fail === 0 ? 0 : 1)
