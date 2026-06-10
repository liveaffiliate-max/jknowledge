/**
 * scripts/seed-mbti-statements.ts
 *
 * Re-seeds MBTIQuestion table with the new single-statement v2 format.
 * Deletes existing question rows first (no foreign key dependencies).
 *
 * Run: npx tsx scripts/seed-mbti-statements.ts
 *      npx tsx scripts/seed-mbti-statements.ts --dry-run
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { mbtiStatements } from "../src/data/mbti-statements"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const DRY = process.argv.includes("--dry-run")

async function main() {
  console.log("\n══════════════════════════════════════════════════")
  console.log("  Re-seed MBTI questions — single-statement v2")
  console.log("══════════════════════════════════════════════════\n")

  console.log(`Loaded ${mbtiStatements.length} statements from src/data/mbti-statements.ts`)

  // Sanity counts
  const byDim: Record<string, { std: number; rev: number }> = {}
  for (const q of mbtiStatements) {
    byDim[q.dimension] ??= { std: 0, rev: 0 }
    q.isReverse ? byDim[q.dimension].rev++ : byDim[q.dimension].std++
  }
  for (const [d, c] of Object.entries(byDim)) {
    console.log(`  ${d}: ${c.std} standard + ${c.rev} reverse = ${c.std + c.rev}`)
  }
  const reverseCount = mbtiStatements.filter((q) => q.isReverse).length
  console.log(`Total reverse: ${reverseCount}/${mbtiStatements.length} = ${Math.round((reverseCount / mbtiStatements.length) * 100)}%`)

  if (DRY) {
    console.log("\n[dry-run] Skipping DB writes. Sample row:")
    console.log(mbtiStatements[0])
    await prisma.$disconnect()
    return
  }

  console.log("\nDeleting existing MBTIQuestion rows…")
  const { count: deletedCount } = await prisma.mBTIQuestion.deleteMany({})
  console.log(`  Removed ${deletedCount} old rows`)

  console.log("\nInserting new statements…")
  let inserted = 0
  for (const q of mbtiStatements) {
    await prisma.mBTIQuestion.create({
      data: {
        order:     q.id,
        dimension: q.dimension,
        text:      q.text,
        optionA:   q.optionA,
        optionB:   q.optionB,
        weight:    q.weight ?? 1.0,
        isReverse: q.isReverse ?? false,
        category:  q.category ?? null,
        version:   2,
        active:    true,
      },
    })
    inserted++
  }
  console.log(`  Inserted ${inserted} rows (version=2)`)

  console.log("\n✅ Done.")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
