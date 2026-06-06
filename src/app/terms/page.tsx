import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/layout/header"

export const metadata: Metadata = {
  title: "เงื่อนไขการใช้งาน · Jknowledge",
  description: "เงื่อนไขการใช้งานแพลตฟอร์ม Jknowledge สำหรับนักเรียนเตรียมสอบ TCAS",
}

const LAST_UPDATED = "5 มิถุนายน 2569"
const VERSION      = "1.0"

// Single source of truth for section anchors — used by TOC + Section render.
const SECTIONS = [
  { id: "acceptance",            title: "1. การยอมรับเงื่อนไข" },
  { id: "eligibility",           title: "2. คุณสมบัติผู้ใช้" },
  { id: "service",               title: "3. ลักษณะของบริการ" },
  { id: "data-accuracy",         title: "4. ความถูกต้องของข้อมูล TCAS" },
  { id: "no-guarantee",          title: "5. การไม่รับประกันผลการสอบ" },
  { id: "prohibited",            title: "6. การใช้งานที่ห้าม" },
  { id: "intellectual-property", title: "7. ทรัพย์สินทางปัญญา" },
  { id: "user-content",          title: "8. ข้อมูลที่คุณให้กับเรา" },
  { id: "liability",             title: "9. การจำกัดความรับผิด" },
  { id: "termination",           title: "10. การยกเลิกบัญชี" },
  { id: "changes",               title: "11. การเปลี่ยนแปลงเงื่อนไข" },
  { id: "governing-law",         title: "12. กฎหมายที่ใช้บังคับ" },
  { id: "contact",               title: "13. ติดต่อเรา" },
] as const

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 px-4 py-10 sm:py-16">
        <article className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          {/* Desktop sidebar TOC */}
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
              เงื่อนไขการใช้งาน
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              อัปเดตล่าสุด {LAST_UPDATED} · เวอร์ชัน {VERSION}
            </p>
          </header>

          {/* Key disclaimer */}
          <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
            <h2 className="text-sm font-semibold text-amber-900">
              สิ่งสำคัญที่ต้องทราบ
            </h2>
            <p className="mt-2 text-base leading-relaxed text-amber-900/80">
              ผลการวิเคราะห์ทั้งหมดของ Jknowledge เป็น
              <strong> การประมาณการ </strong>
              จากข้อมูลย้อนหลังเท่านั้น
              <strong> ไม่ใช่การรับประกันการสอบติด </strong>
              คะแนนตัดและที่นั่งของแต่ละปีอาจเปลี่ยนแปลงตามจำนวนผู้สมัครและนโยบายของมหาวิทยาลัย
              คุณควรตัดสินใจสมัครโดยพิจารณาข้อมูลจากหลายแหล่ง
            </p>
          </div>

          {/* Mobile TOC */}
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
          <Section id="acceptance" title="1. การยอมรับเงื่อนไข">
            <p>
              เมื่อคุณเข้าใช้งานหรือสมัครสมาชิก Jknowledge
              ถือว่าคุณได้อ่าน เข้าใจ และยอมรับเงื่อนไขทั้งหมดในเอกสารนี้
              รวมถึง{" "}
              <Link href="/privacy" className="font-medium text-green-700 underline-offset-4 hover:underline">
                นโยบายความเป็นส่วนตัว
              </Link>
            </p>
            <p>
              หากคุณไม่ยอมรับเงื่อนไขข้อใดข้อหนึ่ง โปรดหยุดการใช้งานทันที
            </p>
          </Section>

          <Section id="eligibility" title="2. คุณสมบัติผู้ใช้">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>คุณต้องเป็นบุคคลธรรมดา ใช้บริการเพื่อการศึกษาเป็นหลัก</li>
              <li>ผู้ใช้อายุต่ำกว่า 20 ปี ควรได้รับความยินยอมจากผู้ปกครอง</li>
              <li>คุณต้องให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันในการสมัครสมาชิก</li>
              <li>คุณรับผิดชอบในการรักษาความลับของบัญชีและรหัสผ่าน</li>
            </ul>
          </Section>

          <Section id="service" title="3. ลักษณะของบริการ">
            <p>Jknowledge ให้บริการดังต่อไปนี้:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li><strong>วิเคราะห์คะแนน TCAS:</strong> เปรียบเทียบคะแนนของคุณกับข้อมูลย้อนหลัง</li>
              <li><strong>ค้นหาคะแนนย้อนหลัง:</strong> ดูคะแนนตัดของคณะต่างๆ ในปีที่ผ่านมา</li>
              <li><strong>แบบทดสอบ MBTI:</strong> ค้นหาคณะที่เหมาะกับบุคลิกของคุณ</li>
              <li><strong>บันทึกประวัติ:</strong> เก็บผลการวิเคราะห์ของคุณไว้ดูภายหลัง (เมื่อล็อกอิน)</li>
            </ul>
            <p className="mt-4">
              บริการเหล่านี้ให้บริการในรูปแบบ &ldquo;ตามที่เป็นอยู่&rdquo; (as-is)
              เราไม่รับประกันความถูกต้องสมบูรณ์ของข้อมูล แต่จะพยายามปรับปรุงอย่างต่อเนื่อง
            </p>
          </Section>

          <Section id="data-accuracy" title="4. ความถูกต้องของข้อมูล TCAS">
            <p>
              ข้อมูลคะแนนตัด คะแนนเฉลี่ย และจำนวนที่นั่ง อ้างอิงจาก{" "}
              <a
                href="https://www.mytcas.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-700 underline-offset-4 hover:underline"
              >
                mytcas.com
              </a>
              {" "}และแหล่งข้อมูลสาธารณะอื่นๆ
            </p>
            <p>
              เราพยายามอัปเดตข้อมูลให้เป็นปัจจุบัน แต่ไม่รับประกันว่าจะไม่มีความคลาดเคลื่อน
              คุณควรตรวจสอบกับเว็บไซต์ทางการของมหาวิทยาลัยและ ทปอ. ก่อนตัดสินใจสมัคร
            </p>
          </Section>

          <Section id="no-guarantee" title="5. การไม่รับประกันผลการสอบ">
            <p>
              <strong>
                Jknowledge ไม่รับประกันว่าคุณจะสอบติดคณะใดๆ ก็ตามไม่ว่าผลการวิเคราะห์จะแสดงผลอย่างไร
              </strong>
            </p>
            <p>การสอบติด TCAS ขึ้นกับปัจจัยหลายอย่างที่อยู่นอกเหนือการคำนวณของเรา เช่น:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>จำนวนผู้สมัครในแต่ละปี</li>
              <li>การเปลี่ยนแปลงนโยบายของมหาวิทยาลัย</li>
              <li>การปรับน้ำหนักวิชาในแต่ละรอบ</li>
              <li>โควตาพิเศษและการรับตรง</li>
            </ul>
            <p className="mt-3">
              คุณยอมรับว่าจะไม่ใช้ผลการวิเคราะห์ของเราเป็นปัจจัยเดียวในการตัดสินใจ
            </p>
          </Section>

          <Section id="prohibited" title="6. การใช้งานที่ห้าม">
            <p>คุณตกลงที่จะ <strong>ไม่</strong>:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>ใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมายหรือก่อให้เกิดความเสียหาย</li>
              <li>พยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต (hacking, brute-force)</li>
              <li>ใช้ bot, scraper, หรือ automation เพื่อดึงข้อมูลจำนวนมาก</li>
              <li>คัดลอกหรือเผยแพร่ข้อมูลของเราในเชิงพาณิชย์โดยไม่ได้รับอนุญาต</li>
              <li>แอบอ้างเป็นผู้อื่น หรือใช้ข้อมูลปลอมในการสมัครสมาชิก</li>
              <li>รบกวนการให้บริการ (DDoS, spam)</li>
              <li>ใช้บริการเพื่อล่วงละเมิด คุกคาม หรือทำร้ายผู้อื่น</li>
            </ul>
            <p className="mt-4">
              การกระทำที่ฝ่าฝืนเงื่อนไขข้างต้นอาจส่งผลให้บัญชีของคุณถูกระงับหรือลบโดยไม่แจ้งล่วงหน้า
              และอาจดำเนินคดีตามกฎหมาย
            </p>
          </Section>

          <Section id="intellectual-property" title="7. ทรัพย์สินทางปัญญา">
            <p>
              เนื้อหา ดีไซน์ และซอฟต์แวร์ทั้งหมดของ Jknowledge เป็นทรัพย์สินของเรา
              คุณได้รับสิทธิ์ใช้งานเพื่อวัตถุประสงค์ส่วนตัวเท่านั้น ไม่อนุญาตให้คัดลอก
              แจกจ่าย หรือใช้เพื่อวัตถุประสงค์ทางการค้าโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
            </p>
            <p>
              ข้อมูลคะแนน TCAS เป็นข้อมูลสาธารณะที่อ้างอิงจาก mytcas.com และแหล่งอื่นๆ
              ไม่ใช่ทรัพย์สินทางปัญญาของเรา
            </p>
          </Section>

          <Section id="user-content" title="8. ข้อมูลที่คุณให้กับเรา">
            <p>
              เมื่อคุณกรอกคะแนน คำตอบ MBTI หรือข้อมูลอื่นๆ คุณยังเป็นเจ้าของข้อมูลนั้น
              แต่ให้สิทธิ์เราในการประมวลผลเพื่อให้บริการตามที่ระบุใน{" "}
              <Link href="/privacy" className="font-medium text-green-700 underline-offset-4 hover:underline">
                นโยบายความเป็นส่วนตัว
              </Link>
            </p>
          </Section>

          <Section id="liability" title="9. การจำกัดความรับผิด">
            <p>
              ภายใต้ขอบเขตที่กฎหมายอนุญาต Jknowledge ไม่รับผิดชอบต่อ:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>การสอบไม่ติดของคุณ ไม่ว่าผลการวิเคราะห์จะแสดงผลอย่างไร</li>
              <li>ความเสียหายทางอ้อมจากการใช้บริการของเรา</li>
              <li>การหยุดให้บริการชั่วคราวเพื่อบำรุงรักษา</li>
              <li>ข้อมูลคลาดเคลื่อนจากแหล่งข้อมูลภายนอก (mytcas, มหาวิทยาลัย)</li>
            </ul>
            <p className="mt-4">
              ความรับผิดสูงสุดของเรา (หากมี) จำกัดอยู่ที่ค่าบริการที่คุณจ่ายให้เรา (ปัจจุบันบริการของเราฟรี = 0 บาท)
            </p>
          </Section>

          <Section id="termination" title="10. การยกเลิกบัญชี">
            <p>
              <strong>คุณ:</strong> ลบบัญชีได้ทุกเมื่อผ่านหน้าตั้งค่าบัญชี
              ข้อมูลของคุณจะถูกลบภายใน 30 วัน
            </p>
            <p>
              <strong>เรา:</strong> สงวนสิทธิ์ระงับหรือลบบัญชีที่ฝ่าฝืนเงื่อนไขโดยไม่ต้องแจ้งล่วงหน้า
            </p>
          </Section>

          <Section id="changes" title="11. การเปลี่ยนแปลงเงื่อนไข">
            <p>
              เราอาจปรับปรุงเงื่อนไขนี้เป็นครั้งคราว
              การเปลี่ยนแปลงสำคัญจะแจ้งให้คุณทราบล่วงหน้าอย่างน้อย 30 วัน
              การใช้งานต่อหลังจากการเปลี่ยนแปลงมีผล ถือว่าคุณยอมรับเงื่อนไขใหม่
            </p>
          </Section>

          <Section id="governing-law" title="12. กฎหมายที่ใช้บังคับ">
            <p>
              เงื่อนไขนี้อยู่ภายใต้กฎหมายของประเทศไทย
              ข้อพิพาทใดๆ จะอยู่ในเขตอำนาจของศาลไทย
            </p>
          </Section>

          <Section id="contact" title="13. ติดต่อเรา">
            <p>
              หากมีคำถามเกี่ยวกับเงื่อนไขการใช้งาน:
            </p>
            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
              <p>
                อีเมล:{" "}
                <a
                  href="mailto:hello@jknowledge.app"
                  className="font-medium text-green-700 underline-offset-4 hover:underline"
                >
                  hello@jknowledge.app
                </a>
              </p>
              <p className="mt-1">
                สำหรับเรื่องความเป็นส่วนตัวโดยเฉพาะ:{" "}
                <a
                  href="mailto:privacy@jknowledge.app"
                  className="font-medium text-green-700 underline-offset-4 hover:underline"
                >
                  privacy@jknowledge.app
                </a>
              </p>
            </div>
          </Section>

          {/* Footer cross-links */}
          <div className="mt-12 border-t border-gray-100 pt-8 text-sm text-gray-500">
            <p>เอกสารที่เกี่ยวข้อง</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/privacy" className="text-green-700 underline-offset-4 hover:underline">
                  นโยบายความเป็นส่วนตัว
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
