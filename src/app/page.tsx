import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import {
  BarChart2,
  Brain,
  GraduationCap,
  Database,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

const steps = [
  { step: "01", title: "เลือกคณะ", description: "เลือกมหาวิทยาลัยและคณะที่สนใจ" },
  { step: "02", title: "กรอกคะแนน", description: "ใส่คะแนนแต่ละวิชาที่คณะกำหนด" },
  { step: "03", title: "ดูผลวิเคราะห์", description: "รับผลพร้อมโอกาสรับทันที" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
            <GraduationCap className="h-4 w-4" />
            สำหรับนักเรียน TCAS ทุกคน
          </span>
          <h1
            className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            วิเคราะห์คะแนน TCAS
            <br />
            <span className="text-green-700">รู้โอกาส ก่อนสมัคร</span>
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl">
            เปรียบเทียบคะแนนกับข้อมูลย้อนหลัง 6 ปี ทำนายโอกาสรับ
            <br className="hidden sm:block" />
            และรับคำแนะนำคณะที่เหมาะกับคุณ · ฟรี ไม่ต้องสมัครสมาชิก
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/analyze"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-green-600 hover:bg-green-700 text-white sm:w-auto"
              )}
            >
              เริ่มวิเคราะห์คะแนน
              <ArrowRight className="ml-1.5 h-4 w-4" />
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
          <p className="mt-4 text-sm text-gray-500">ใช้เวลาไม่ถึง 2 นาที · ไม่ต้อง login</p>
        </div>
      </section>

      {/* Features — Bento layout */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h2
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              สามเครื่องมือที่ช่วยตัดสินใจ
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              ข้อมูลจาก mytcas · 50+ มหาวิทยาลัย · ย้อนหลัง 5 ปี
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">

            {/* Primary card — วิเคราะห์คะแนน (spans 2 rows, 2 cols on desktop) */}
            <Link
              href="/analyze"
              className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-7 transition-all hover:border-green-200 hover:bg-green-50 hover:shadow-sm lg:col-span-2 lg:row-span-2"
            >
              <div>
                <div className="mb-5 flex items-start justify-between">
                  <BarChart2 className="h-9 w-9 text-green-600" />
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    เครื่องมือหลัก
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-green-800 sm:text-2xl">
                  วิเคราะห์คะแนน TCAS
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                  กรอกคะแนนแต่ละวิชา เลือกคณะที่สนใจ แล้วดูว่าคะแนนของคุณอยู่ตรงไหนเมื่อเทียบกับ
                  คะแนนตัดสิทธิ์ 5 ปีย้อนหลัง ระบบจะบอกโอกาสรับอย่างตรงไปตรงมา
                </p>

                {/* Chance indicators */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    โอกาสสูง
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                    <AlertCircle className="h-3.5 w-3.5" />
                    แข่งขันได้
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                    <XCircle className="h-3.5 w-3.5" />
                    โอกาสน้อย
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-green-700">
                เริ่มวิเคราะห์
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Secondary card 1 — คะแนนย้อนหลัง */}
            <Link
              href="/scores"
              className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-green-200 hover:bg-green-50 hover:shadow-sm"
            >
              <div>
                <Database className="mb-4 h-7 w-7 text-green-600" />
                <h3 className="mb-2 font-bold text-gray-900 group-hover:text-green-800">
                  คะแนนย้อนหลัง
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  ดูคะแนนตัดสิทธิ์ทุกคณะ พร้อมกราฟแนวโน้มรายปี
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-green-700">
                เปิดดู <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Secondary card 2 — MBTI */}
            <Link
              href="/mbti"
              className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-green-200 hover:bg-green-50 hover:shadow-sm"
            >
              <div>
                <Brain className="mb-4 h-7 w-7 text-green-600" />
                <h3 className="mb-2 font-bold text-gray-900 group-hover:text-green-800">
                  แนะนำคณะด้วย MBTI
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  ทำแบบทดสอบ 20 ข้อ รู้บุคลิกภาพ รับคำแนะนำคณะที่เหมาะสม
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-green-700">
                ทำแบบทดสอบ <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2
              className="text-3xl font-bold text-gray-900"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              วิธีใช้งาน
            </h2>
            <p className="mt-3 text-sm text-gray-500">3 ขั้นตอน ใช้เวลาไม่ถึง 2 นาที</p>
          </div>
          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connector line — desktop only */}
            <div
              className="absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] hidden h-px bg-gray-200 sm:block"
              aria-hidden="true"
            />
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-xl font-bold text-white shadow-sm">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-green-600 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2
            className="mb-4 text-3xl font-bold"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            พร้อมวิเคราะห์คะแนนแล้วหรือยัง?
          </h2>
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
            เริ่มวิเคราะห์คะแนน
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 Jknowledge · ข้อมูลทั้งหมดเป็นการประมาณการ ไม่ใช่ผลลัพธ์ที่รับประกัน</p>
      </footer>
    </div>
  );
}
