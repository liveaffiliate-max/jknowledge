import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { AnalyticsLoader } from "@/components/analytics-loader";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

// LINE Seed Sans TH — ships Regular/Bold/ExtraBold/Black only.
// UI weights 500/600 resolve to the closest available face via browser font matching.
const lineSeed = localFont({
  variable: "--font-line-seed",
  display: "swap",
  src: [
    { path: "../../public/font/LINESeedSansTH-Regular.woff2",   weight: "400", style: "normal" },
    { path: "../../public/font/LINESeedSansTH-Bold.woff2",      weight: "700", style: "normal" },
    { path: "../../public/font/LINESeedSansTH-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../../public/font/LINESeedSansTH-Black.woff2",     weight: "900", style: "normal" },
  ],
});


export const metadata: Metadata = {
  title: "Jknowledge — วิเคราะห์คะแนน TCAS และค้นหาคณะตาม MBTI",
  description:
    "แพลตฟอร์มวิเคราะห์คะแนน TCAS สำหรับนักเรียนไทย ทำนายโอกาสรับ เปรียบเทียบคะแนนย้อนหลัง และคำแนะนำคณะตาม MBTI",
  keywords: ["TCAS", "คะแนนย้อนหลัง", "คณะไหนดี", "MBTI คณะ", "TCAS calculator"],
  icons: { icon: "/jknowledge_logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <html lang="th" className={`${lineSeed.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background text-foreground pb-[56px] sm:pb-0">
          <Toaster>
            <PageTransition>
              {children}
            </PageTransition>
            <ScrollToTop />
            <BottomNav />
            <CookieConsent />
          </Toaster>
        </body>
        <AnalyticsLoader
          gaId={process.env.NEXT_PUBLIC_GA_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
        />
      </html>
    </ClerkProvider>
  );
}
