/**
 * University logo URL helper
 * Logos stored in Supabase Storage → public bucket "University logo"
 * Filename = {universitySlug}.png  (matches the English SEO slugs)
 */

const BUCKET_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/University%20logo`

/** Known filename overrides (storage uses different casing than slug) */
const FILENAME_OVERRIDES: Record<string, string> = {
  kmitl: "KMITL",
}

export function getUniversityLogoUrl(slug: string): string {
  const filename = FILENAME_OVERRIDES[slug] ?? slug
  return `${BUCKET_URL}/${filename}.png`
}
