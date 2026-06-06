import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/layout/header"

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว · Jknowledge",
  description: "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของ Jknowledge ตาม พรบ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)",
}

const LAST_UPDATED = "5 มิถุนายน 2569"
const VERSION      = "1.0"

// Single source of truth for section anchors — used by TOC + Section render.
const SECTIONS = [
  { id: "who-we-are",      title: "1. เราคือใคร" },
  { id: "what-we-collect", title: "2. ข้อมูลที่เราเก็บ" },
  { id: "why-we-collect",  title: "3. เราใช้ข้อมูลของคุณเพื่ออะไร" },
  { id: "lawful-basis",    title: "4. ฐานทางกฎหมายในการประมวลผล" },
  { id: "sharing",         title: "5. การเปิดเผยข้อมูลให้บุคคลที่สาม" },
  { id: "retention",       title: "6. ระยะเวลาในการเก็บข้อมูล" },
  { id: "your-rights",     title: "7. สิทธิ์ของคุณตาม PDPA" },
  { id: "changes",         title: "8. การเปลี่ยนแปลงนโยบาย" },
  { id: "contact",         title: "9. ติดต่อเรา" },
] as const

// Disclosure organized by category. Named vendors only where the user has a
// real choice (OAuth) or controls opt-in (Analytics). Infrastructure is
// disclosed as a category so we can swap vendors without amending policy.
// Full sub-processor list is available on request — see Option C in
// context/features/privacy.md.
const SHARING: Array<{
  title:       string
  description: string
  location:    string
  vendors:     readonly string[] | null
}> = [
  {
    title:       "ระบบหลัก (Infrastructure)",
    description: "Authentication, Hosting, Database, CDN ที่ดูแลให้บริการของเราทำงาน",
    location:    "สหรัฐอเมริกาและ Global Edge",
    vendors:     null,  // category-only — no named vendors
  },
  {
    title:       "Identity Provider (เข้าสู่ระบบ)",
    description: "เฉพาะเมื่อคุณเลือกเข้าสู่ระบบด้วยบริการเหล่านี้",
    location:    "หลายประเทศ ตามผู้ให้บริการ",
    vendors:     ["Google", "LINE", "Apple", "Facebook", "X (Twitter)"],
  },
  {
    title:       "Analytics (วัดผลการใช้งาน)",
    description: "ใช้งานเฉพาะเมื่อคุณยอมรับ cookies วัดผล สามารถปิดได้ตลอดเวลา",
    location:    "สหรัฐอเมริกา / Global Edge",
    vendors:     ["Google Analytics 4", "Vercel SpeedInsights"],
  },
]

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 px-4 py-10 sm:py-16">
        <article className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          {/* Desktop sidebar TOC — sticky */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24" aria-label="หัวข้อในหน้านี้">
              <p className="text-sm font-semibold text-gray-900">หัวข้อในหน้านี้</p>
              <ol className="mt-3 space-y-2 text-sm">
                {SECTIONS.map(({ id, title }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="block py-0.5 text-gray-500 transition-colors hover:text-green-700"
                    >
                      {title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0">
          {/* Title */}
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              นโยบายความเป็นส่วนตัว
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              อัปเดตล่าสุด {LAST_UPDATED} · เวอร์ชัน {VERSION}
            </p>
          </header>

          {/* Summary box */}
          <div className="mb-8 rounded-2xl border border-green-100 bg-green-50/50 p-5">
            <h2 className="text-sm font-semibold text-green-800">สรุปแบบสั้น</h2>
            <ul className="mt-3 space-y-2 text-base leading-relaxed text-gray-700">
              <li>• เราเก็บเฉพาะข้อมูลที่จำเป็น (อีเมล ชื่อ คะแนนที่คุณกรอก)</li>
              <li>• คุณใช้ /analyze /scores /mbti ได้โดยไม่ต้องสมัครสมาชิก</li>
              <li>• ข้อมูลของคุณไม่ถูกขายให้บุคคลที่สาม</li>
              <li>• คุณขอดู ขอลบ หรือขอ export ข้อมูลของตัวเองได้ตลอดเวลา</li>
            </ul>
          </div>

          {/* Mobile TOC — collapsible (native <details>) */}
          <details className="mb-10 rounded-2xl border border-gray-200 bg-gray-50/50 lg:hidden">
            <summary className="cursor-pointer list-none px-5 py-3 text-sm font-semibold text-gray-900">
              ข้ามไปหัวข้อในหน้านี้ ↓
            </summary>
            <ol className="space-y-1.5 px-5 pb-4 text-sm">
              {SECTIONS.map(({ id, title }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="block py-1 text-gray-600 transition-colors hover:text-green-700"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          {/* Sections */}
          <Section id="who-we-are" title="1. เราคือใคร">
            <p>
              Jknowledge เป็นแพลตฟอร์มช่วยนักเรียนวิเคราะห์คะแนน TCAS และหาคณะที่เหมาะสม
              เราเป็นผู้ควบคุมข้อมูลส่วนบุคคล (Data Controller) ตาม พรบ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
            </p>
          </Section>

          <Section id="what-we-collect" title="2. ข้อมูลที่เราเก็บ">
            <h3 className="font-semibold text-gray-900">ข้อมูลที่คุณให้กับเราโดยตรง</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>อีเมล</strong>: สำหรับการเข้าสู่ระบบและส่งการแจ้งเตือนสำคัญ</li>
              <li><strong>ชื่อ-นามสกุล</strong>: สำหรับแสดงในบัญชีของคุณ</li>
              <li><strong>รหัสผ่าน</strong>: เก็บโดย Clerk (เราไม่เห็นรหัสผ่านของคุณ)</li>
              <li><strong>คะแนนสอบ</strong>: เฉพาะเมื่อคุณกรอกในหน้า /analyze และล็อกอินอยู่</li>
              <li><strong>คณะที่เลือกวิเคราะห์</strong>: เก็บเฉพาะเมื่อล็อกอิน</li>
              <li><strong>คำตอบ MBTI + ผลลัพธ์</strong>: เก็บไว้แสดงในประวัติของคุณ</li>
            </ul>

            <h3 className="mt-5 font-semibold text-gray-900">ข้อมูลที่เก็บอัตโนมัติ (เมื่อคุณยินยอม)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Cookies จำเป็น</strong>: สำหรับ session การเข้าสู่ระบบ</li>
              <li><strong>Cookies วัดผล</strong>: Google Analytics + Vercel SpeedInsights (เฉพาะเมื่อคุณกดยอมรับ)</li>
              <li><strong>เหตุการณ์การใช้งาน</strong>: เช่น เลือกมหาวิทยาลัยใด ทำแบบทดสอบเสร็จเมื่อใด (ไม่ส่งคะแนนสอบดิบออกไป)</li>
            </ul>

            <h3 className="mt-5 font-semibold text-gray-900">ข้อมูลที่เราไม่เก็บ</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>เลขบัตรประชาชน เลขหนังสือเดินทาง</li>
              <li>เบอร์โทรศัพท์ ที่อยู่</li>
              <li>วันเกิด</li>
              <li>ตำแหน่งที่ตั้ง (GPS)</li>
              <li>ข้อมูลทางการแพทย์ ลายนิ้วมือ</li>
            </ul>
          </Section>

          <Section id="why-we-collect" title="3. เราใช้ข้อมูลของคุณเพื่ออะไร">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ให้บริการ:</strong> เข้าสู่ระบบ บันทึกประวัติการวิเคราะห์ แสดงผลลัพธ์</li>
              <li><strong>ติดต่อสื่อสาร:</strong> ส่งอีเมลแจ้งเตือนสำคัญ (เช่น รหัสยืนยันบัญชี การเปลี่ยนรหัสผ่าน)</li>
              <li><strong>ปรับปรุงบริการ:</strong> วิเคราะห์การใช้งานเพื่อปรับปรุง UX และคุณภาพการแนะนำคณะ</li>
              <li><strong>ความปลอดภัย:</strong> ป้องกัน abuse, bot, การโจมตี</li>
              <li><strong>ปฏิบัติตามกฎหมาย:</strong> เก็บข้อมูลตามที่กฎหมายกำหนด (เช่น log สำหรับสืบสวน)</li>
            </ul>
            <p className="mt-4">
              เราจะไม่ใช้ข้อมูลของคุณเพื่อวัตถุประสงค์อื่นนอกเหนือจากที่ระบุไว้
              โดยไม่ได้รับความยินยอมจากคุณก่อน
            </p>
          </Section>

          <Section id="lawful-basis" title="4. ฐานทางกฎหมายในการประมวลผล">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>ความยินยอม</strong>: Cookies วัดผล, การติดต่อทางการตลาด (อนาคต)</li>
              <li><strong>สัญญา</strong>: ข้อมูลที่จำเป็นในการให้บริการที่คุณสมัคร</li>
              <li><strong>ประโยชน์อันชอบด้วยกฎหมาย</strong>: ความปลอดภัย ป้องกัน abuse</li>
              <li><strong>การปฏิบัติตามกฎหมาย</strong>: เมื่อจำเป็นต้อง disclose ตามคำสั่งของหน่วยงานรัฐ</li>
            </ul>
          </Section>

          <Section id="sharing" title="5. การเปิดเผยข้อมูลให้บุคคลที่สาม">
            <p>
              เราใช้บริการจากผู้ให้บริการที่เชื่อถือได้เพื่อให้บริการ
              <strong>เราไม่ขายหรือให้ข้อมูลของคุณเพื่อการโฆษณา</strong>
            </p>
            {/* Categorized disclosure — named vendors shown only where user has choice */}
            <ul className="mt-4 space-y-3">
              {SHARING.map((s) => (
                <li key={s.title} className="rounded-xl border border-gray-200 p-4 sm:p-5">
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                    {s.description}
                  </p>
                  {s.vendors && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.vendors.map((v) => (
                        <span
                          key={v}
                          className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    ที่ตั้ง: {s.location}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              ต้องการรายชื่อผู้ให้บริการทั้งหมด (sub-processor list)? ติดต่อ{" "}
              <a
                href="mailto:privacy@jknowledge.app"
                className="font-medium text-green-700 underline-offset-4 hover:underline"
              >
                privacy@jknowledge.app
              </a>
              {" "}เพื่อขอเอกสารเพิ่มเติม
            </p>
          </Section>

          <Section id="retention" title="6. ระยะเวลาในการเก็บข้อมูล">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>ข้อมูลบัญชี:</strong> ตลอดเวลาที่บัญชียังเปิดใช้งาน</li>
              <li><strong>ประวัติการวิเคราะห์:</strong> ตลอดเวลาที่บัญชียังเปิดใช้งาน (อนาคตอาจปรับเป็น 2 ปี)</li>
              <li><strong>Log การเข้าใช้งาน:</strong> 90 วัน (สำหรับ debug + security)</li>
              <li><strong>หลังลบบัญชี:</strong> ลบข้อมูลทั้งหมดภายใน 30 วัน (ยกเว้นข้อมูลที่กฎหมายบังคับให้เก็บ)</li>
            </ul>
          </Section>

          <Section id="your-rights" title="7. สิทธิ์ของคุณตาม PDPA">
            <p>
              ตาม พรบ. คุ้มครองข้อมูลส่วนบุคคล หมวด 30 คุณมีสิทธิ์ต่อไปนี้:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li><strong>สิทธิ์ในการเข้าถึง</strong>: ขอดูข้อมูลของตัวเองที่เราเก็บ</li>
              <li><strong>สิทธิ์ในการแก้ไข</strong>: แก้ไขข้อมูลที่ไม่ถูกต้องผ่านหน้าโปรไฟล์</li>
              <li><strong>สิทธิ์ในการลบ</strong>: ขอลบบัญชีและข้อมูลทั้งหมด</li>
              <li><strong>สิทธิ์ในการ portability</strong>: ขอ export ข้อมูลในรูปแบบที่อ่านได้ (JSON)</li>
              <li><strong>สิทธิ์ในการคัดค้าน</strong>: คัดค้านการประมวลผลข้อมูลเพื่อวัตถุประสงค์บางอย่าง</li>
              <li><strong>สิทธิ์ในการถอนความยินยอม</strong>: ถอน consent ที่ให้ไว้ได้ทุกเมื่อ</li>
              <li><strong>สิทธิ์ในการร้องเรียน</strong>: ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC)</li>
            </ul>
            <p className="mt-4">
              การใช้สิทธิ์: ส่งอีเมลมาที่{" "}
              <a href="mailto:privacy@jknowledge.app" className="font-medium text-green-700 underline-offset-4 hover:underline">
                privacy@jknowledge.app
              </a>
              {" "}เราจะตอบกลับภายใน 30 วัน
            </p>
          </Section>

          <Section id="changes" title="8. การเปลี่ยนแปลงนโยบาย">
            <p>
              เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว เมื่อมีการเปลี่ยนแปลงสำคัญ
              เราจะแจ้งให้คุณทราบผ่านอีเมลหรือประกาศบนเว็บไซต์อย่างน้อย 30 วันก่อนการเปลี่ยนแปลงมีผล
            </p>
            <p className="mt-3">
              ดูประวัติเวอร์ชัน: เวอร์ชันปัจจุบัน {VERSION} (อัปเดตล่าสุด {LAST_UPDATED})
            </p>
          </Section>

          <Section id="contact" title="9. ติดต่อเรา">
            <p>หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวหรือต้องการใช้สิทธิ์ใดๆ:</p>
            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <p className="text-sm">
                <strong>เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</strong>
              </p>
              <p className="mt-1.5 text-sm">
                อีเมล:{" "}
                <a href="mailto:privacy@jknowledge.app" className="font-medium text-green-700 underline-offset-4 hover:underline">
                  privacy@jknowledge.app
                </a>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                เวลาตอบกลับโดยประมาณ: ภายใน 7 วันทำการ (ไม่เกิน 30 วันตามกฎหมาย)
              </p>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              นอกจากนี้ คุณสามารถร้องเรียนต่อ{" "}
              <a
                href="https://www.pdpc.or.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-700 underline-offset-4 hover:underline"
              >
                สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC)
              </a>
            </p>
          </Section>

          {/* Footer cross-links */}
          <div className="mt-12 border-t border-gray-100 pt-8 text-sm text-gray-500">
            <p>เอกสารที่เกี่ยวข้อง</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/terms" className="text-green-700 underline-offset-4 hover:underline">
                  เงื่อนไขการใช้งาน
                </Link>
              </li>
              <li>
                <Link href="/" className="text-green-700 underline-offset-4 hover:underline">
                  กลับหน้าหลัก
                </Link>
              </li>
            </ul>
          </div>
          </div>
        </article>
      </main>
    </div>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id:       string
  title:    string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-4 text-base leading-relaxed text-gray-700">{children}</div>
    </section>
  )
}
