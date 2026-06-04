/**
 * Convert Kanit TTF → WOFF2
 * Usage: node scripts/convert-fonts.mjs
 *
 * Keeps only the 5 weights actually used in the UI:
 *   Regular (400), Medium (500), SemiBold (600), Bold (700), Black (900)
 *
 * Drops: Light (300), ExtraBold (800), and ALL italic variants
 */

import { compress } from "wawoff2"
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONT_DIR = join(__dirname, "..", "public", "font")

const FONTS = [
  "Kanit-Regular",
  "Kanit-Medium",
  "Kanit-SemiBold",
  "Kanit-Bold",
  "Kanit-Black",
]

console.log("Converting Kanit TTF → WOFF2...\n")

let totalBefore = 0
let totalAfter  = 0

for (const name of FONTS) {
  const ttfPath   = join(FONT_DIR, `${name}.ttf`)
  const woff2Path = join(FONT_DIR, `${name}.woff2`)

  const ttfBuffer   = readFileSync(ttfPath)
  const woff2Buffer = await compress(ttfBuffer)

  writeFileSync(woff2Path, Buffer.from(woff2Buffer))

  const before = ttfBuffer.length
  const after  = woff2Buffer.byteLength
  totalBefore += before
  totalAfter  += after

  const saving = Math.round((1 - after / before) * 100)
  console.log(
    `  ✓ ${name.padEnd(18)} ${String(Math.round(before / 1024)).padStart(4)}KB → ${String(Math.round(after / 1024)).padStart(3)}KB  (-${saving}%)`
  )
}

console.log(`\n  Total: ${Math.round(totalBefore / 1024)}KB → ${Math.round(totalAfter / 1024)}KB  (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`)
console.log("\n✅ Done — update layout.tsx to use .woff2 paths")
