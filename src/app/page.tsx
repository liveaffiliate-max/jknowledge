import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import { ArrowRight, FileText, GraduationCap, PlayCircle, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { CountUp } from "@/components/animations/count-up";
import { TCAS_FOLIO_EPISODES } from "@/features/tcas-folio/data/content";
import { getYoutubeVideoId } from "@/features/tcas-folio/utils/youtube";

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
      <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
            <GraduationCap className="h-4 w-4" />
            สำหรับนักเรียน TCAS ทุกคน
          </span>
          <h1
            className="mb-6 font-bold leading-tight tracking-tight text-gray-900"
            style={{
              fontSize: "clamp(1.875rem, 6.5vw, 3.75rem)",
              textWrap: "balance",
            } as React.CSSProperties}
          >
            รู้โอกาสก่อนสมัคร
            <span className="block text-green-700">ด้วยคะแนนย้อนหลัง 6 ปี</span>
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl" style={{ textWrap: "balance" } as React.CSSProperties}>
            กรอกคะแนน เห็นทันทีว่าติดที่ไหนได้บ้าง · ฟรี ไม่ต้อง login
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/analyze"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-green-600 hover:bg-green-700 text-white sm:w-auto"
              )}
            >
              เช็กโอกาสติดของฉัน
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

          {/* Secondary entry: TCAS Folio teaser — quieter alternative path */}
          <div
            className="mx-auto mt-10 flex max-w-xs items-center gap-3 text-xs text-gray-500"
            aria-hidden
          >
            <span className="h-px flex-1 bg-gray-200" />
            <span>หรือ</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <Link
            href="/tcas-folio"
            className="group mx-auto mt-4 inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm transition-colors hover:border-green-300 hover:bg-green-50/40"
          >
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              ใหม่
            </span>
            <span className="font-medium text-gray-700 group-hover:text-gray-900">
              คู่มือทำพอร์ตโฟลิโอ TCAS
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-600 group-hover:text-green-700">วิดีโอ + PDF</span>
            <ArrowRight className="h-3.5 w-3.5 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-green-600" />
          </Link>
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
            <Link
              href="/scores"
              className="group block rounded-2xl px-2 py-3 transition-colors hover:bg-white"
              aria-label="ดูคะแนนย้อนหลังทั้งหมด"
            >
              <div className="flex flex-wrap justify-center gap-2">
                {featuredUniversities.map((uni) => (
                  <span
                    key={uni}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors group-hover:border-green-200 group-hover:text-green-800"
                  >
                    {uni}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-transparent px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors group-hover:border-green-400 group-hover:text-green-700">
                  +40 มหาวิทยาลัยอื่น
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="mt-8 text-xs text-gray-500">อ้างอิงข้อมูลจากเว็บไซต์ mytcas</p>
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
              จากไม่แน่ใจ ถึงพร้อมสมัคร TCAS
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
                  <p className="font-semibold text-gray-900 transition-colors group-hover:text-green-900">รู้ว่าคะแนนของตัวเองอยู่ตรงไหน</p>
                  <p className="mt-1 text-sm text-gray-600 transition-colors group-hover:text-green-800">
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
                  <p className="font-semibold text-gray-900 transition-colors group-hover:text-green-900">สำรวจแนวโน้มคะแนนย้อนหลัง</p>
                  <p className="mt-1 text-sm text-gray-500 transition-colors group-hover:text-green-800">
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
                  <p className="font-semibold text-gray-900 transition-colors group-hover:text-green-900">ค้นหาตัวเองว่าคุณเหมาะกับคณะอะไร</p>
                  <p className="mt-1 text-sm text-gray-500 transition-colors group-hover:text-green-800">
                    ยังไม่แน่ใจว่าจะเรียนอะไร ลองดูว่าคนที่มีบุคลิกแบบเดียวกับคุณมักเลือกเรียนอะไร
                  </p>
                </div>
                <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-green-600 sm:block" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Featured: TCAS Folio ── */}
      <TcasFolioFeature />

      {/* Footer + CTA */}
      <footer className="border-t border-gray-100 bg-white px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <nav aria-label="Footer links" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <Link href="/tcas/calculator"   className="hover:text-green-700">TCAS Calculator</Link>
            <Link href="/tcas/min-scores"   className="hover:text-green-700">คะแนนต่ำสุด TCAS</Link>
            <Link href="/scores"            className="hover:text-green-700">คะแนนย้อนหลัง</Link>
            <Link href="/analyze/compare"   className="hover:text-green-700">เปรียบเทียบคณะ</Link>
            <Link href="/mbti"              className="hover:text-green-700">MBTI คณะ</Link>
            <Link href="/privacy"           className="hover:text-green-700">ความเป็นส่วนตัว</Link>
            <Link href="/terms"             className="hover:text-green-700">เงื่อนไข</Link>
          </nav>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              © 2026 Jknowledge · อ้างอิงจาก mytcas · เป็นการประมาณการ ไม่ใช่ผลรับประกัน
            </p>
            <Link
              href="/analyze"
              className={cn(
                buttonVariants({ size: "sm" }),
                "flex-shrink-0 bg-green-600 text-white hover:bg-green-700"
              )}
            >
              เช็กโอกาสติดของฉัน
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TcasFolioFeature() {
  const ep1 = TCAS_FOLIO_EPISODES[0];
  const videoId = getYoutubeVideoId(ep1.youtubeUrl);
  // hqdefault (480x360) is guaranteed by YouTube for every video; maxresdefault
  // can 404 for older videos so we pick the safe one.
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  // Concrete content from each episode — beats generic bullet benefits because
  // it shows what they're actually getting in EP1/2/3.
  const chapters = [
    { ep: "EP 1", title: "TCASFolio + รอบ Portfolio คืออะไร" },
    { ep: "EP 2", title: "พอร์ต 10 หน้า ที่ตรงคณะ" },
    { ep: "EP 3", title: "ระบบ + 10 คำถามสัมภาษณ์" },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <Link
            href="/tcas-folio"
            className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition-colors hover:border-green-200"
          >
            <div className="flex flex-col lg:flex-row">
              {/* ── Thumbnail ── */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-900 lg:aspect-auto lg:w-[48%] lg:flex-shrink-0">
                <img
                  src={thumbnail}
                  alt={ep1.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

                {/* Play button — single solid affordance */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-green-700 shadow-lg transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none">
                    <PlayCircle className="h-9 w-9" strokeWidth={1.5} />
                  </span>
                </div>

                {/* Top-left badge */}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  3 ตอน · เริ่มเรียนฟรี
                </span>
              </div>

              {/* ── Copy ── */}
              <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                  เนื้อหาพิเศษ
                </span>

                <h2
                  className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl"
                  style={{ textWrap: "balance" } as React.CSSProperties}
                >
                  คู่มือทำพอร์ตโฟลิโอ TCAS
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  วิดีโอ 3 ตอน + PDF คู่มือ ครบทุกขั้นตอนตั้งแต่วางโครงพอร์ต ใช้ระบบ TCASFolio
                  จนถึงเตรียมสัมภาษณ์รอบ Portfolio
                </p>

                {/* Episode chips */}
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {chapters.map((ch) => (
                    <div
                      key={ch.ep}
                      className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-green-700 ring-1 ring-green-100">
                        {ch.ep.replace("EP ", "")}
                      </span>
                      <span className="text-xs font-medium leading-snug text-gray-700">
                        {ch.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sm:w-fit">
                  <FileText className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                  แถมฟรี PDF คู่มือดาวน์โหลดได้
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-green-700 transition-colors group-hover:text-green-800">
                  เปิดดูคู่มือ TCAS Folio
                  <span className="relative inline-flex">
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
