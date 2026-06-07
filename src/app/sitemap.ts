import type { MetadataRoute } from "next"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { SITE_URL } from "@/lib/site"
import { mbtiProfiles } from "@/data/mbti-types"

export const revalidate = 86400  // page-level: regenerate at most once per day

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/",                  priority: 1.0, changeFrequency: "weekly"  },
  { path: "/analyze",           priority: 0.9, changeFrequency: "weekly"  },
  { path: "/scores",            priority: 0.9, changeFrequency: "weekly"  },
  { path: "/mbti",              priority: 0.9, changeFrequency: "monthly" },
  { path: "/tcas/min-scores",   priority: 0.8, changeFrequency: "weekly"  },
  { path: "/tcas/calculator",   priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy",           priority: 0.2, changeFrequency: "yearly"  },
  { path: "/terms",             priority: 0.2, changeFrequency: "yearly"  },
]

// Run both DB queries in parallel and cache the joined result for a day —
// avoids hammering Postgres if a bot crawls sitemap.xml repeatedly.
const getSitemapEntries = unstable_cache(
  async () => {
    const [universities, faculties] = await Promise.all([
      prisma.university.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.faculty.findMany({
        take:    5000,
        orderBy: { updatedAt: "desc" },
        select:  {
          id: true, updatedAt: true,
          university: { select: { slug: true } },
        },
      }),
    ])
    return { universities, faculties }
  },
  ["sitemap-entries"],
  { revalidate: 86400, tags: ["universities", "faculties"] }
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const { universities, faculties } = await getSitemapEntries()

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url:             `${SITE_URL}${r.path}`,
    lastModified:    now,
    changeFrequency: r.changeFrequency,
    priority:        r.priority,
  }))

  const mbtiUrls: MetadataRoute.Sitemap = mbtiProfiles.map((t) => ({
    url:             `${SITE_URL}/mbti/${t.type.toLowerCase()}`,
    lastModified:    now,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }))

  const uniUrls: MetadataRoute.Sitemap = universities.map((u) => ({
    url:             `${SITE_URL}/scores/${u.slug}`,
    lastModified:    u.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.6,
  }))

  const facultyUrls: MetadataRoute.Sitemap = faculties.map((f) => ({
    url:             `${SITE_URL}/scores/${f.university.slug}/${f.id}`,
    lastModified:    f.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.5,
  }))

  return [...staticUrls, ...mbtiUrls, ...uniUrls, ...facultyUrls]
}
