/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tree-shake to per-icon imports for common heavy packages — turns
  // `import { X } from "lucide-react"` into the same bundle as the
  // explicit subpath import. Especially impactful for lucide (46 imports).
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@base-ui/react",
    ],
  },

  images: {
    // Allow Next.js to optimize remote images instead of forcing `unoptimized`
    // on UniversityLogo (which served raw, full-size PNGs every time).
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    // Prefer modern formats — AVIF first, WebP fallback. Cuts logo bytes ~40-60%.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
