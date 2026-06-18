/**
 * Pre-render every page of the TCASfolio PDF to WebP using Playwright + Chromium.
 *
 * Why Playwright instead of pdf-to-img:
 *   pdf-to-img uses @napi-rs/canvas, which doesn't fully support PDF effects
 *   (gradient text fills, blend modes, glows). The cover and many headings in
 *   our PDF rely on those effects, so text disappeared. Running pdfjs-dist
 *   inside real Chromium gives us the same Canvas implementation users see in
 *   the browser, which handles every effect.
 *
 * Usage:
 *   npm run render:tcas-folio                              # fetch from Vercel Blob
 *   SRC=./path/to/Ebook.pdf npm run render:tcas-folio      # use local file
 *
 * Outputs:
 *   public/tcas-folio/pages/{n}.webp
 *   src/features/tcas-folio/data/pages-manifest.json
 */

import { writeFile, mkdir, rm, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { createServer } from "node:http"
import { chromium } from "playwright"
import sharp from "sharp"
import { TCAS_FOLIO_PDF } from "../src/features/tcas-folio/data/content"

const PDFJS_VERSION = "4.8.69" // pin so renders are reproducible
const RENDER_SCALE = 2 // ~144dpi at A4
const WEBP_QUALITY = 78
const TARGET_WIDTH = 1400

const OUT_DIR = join(process.cwd(), "public", "tcas-folio", "pages")
const MANIFEST_PATH = join(
  process.cwd(),
  "src",
  "features",
  "tcas-folio",
  "data",
  "pages-manifest.json",
)

async function getPdfBuffer(): Promise<Buffer> {
  const localPath = process.env.SRC
  if (localPath) {
    if (!existsSync(localPath)) throw new Error(`SRC not found: ${localPath}`)
    console.log(`→ Reading local PDF: ${localPath}`)
    return readFile(localPath)
  }
  console.log(`→ Fetching PDF from ${TCAS_FOLIO_PDF.fileUrl}`)
  const res = await fetch(TCAS_FOLIO_PDF.fileUrl)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>body{margin:0;background:#fff}canvas{display:block}</style></head>
<body><canvas id="c"></canvas>
<script type="module">
  import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs";
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs";

  window.__loadPdf = async (url) => {
    const doc = await pdfjsLib.getDocument({
      url,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/standard_fonts/",
      useSystemFonts: true,
    }).promise;
    window.__doc = doc;
    return doc.numPages;
  };

  window.__renderPage = async (pageNum, scale) => {
    const page = await window.__doc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.getElementById("c");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const dataUrl = canvas.toDataURL("image/png");

    // PDF coords: origin bottom-left, y goes up. We convert link rects to
    // top-left percentages relative to the page so the gallery doesn't need
    // to know the rasterized image size.
    const baseViewport = page.getViewport({ scale: 1 });
    const W = baseViewport.width, H = baseViewport.height;
    const seen = new Set();
    const annotations = await page.getAnnotations();
    const links = annotations
      .filter(a => a.subtype === "Link" && (a.url || a.unsafeUrl))
      .map(a => {
        const [x1, y1, x2, y2] = a.rect;
        return {
          url: a.url || a.unsafeUrl,
          left: x1 / W,
          top: (H - y2) / H,
          width: (x2 - x1) / W,
          height: (y2 - y1) / H,
        };
      })
      .filter(l => {
        const k = l.url + "|" + l.left.toFixed(4) + "|" + l.top.toFixed(4);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    return { dataUrl, width: viewport.width, height: viewport.height, links };
  };

  window.__ready = true;
</script>
</body></html>`

async function main() {
  const pdfBuffer = await getPdfBuffer()
  console.log(`✓ PDF loaded (${(pdfBuffer.length / 1024 / 1024).toFixed(1)} MB)`)

  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true })
  await mkdir(OUT_DIR, { recursive: true })

  console.log("→ Launching Chromium…")
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on("pageerror", (err) => console.error("[pageerror]", err.message))
  page.on("console", (msg) => console.log(`[browser ${msg.type()}]`, msg.text()))
  page.on("crash", () => console.error("[page crashed]"))
  page.on("requestfailed", (req) => console.error("[reqfail]", req.url(), req.failure()?.errorText))

  // Spin up a tiny local HTTP server so Chromium can fetch HTML + PDF normally,
  // without paying for Playwright's per-route body serialization (which OOMs at
  // ~100MB and crashes the page).
  const server = createServer((req, res) => {
    if (req.url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      res.end(HTML)
      return
    }
    if (req.url === "/Ebook.pdf") {
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Accept-Ranges": "bytes",
      })
      res.end(pdfBuffer)
      return
    }
    res.writeHead(404)
    res.end()
  })
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()))
  const address = server.address()
  if (!address || typeof address === "string") throw new Error("server bind failed")
  const ORIGIN = `http://127.0.0.1:${address.port}`
  const PDF_URL = `${ORIGIN}/Ebook.pdf`

  await page.goto(`${ORIGIN}/index.html`, { waitUntil: "domcontentloaded" })
  await page.waitForFunction(() => (window as unknown as { __ready?: boolean }).__ready === true, {
    timeout: 30000,
  })

  console.log("→ Loading PDF into pdf.js (in Chromium)…")
  const numPages = await page.evaluate(
    async (url) => (window as unknown as { __loadPdf: (u: string) => Promise<number> }).__loadPdf(url),
    PDF_URL,
  )
  console.log(`✓ pdf.js parsed: ${numPages} pages`)

  let firstWidth = 0
  let firstHeight = 0
  let totalBytes = 0
  type Link = { url: string; left: number; top: number; width: number; height: number }
  const pageLinks: Record<string, Link[]> = {}

  for (let p = 1; p <= numPages; p++) {
    const { dataUrl, width, height, links } = await page.evaluate(
      async ({ pageNum, scale }) =>
        (
          window as unknown as {
            __renderPage: (
              n: number,
              s: number,
            ) => Promise<{ dataUrl: string; width: number; height: number; links: Link[] }>
          }
        ).__renderPage(pageNum, scale),
      { pageNum: p, scale: RENDER_SCALE },
    )
    if (links.length > 0) pageLinks[String(p)] = links

    const pngBuffer = Buffer.from(dataUrl.split(",")[1], "base64")
    const pipeline = sharp(pngBuffer).resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    const meta = await pipeline.metadata()
    const out = await pipeline.webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer()
    await writeFile(join(OUT_DIR, `${p}.webp`), out)
    if (p === 1) {
      firstWidth = meta.width ?? width
      firstHeight = meta.height ?? height
    }
    totalBytes += out.length
    process.stdout.write(`  · page ${p}/${numPages} (${(out.length / 1024).toFixed(0)} KB)\r`)
  }
  process.stdout.write("\n")

  await browser.close()
  server.close()

  const manifest = {
    numPages,
    width: firstWidth,
    height: firstHeight,
    basePath: "/tcas-folio/pages",
    pageLinks,
    generatedAt: new Date().toISOString(),
  }
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf-8")

  console.log(`✓ Wrote ${numPages} pages, total ${(totalBytes / 1024 / 1024).toFixed(1)} MB`)
  console.log(`✓ Manifest → ${MANIFEST_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
