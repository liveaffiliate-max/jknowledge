import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google"
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import "./globals.css";

// Only the 5 weights actually used in the UI — WOFF2 format (-71% vs TTF)
// Dropped: Light (300), ExtraBold (800), and all italic variants (none used)
const kanit = localFont({
  variable: "--font-kanit",
  display: "swap",
  src: [
    { path: "../../public/font/Kanit-Regular.woff2",  weight: "400", style: "normal" },
    { path: "../../public/font/Kanit-Medium.woff2",   weight: "500", style: "normal" },
    { path: "../../public/font/Kanit-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/font/Kanit-Bold.woff2",     weight: "700", style: "normal" },
    { path: "../../public/font/Kanit-Black.woff2",    weight: "900", style: "normal" },
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
      <html lang="th" className={`${kanit.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background text-foreground pb-[56px] sm:pb-0">
          <Toaster>
            <PageTransition>
              {children}
            </PageTransition>
            <ScrollToTop />
            <BottomNav />
          </Toaster>
        </body>
        <GoogleAnalytics gaId="G-852N4SM4ND" />
        <SpeedInsights />
      </html>
    </ClerkProvider>
  );
}
