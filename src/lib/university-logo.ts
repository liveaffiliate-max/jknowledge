/**
 * University logo URL helper
 * Logos are pre-optimized 96x96 WebP files in public/logos/, generated from
 * Supabase Storage by scripts/download-logos.ts. Serving them as static
 * assets (with `unoptimized` on <Image>) avoids Vercel's Image Optimization
 * quota, since the original Supabase PNGs were optimized on every request.
 */

export function getUniversityLogoUrl(slug: string): string {
  return `/logos/${slug}.webp`
}
