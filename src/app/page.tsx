import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import { BarChart2, Target, Brain, GraduationCap, type LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string; href: string; badge: string }[] = [
  {
    icon: BarChart2,
    title: "วิเคราะห์คะแนน TCAS",
    description:
      "กรอกคะแนนของคุณแล้วเปรียบเทียบกับข้อมูลคะแนนย้อนหลัง 5 ปี เพื่อดูโอกาสในการเข้าคณะที่ต้องการ",
    href: "/analyze",
    badge: "ฟีเจอร์หลัก",
  },
  {
    icon: Target,
    title: "ทำนายโอกาสรับ",
    description:
      "ระบบวิเคราะห์ความสามารถในการแข่งขันของคุณ พร้อมระบุว่า High Chance, Competitive หรือ Low Chance",
    href: "/analyze",
    badge: "AI-Powered",
  },
  {
    icon: Brain,
    title: "แนะนำคณะด้วย MBTI",
    description:
      "ทำแบบทดสอบ MBTI แล้วรับคำแนะนำคณะที่เหมาะสมกับบุคลิกภาพและเส้นทางอาชีพของคุณ",
    href: "/mbti",
    badge: "ใหม่",
  },
];

const steps = [
  { step: "01", title: "กรอกคะแนน", description: "ใส่คะแนน TCAS ของคุณในแต่ละวิชา" },
  { step: "02", title: "เลือกคณะ", description: "เลือกมหาวิทยาลัยและคณะที่สนใจ" },
  { step: "03", title: "ดูผลวิเคราะห์", description: "รับผลวิเคราะห์พร้อมคำแนะนำทันที" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
            <GraduationCap className="h-4 w-4" />
            สำหรับนักเรียน TCAS ทุกคน
          </span>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            วิเคราะห์คะแนน TCAS
            <br />
            <span className="text-green-600">รู้โอกาส ก่อนสมัคร</span>
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl">
            เปรียบเทียบคะแนนกับข้อมูลย้อนหลัง ทำนายโอกาสรับด้วย AI
            <br className="hidden sm:block" />
            และรับคำแนะนำคณะที่เหมาะกับคุณ — ฟรี ไม่ต้องสมัครสมาชิก
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/analyze"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-green-600 hover:bg-green-700 text-white sm:w-auto"
              )}
            >
              เริ่มวิเคราะห์คะแนน →
            </Link>
            <Link
              href="/mbti"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full border-gray-300 sm:w-auto"
              )}
            >
              ทดสอบ MBTI
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">ใช้เวลาไม่ถึง 2 นาที · ไม่ต้อง login</p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">ทุกอย่างที่ต้องการ ในที่เดียว</h2>
            <p className="mt-3 text-gray-500">ออกแบบมาเพื่อนักเรียน TCAS โดยเฉพาะ</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-green-200 hover:bg-green-50 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <f.icon className="h-7 w-7 text-green-600" />
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500 shadow-sm">
                    {f.badge}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-green-700">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">วิธีใช้งาน</h2>
            <p className="mt-3 text-gray-500">ง่ายมาก ใช้เวลาแค่ไม่กี่นาที</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-xl font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-green-600 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">พร้อมวิเคราะห์คะแนนแล้วหรือยัง?</h2>
          <p className="mb-8 text-green-100">
            เริ่มต้นได้เลย ฟรี ไม่ต้องสมัครสมาชิก
          </p>
          <Link
            href="/analyze"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white text-green-700 hover:bg-green-50 font-semibold"
            )}
          >
            เริ่มวิเคราะห์คะแนน →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-400">
        <p>© 2026 Jknowledge · ข้อมูลทั้งหมดเป็นการประมาณการ ไม่ใช่ผลลัพธ์ที่รับประกัน</p>
      </footer>
    </div>
  );
}
