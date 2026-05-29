import { clerkMiddleware } from "@clerk/nextjs/server"

/**
 * Clerk middleware — initialises session context on every request.
 * No routes are protected by default; add createRouteMatcher() here
 * when authenticated-only pages are needed.
 */
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
