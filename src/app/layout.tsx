import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const kanit = localFont({
  variable: "--font-kanit",
  display: "swap",
  src: [
    { path: "../../public/font/Kanit-Light.ttf",           weight: "300", style: "normal" },
    { path: "../../public/font/Kanit-LightItalic.ttf",     weight: "300", style: "italic" },
    { path: "../../public/font/Kanit-Regular.ttf",         weight: "400", style: "normal" },
    { path: "../../public/font/Kanit-Italic.ttf",          weight: "400", style: "italic" },
    { path: "../../public/font/Kanit-Medium.ttf",          weight: "500", style: "normal" },
    { path: "../../public/font/Kanit-MediumItalic.ttf",    weight: "500", style: "italic" },
    { path: "../../public/font/Kanit-SemiBold.ttf",        weight: "600", style: "normal" },
    { path: "../../public/font/Kanit-SemiBoldItalic.ttf",  weight: "600", style: "italic" },
    { path: "../../public/font/Kanit-Bold.ttf",            weight: "700", style: "normal" },
    { path: "../../public/font/Kanit-BoldItalic.ttf",      weight: "700", style: "italic" },
    { path: "../../public/font/Kanit-ExtraBold.ttf",       weight: "800", style: "normal" },
    { path: "../../public/font/Kanit-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../../public/font/Kanit-Black.ttf",           weight: "900", style: "normal" },
    { path: "../../public/font/Kanit-BlackItalic.ttf",     weight: "900", style: "italic" },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jknowledge — วิเคราะห์คะแนน TCAS ด้วย AI",
  description:
    "แพลตฟอร์มวิเคราะห์คะแนน TCAS สำหรับนักเรียนไทย ทำนายโอกาสรับ เปรียบเทียบคะแนนย้อนหลัง และรับคำแนะนำคณะตาม MBTI",
  keywords: ["TCAS", "คะแนนย้อนหลัง", "คณะไหนดี", "MBTI คณะ", "TCAS calculator"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <html lang="th" className={`${kanit.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background text-foreground">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
