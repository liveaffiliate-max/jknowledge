/**
 * Download all university logos from Supabase Storage, resize to 96x96 WebP,
 * and save them into public/logos/ as static assets.
 *
 * This removes the per-request Vercel Image Optimization cost for logos —
 * they become pre-optimized static files served directly (with `unoptimized`
 * on the <Image> tag).
 *
 * Run: npx tsx scripts/download-logos.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import sharp from "sharp"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const BUCKET = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/University%20logo`
const OVERRIDES: Record<string, string> = { kmitl: "KMITL" }
function getUniversityLogoUrl(slug: string): string {
  return `${BUCKET}/${OVERRIDES[slug] ?? slug}.png`
}

const OUT_DIR = path.join(__dirname, "..", "public", "logos")
const SIZE = 96
const CONCURRENCY = 10

async function downloadOne(slug: string): Promise<{ slug: string; ok: boolean; err?: string }> {
  try {
    const res = await fetch(getUniversityLogoUrl(slug))
    if (!res.ok) return { slug, ok: false, err: `HTTP ${res.status}` }
    const buf = Buffer.from(await res.arrayBuffer())
    const webp = await sharp(buf)
      .resize(SIZE, SIZE, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer()
    await writeFile(path.join(OUT_DIR, `${slug}.webp`), webp)
    return { slug, ok: true }
  } catch (e) {
    return { slug, ok: false, err: String(e).slice(0, 150) }
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
  await mkdir(OUT_DIR, { recursive: true })

  const unis = await prisma.university.findMany({
    select: { slug: true, shortName: true },
    orderBy: { name: "asc" },
  })
  console.log(`Downloading + converting ${unis.length} logos to ${SIZE}x${SIZE} WebP...\n`)

  const results = await pool(unis.map((u) => u.slug), CONCURRENCY, downloadOne)

  const failed = results.filter((r) => !r.ok)
  console.log(`\n✅ Done   : ${results.length - failed.length}`)
  console.log(`❌ Failed : ${failed.length}\n`)
  if (failed.length > 0) {
    for (const f of failed) console.log(`  ${f.slug.padEnd(40)} | ${f.err}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
