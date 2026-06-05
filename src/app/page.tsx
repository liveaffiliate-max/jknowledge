import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import { ArrowRight, GraduationCap } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { CountUp } from "@/components/animations/count-up";

const featuredUniversities = [
  "จุฬาลงกรณ์มหาวิทยาลัย",
  "มหาวิทยาลัยธรรมศาสตร์",
  "มหาวิทยาลัยมหิดล",
  "มหาวิทยาลัยเกษตรศาสตร์",
  "มหาวิทยาลัยเชียงใหม่",
  "มหาวิทยาลัยขอนแก่น",
  "มหาวิทยาลัยสงขลานครินทร์",
  "มหาวิทยาลัยศิลปากร",
  "มหาวิทยาลัยบูรพา",
  "มหาวิทยาลัยนเรศวร",
  "มจธ.",
  "มจพ.",
  "สจล.",
  "มหาวิทยาลัยมหาสารคาม",
  "มหาวิทยาลัยสุรนารี",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* ── Hero (full viewport, no animation — first impression) ── */}
      <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-16 text-center">
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

      {/* ── Data Coverage ── */}
      <section className="bg-gray-50 px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">

          {/* Stats row with count-up */}
          <FadeIn>
            <div className="mb-10 flex items-center justify-center divide-x divide-gray-200">
              <div className="px-6 sm:px-10">
                <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  <CountUp to={50} suffix="+" />
                </p>
                <p className="mt-1 text-sm text-gray-500">มหาวิทยาลัย</p>
              </div>
              <div className="px-6 sm:px-10">
                <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  <CountUp to={500} suffix="+" />
                </p>
                <p className="mt-1 text-sm text-gray-500">คณะ</p>
              </div>
              <div className="px-6 sm:px-10">
                <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  <CountUp to={6} /><span className="text-green-600 text-2xl sm:text-3xl"> ปี</span>
                </p>
                <p className="mt-1 text-sm text-gray-500">ข้อมูลย้อนหลัง</p>
              </div>
            </div>
          </FadeIn>

          {/* University name chips */}
          <FadeIn delay={120}>
            <div className="flex flex-wrap justify-center gap-2">
              {featuredUniversities.map((uni) => (
                <span
                  key={uni}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600"
                >
                  {uni}
                </span>
              ))}
              <span className="rounded-full border border-dashed border-gray-200 bg-transparent px-3 py-1.5 text-xs text-gray-400">
                +40 มหาวิทยาลัยอื่น
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="mt-8 text-xs text-gray-400">อ้างอิงจาก mytcas</p>
          </FadeIn>
        </div>
      </section>

      {/* ── TCAS Journey ── */}
      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <FadeIn>
            <h2
              className="mb-10 text-2xl font-bold text-gray-900 sm:text-3xl"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              จากไม่แน่ใจ
              <br className="sm:hidden" /> ถึงพร้อมสมัคร TCAS
            </h2>
          </FadeIn>

          <div className="space-y-4">
            <FadeIn delay={0}>
              <Link
                href="/analyze"
                className="group flex items-start gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-green-200 hover:bg-green-50 sm:items-center"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200 text-sm font-bold text-gray-600 transition-colors group-hover:bg-green-100 group-hover:text-green-700">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">รู้ว่าคะแนนของตัวเองอยู่ตรงไหน</p>
                  <p className="mt-1 text-sm text-gray-600">
                    กรอกคะแนน เลือกคณะ ดูว่าห่างจากคะแนนตัดเท่าไหร่ และโอกาสรับอยู่ที่ระดับไหน
                  </p>
                </div>
                <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-green-600 sm:block" />
              </Link>
            </FadeIn>

            <FadeIn delay={80}>
              <Link
                href="/scores"
                className="group flex items-start gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-green-200 hover:bg-green-50 sm:items-center"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200 text-sm font-bold text-gray-600 transition-colors group-hover:bg-green-100 group-hover:text-green-700">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">สำรวจแนวโน้มคะแนนย้อนหลัง</p>
                  <p className="mt-1 text-sm text-gray-500">
                    ดูว่าคณะที่สนใจตัดคะแนนเพิ่มหรือลดในช่วง 6 ปีที่ผ่านมา เพื่อประเมินปีนี้
                  </p>
                </div>
                <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-green-600 sm:block" />
              </Link>
            </FadeIn>

            <FadeIn delay={160}>
              <Link
                href="/mbti"
                className="group flex items-start gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-green-200 hover:bg-green-50 sm:items-center"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200 text-sm font-bold text-gray-600 transition-colors group-hover:bg-green-100 group-hover:text-green-700">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">ค้นหาตัวเองว่าคุณเหมาะกับคณะอะไร</p>
                  <p className="mt-1 text-sm text-gray-500">
                    ยังไม่แน่ใจว่าจะเรียนอะไร ลองดูว่าคนที่มีบุคลิกแบบเดียวกับคุณมักเลือกเรียนอะไร
                  </p>
                </div>
                <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-green-600 sm:block" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Footer + CTA */}
      <footer className="border-t border-gray-100 bg-white px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            © 2026 Jknowledge · อ้างอิงจาก mytcas · เป็นการประมาณการ ไม่ใช่ผลรับประกัน
          </p>
          <Link
            href="/analyze"
            className={cn(
              buttonVariants({ size: "sm" }),
              "flex-shrink-0 bg-green-600 text-white hover:bg-green-700"
            )}
          >
            เริ่มวิเคราะห์คะแนน
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
