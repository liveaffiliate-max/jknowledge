/**
 * Audit which university logos exist on Supabase Storage.
 * Sends a HEAD request per university and reports missing ones.
 *
 * Run: npx tsx scripts/audit-logos.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

// Inline URL builder — university-logo.ts captures env at module load,
// but dotenv runs after imports, so it would see undefined.
const BUCKET = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/University%20logo`
const OVERRIDES: Record<string, string> = { kmitl: "KMITL" }
function getUniversityLogoUrl(slug: string): string {
  return `${BUCKET}/${OVERRIDES[slug] ?? slug}.png`
}

const CONCURRENCY = 10

async function checkLogo(slug: string): Promise<{ slug: string; ok: boolean; status: number; err?: string }> {
  const url = getUniversityLogoUrl(slug)
  try {
    const res = await fetch(url, { method: "GET" })
    // Drain body so the connection can be reused
    await res.arrayBuffer().catch(() => {})
    return { slug, ok: res.ok, status: res.status }
  } catch (e) {
    return { slug, ok: false, status: 0, err: String(e).slice(0, 100) }
  }
}

async function pool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let i = 0
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx])
    }
  })
  await Promise.all(workers)
  return results
}

async function main() {
  const unis = await prisma.university.findMany({
    select: { slug: true, name: true, shortName: true },
    orderBy: { name: "asc" },
  })
  console.log(`Checking ${unis.length} university logos...\n`)

  const results = await pool(unis, CONCURRENCY, (u) => checkLogo(u.slug))

  const missing = results.filter((r) => !r.ok)
  const ok = results.length - missing.length

  console.log(`\n✅ Found      : ${ok}`)
  console.log(`❌ Missing    : ${missing.length}\n`)

  if (missing.length > 0) {
    console.log("Missing logos:")
    for (const m of missing) {
      const uni = unis.find((u) => u.slug === m.slug)!
      console.log(`  ${m.status.toString().padStart(3)} | ${m.slug.padEnd(40)} | ${(uni.shortName ?? "").padEnd(12)} | ${m.err ?? ""}`)
    }
    console.log("\nExpected filenames at Supabase bucket 'University logo':")
    for (const m of missing) console.log(`  ${m.slug}.png`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
