/**
 * scripts/seed-mbti.ts
 * Seeds MBTIQuestion, MBTIProfile, and FacultyMBTIMatch tables
 * from the same data currently hardcoded in src/data/
 *
 * Run: npx tsx scripts/seed-mbti.ts
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

// ── Questions ─────────────────────────────────────────────────────────────────
// Standard questions: optionA → A-pole (E/S/T/J), optionB → B-pole (I/N/F/P)
// Reverse questions : optionA → B-pole (I/N/F/P), optionB → A-pole — isReverse=true flips scoring

const questions = [
  // ── EI Standard ──────────────────────────────────────────────────────────────
  { order: 1,  dimension: "EI", weight: 1.2, isReverse: false, category: "social",
    text: "เวลาที่อยู่กับกลุ่มเพื่อน คุณรู้สึกอย่างไร?",
    optionA: "มีพลัง อยากพูดคุยและเชื่อมต่อกับทุกคน",
    optionB: "สนุก แต่ต้องการเวลาคนเดียวเพื่อชาร์จพลังทีหลัง" },
  { order: 2,  dimension: "EI", weight: 1.2, isReverse: false, category: "emotion",
    text: "เมื่อมีปัญหาหนักใจ คุณมักจะ…",
    optionA: "ระบายกับเพื่อนหรือคนที่ไว้ใจเพื่อให้รู้สึกดีขึ้น",
    optionB: "ใช้เวลาอยู่คนเดียวคิดทบทวนก่อนที่จะบอกใคร" },
  { order: 3,  dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "ในงานกลุ่ม คุณมักเป็นคนที่…",
    optionA: "ริเริ่มพูดก่อน แสดงความคิดเห็นเปิดเผย",
    optionB: "รอฟังคนอื่นก่อน แล้วค่อยพูดเมื่อพร้อม" },
  { order: 4,  dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "วันหยุดในฝันของคุณคือ…",
    optionA: "ออกไปข้างนอก เจอผู้คน ทำกิจกรรมสนุก ๆ",
    optionB: "อยู่บ้าน อ่านหนังสือ ดูซีรีส์ หรือทำงานอดิเรกคนเดียว" },
  { order: 5,  dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "คุณรู้จักตัวเองดีที่สุดเมื่อ…",
    optionA: "ได้พูดคุยและแลกเปลี่ยนความคิดกับผู้อื่น",
    optionB: "ได้นั่งเงียบ ๆ สำรวจความคิดของตัวเอง" },
  // ── SN Standard ──────────────────────────────────────────────────────────────
  { order: 6,  dimension: "SN", weight: 1.2, isReverse: false, category: "perception",
    text: "เมื่อเรียนรู้สิ่งใหม่ คุณชอบเริ่มจาก…",
    optionA: "ตัวอย่างจริง ขั้นตอนที่จับต้องได้ ทำแล้วเข้าใจ",
    optionB: "แนวคิดใหญ่ ทฤษฎี และภาพรวมก่อน" },
  { order: 7,  dimension: "SN", weight: 1.0, isReverse: false, category: "perception",
    text: "คุณมักสังเกตสิ่งรอบตัวในแบบ…",
    optionA: "รายละเอียดชัดเจน สิ่งที่มองเห็นและสัมผัสได้จริง",
    optionB: "ความหมายที่ซ่อนอยู่ ความเชื่อมโยง และรูปแบบ" },
  { order: 8,  dimension: "SN", weight: 1.0, isReverse: false, category: "planning",
    text: "เวลาวางแผนอนาคต คุณมักคิดถึง…",
    optionA: "สิ่งที่เป็นไปได้จริง ๆ ในระยะสั้นและปัจจุบัน",
    optionB: "ความเป็นไปได้ในระยะยาว ภาพอนาคตในฝัน" },
  { order: 9,  dimension: "SN", weight: 1.2, isReverse: false, category: "decision",
    text: "คุณเชื่อถือข้อมูลแบบไหนมากกว่า?",
    optionA: "ข้อเท็จจริงที่พิสูจน์ได้ ประสบการณ์จริง",
    optionB: "สัญชาตญาณ ความรู้สึกที่ว่า 'มันน่าจะใช่'" },
  { order: 10, dimension: "SN", weight: 1.0, isReverse: false, category: "emotion",
    text: "เมื่ออ่านหนังสือหรือดูหนัง คุณสนใจ…",
    optionA: "เนื้อเรื่องที่สมจริง ตัวละครที่น่าเชื่อถือ",
    optionB: "แนวคิดแฝง สัญลักษณ์ และความหมายลึก ๆ" },
  // ── TF Standard ──────────────────────────────────────────────────────────────
  { order: 11, dimension: "TF", weight: 1.2, isReverse: false, category: "social",
    text: "เมื่อเพื่อนขอคำแนะนำ คุณมักให้…",
    optionA: "คำแนะนำตรง ๆ ที่สมเหตุสมผลและแก้ปัญหาได้จริง",
    optionB: "รับฟังและเข้าใจความรู้สึกก่อน แล้วค่อยช่วย" },
  { order: 12, dimension: "TF", weight: 1.2, isReverse: false, category: "decision",
    text: "ในการตัดสินใจ คุณให้ความสำคัญกับ…",
    optionA: "ตรรกะ ข้อมูล และผลลัพธ์ที่ดีที่สุด",
    optionB: "ความรู้สึกของทุกคนที่เกี่ยวข้อง" },
  { order: 13, dimension: "TF", weight: 1.0, isReverse: false, category: "social",
    text: "เมื่อต้องวิจารณ์งานของคนอื่น คุณ…",
    optionA: "พูดตรง ๆ เพราะคิดว่านั่นคือการช่วยเหลือจริง",
    optionB: "พยายามพูดอ่อนโยน คำนึงถึงความรู้สึกเขาก่อน" },
  { order: 14, dimension: "TF", weight: 1.0, isReverse: false, category: "emotion",
    text: "คุณรู้สึกภูมิใจเมื่อ…",
    optionA: "แก้ปัญหาได้อย่างมีประสิทธิภาพ บรรลุเป้าหมาย",
    optionB: "ทำให้คนรอบข้างรู้สึกดีและได้รับการสนับสนุน" },
  { order: 15, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    text: "เมื่อเห็นความขัดแย้ง คุณมักจะ…",
    optionA: "หาว่าใครถูกใครผิดตามเหตุผล",
    optionB: "พยายามหาทางประนีประนอมให้ทุกฝ่ายพอใจ" },
  // ── JP Standard ──────────────────────────────────────────────────────────────
  { order: 16, dimension: "JP", weight: 1.2, isReverse: false, category: "planning",
    text: "เวลาทำโปรเจกต์ คุณ…",
    optionA: "วางแผนล่วงหน้า แบ่งงานเป็นขั้นตอน ทำตามตาราง",
    optionB: "ยืดหยุ่นตามสถานการณ์ ปรับแผนได้เสมอ" },
  { order: 17, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "กระเป๋าหรือโต๊ะทำงานของคุณ…",
    optionA: "จัดระเบียบ มีที่ทางชัดเจน หาของได้ทันที",
    optionB: "อาจดูรก แต่รู้ว่าของอยู่ไหน ไม่อยากจัดตาม 'ระบบ'" },
  { order: 18, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "เมื่อเดินทาง คุณ…",
    optionA: "จองที่พัก วางตารางทุกวัน เตรียมพร้อมหมด",
    optionB: "คร่าว ๆ ก็พอ แล้วค่อยตัดสินใจตามความรู้สึกวันนั้น" },
  { order: 19, dimension: "JP", weight: 1.2, isReverse: false, category: "stress",
    text: "เมื่อมีงานส่ง คุณมักทำ…",
    optionA: "เสร็จก่อนเส้นตาย ไม่ชอบทำกระทันหัน",
    optionB: "ส่วนใหญ่ทำใกล้ deadline รู้สึกว่าความกดดันช่วยได้" },
  { order: 20, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "คุณชอบชีวิตที่…",
    optionA: "มีโครงสร้าง คาดเดาได้ รู้ว่าจะเกิดอะไรขึ้น",
    optionB: "ยืดหยุ่น มีความตื่นเต้น เปิดรับโอกาสใหม่ ๆ" },
  // ── EI Reverse ───────────────────────────────────────────────────────────────
  // optionA → I-pole, optionB → E-pole
  { order: 21, dimension: "EI", weight: 1.0, isReverse: true, category: "stress",
    text: "หลังวันที่เต็มไปด้วยการพบปะผู้คน คุณรู้สึกอย่างไร?",
    optionA: "หมดแรง ต้องการเวลาส่วนตัวเพื่อฟื้นฟัน",
    optionB: "ยังมีพลังเหลือ อยากพบเจอคนอื่นต่อก็ได้" },
  { order: 22, dimension: "EI", weight: 1.0, isReverse: true, category: "social",
    text: "คนรอบข้างมักมองคุณว่าเป็นคนแบบไหน?",
    optionA: "สงบ ใจเย็น ชอบสังเกต พูดน้อยแต่ลึก",
    optionB: "ร่าเริง พูดเก่ง สนุกสนาน เป็นขวัญใจกลุ่ม" },
  // ── SN Reverse ───────────────────────────────────────────────────────────────
  // optionA → N-pole, optionB → S-pole
  { order: 23, dimension: "SN", weight: 1.0, isReverse: true, category: "perception",
    text: "เวลาฟังคนอื่นเล่าเรื่อง คุณมักจับ…",
    optionA: "น้ำเสียงและความหมายแฝง สิ่งที่เขา 'ไม่ได้พูด'",
    optionB: "ข้อมูลและรายละเอียดที่พูดออกมาชัดเจน" },
  { order: 24, dimension: "SN", weight: 1.0, isReverse: true, category: "emotion",
    text: "สิ่งที่ทำให้คุณตื่นเต้นที่สุดคือ…",
    optionA: "ความเป็นไปได้ใหม่ ๆ และสิ่งที่ยังไม่เคยเกิดขึ้น",
    optionB: "ผลลัพธ์จริงที่สัมผัสได้และทำได้สำเร็จ" },
  // ── TF Reverse ───────────────────────────────────────────────────────────────
  // optionA → F-pole, optionB → T-pole
  { order: 25, dimension: "TF", weight: 1.0, isReverse: true, category: "decision",
    text: "เมื่อตัดสินใจเรื่องสำคัญ คุณให้น้ำหนักอะไรก่อน?",
    optionA: "ความรู้สึกของตัวเองและผู้ที่ได้รับผลกระทบ",
    optionB: "ข้อมูล ความเป็นเหตุเป็นผล และผลลัพธ์เชิงปฏิบัติ" },
  { order: 26, dimension: "TF", weight: 1.0, isReverse: true, category: "social",
    text: "เมื่อเห็นเพื่อนกำลังเสียใจ คุณมักทำสิ่งใดก่อน?",
    optionA: "นั่งฟังและรับฟังอย่างตั้งใจ ไม่รีบหาคำตอบ",
    optionB: "ถามสาเหตุและช่วยคิดวิธีแก้ปัญหาทันที" },
  // ── JP Reverse ───────────────────────────────────────────────────────────────
  // optionA → P-pole, optionB → J-pole
  { order: 27, dimension: "JP", weight: 1.0, isReverse: true, category: "planning",
    text: "คุณทำงานได้ดีที่สุดเมื่อ…",
    optionA: "มีอิสระปรับแผนตลอด ไม่ถูกจำกัดโดยขั้นตอนตายตัว",
    optionB: "มีโครงสร้างชัดเจนและรู้ว่าขั้นตอนต่อไปคืออะไร" },
  { order: 28, dimension: "JP", weight: 1.0, isReverse: true, category: "stress",
    text: "เมื่อมีเวลาว่างกะทันหัน 2 ชั่วโมง คุณมักจะ…",
    optionA: "ทำสิ่งที่อยากทำตอนนั้น ไม่มีแผนล่วงหน้า",
    optionB: "ใช้เวลาตาม to-do list หรือเพิ่มงานที่ค้างอยู่" },
] as const

// ── Profiles ──────────────────────────────────────────────────────────────────

const profiles = [
  {
    type: "INTJ", nickname: "สถาปนิก",   emoji: "🏛️", color: "text-purple-700",
    tagline: "มีวิสัยทัศน์ไกล วางแผนได้แม่นยำ",
    description: "INTJ คือผู้วางกลยุทธ์ที่มีเป้าหมายชัดเจน ชอบคิดเชิงระบบและมองภาพใหญ่ มักเป็นคนที่ตั้งมาตรฐานสูงทั้งกับตัวเองและคนรอบข้าง ทำงานได้ดีโดยไม่ต้องการการดูแล",
    strengths: ["วิเคราะห์เชิงลึก", "วางแผนระยะยาว", "แก้ปัญหาซับซ้อน", "มุ่งมั่นสูง"],
    careers: ["วิศวกร", "นักวิทยาศาสตร์", "นักวิจัย", "สถาปนิก", "ผู้บริหารระดับสูง"],
    faculties: [
      { field: "วิศวกรรมศาสตร์", score: 0.92, reason: "ตรงกับความชอบคิดเชิงระบบและแก้ปัญหา",     rank: 1 },
      { field: "วิทยาศาสตร์",    score: 0.85, reason: "ให้โอกาสสำรวจและตั้งคำถามเชิงลึก",       rank: 2 },
      { field: "สถาปัตยกรรมศาสตร์", score: 0.80, reason: "ผสานการคิดเชิงระบบกับความคิดสร้างสรรค์", rank: 3 },
      { field: "เศรษฐศาสตร์",    score: 0.75, reason: "เหมาะกับการวิเคราะห์และการวางแผนเชิงกลยุทธ์", rank: 4 },
    ],
  },
  {
    type: "INTP", nickname: "นักตรรกะ",   emoji: "🔭", color: "text-blue-700",
    tagline: "รักการค้นหาความจริงและทฤษฎีใหม่",
    description: "INTP เป็นนักคิดที่หลงใหลในแนวคิดและทฤษฎี ชอบวิเคราะห์ระบบและค้นหาความจริงที่ซ่อนอยู่ มักมีความคิดสร้างสรรค์สูงและคิดนอกกรอบ",
    strengths: ["คิดวิเคราะห์", "สร้างสรรค์ทฤษฎีใหม่", "ยืดหยุ่นทางความคิด", "ใฝ่รู้"],
    careers: ["นักวิจัย", "โปรแกรมเมอร์", "นักปรัชญา", "นักวิทยาศาสตร์", "นักคณิตศาสตร์"],
    faculties: [
      { field: "วิทยาการคอมพิวเตอร์", score: 0.90, reason: "ให้อิสระในการสร้างและทดลองระบบใหม่", rank: 1 },
      { field: "คณิตศาสตร์",          score: 0.85, reason: "ตรงกับความชอบตรรกะและความแม่นยำ",   rank: 2 },
      { field: "ฟิสิกส์",             score: 0.82, reason: "ได้ค้นหาคำตอบเชิงพื้นฐานของจักรวาล", rank: 3 },
      { field: "ปรัชญา",              score: 0.75, reason: "ตอบสนองความต้องการตั้งคำถามเชิงลึก", rank: 4 },
    ],
  },
  {
    type: "ENTJ", nickname: "ผู้บัญชาการ", emoji: "👑", color: "text-red-700",
    tagline: "เกิดมาเพื่อนำ วางแผน และขับเคลื่อน",
    description: "ENTJ มีความเป็นผู้นำโดยธรรมชาติ มองเห็นปัญหาและโอกาสได้รวดเร็ว ชอบตัดสินใจอย่างมั่นคงและผลักดันให้ทุกอย่างสำเร็จตามเป้าหมาย",
    strengths: ["ภาวะผู้นำ", "ตัดสินใจเด็ดขาด", "มองการณ์ไกล", "สื่อสารชัดเจน"],
    careers: ["ผู้บริหาร", "ทนายความ", "นักธุรกิจ", "วิศวกรอาวุโส", "ที่ปรึกษา"],
    faculties: [
      { field: "บริหารธุรกิจ",  score: 0.92, reason: "พัฒนาทักษะการบริหารและการตัดสินใจ", rank: 1 },
      { field: "นิติศาสตร์",   score: 0.85, reason: "ตรงกับความชอบโต้แย้งด้วยเหตุผลและหลักการ", rank: 2 },
      { field: "เศรษฐศาสตร์", score: 0.80, reason: "วิเคราะห์ระบบเศรษฐกิจและวางกลยุทธ์", rank: 3 },
      { field: "วิศวกรรมศาสตร์", score: 0.75, reason: "สร้างและบริหารโครงการขนาดใหญ่", rank: 4 },
    ],
  },
  {
    type: "ENTP", nickname: "นักโต้วาที", emoji: "💡", color: "text-orange-600",
    tagline: "ชอบท้าทายความคิดและหาทางเลือกใหม่",
    description: "ENTP ชื่นชอบการถกเถียงด้วยแนวคิดใหม่ ๆ มีความสามารถในการมองหลายมุมมองพร้อมกัน เป็นคนสร้างสรรค์ที่ชอบแก้ปัญหาในแบบที่ไม่ซ้ำใคร",
    strengths: ["คิดสร้างสรรค์", "โต้แย้งด้วยเหตุผล", "ปรับตัวเร็ว", "มองหลายมุม"],
    careers: ["ผู้ประกอบการ", "ทนายความ", "นักการตลาด", "นักออกแบบ", "นักวิจัย"],
    faculties: [
      { field: "นิติศาสตร์",   score: 0.88, reason: "ได้ใช้ทักษะโต้แย้งและคิดเชิงวิพากษ์", rank: 1 },
      { field: "บริหารธุรกิจ", score: 0.82, reason: "เหมาะกับความชอบสร้างสิ่งใหม่และเป็นผู้นำ", rank: 2 },
      { field: "การสื่อสาร",  score: 0.78, reason: "แสดงออกและโน้มน้าวใจผู้อื่น", rank: 3 },
      { field: "วิทยาศาสตร์", score: 0.72, reason: "ทดลองและค้นพบสิ่งใหม่อย่างไม่หยุด", rank: 4 },
    ],
  },
  {
    type: "INFJ", nickname: "ผู้สนับสนุน", emoji: "🌿", color: "text-teal-700",
    tagline: "เข้าใจผู้อื่นลึกซึ้ง มุ่งสร้างการเปลี่ยนแปลง",
    description: "INFJ เป็นบุคลิกที่หายากที่สุด มีสัญชาตญาณเชิงลึกเกี่ยวกับผู้คนและสถานการณ์ ชอบช่วยเหลือผู้อื่นอย่างมีความหมาย และมักมีความฝันที่ยิ่งใหญ่เพื่อสังคม",
    strengths: ["เข้าอกเข้าใจ", "สัญชาตญาณเฉียบแหลม", "มุ่งมั่นต่อเป้าหมาย", "คิดเชิงสร้างสรรค์"],
    careers: ["นักจิตวิทยา", "นักสังคมสงเคราะห์", "ครู", "นักเขียน", "ที่ปรึกษา"],
    faculties: [
      { field: "จิตวิทยา",       score: 0.92, reason: "ตอบสนองความต้องการเข้าใจมนุษย์อย่างลึกซึ้ง", rank: 1 },
      { field: "สังคมสงเคราะห์", score: 0.85, reason: "สร้างการเปลี่ยนแปลงเชิงบวกให้สังคม", rank: 2 },
      { field: "ศึกษาศาสตร์",   score: 0.80, reason: "ถ่ายทอดแรงบันดาลใจสู่ผู้เรียน", rank: 3 },
      { field: "อักษรศาสตร์",   score: 0.75, reason: "สื่อสารความคิดผ่านภาษาและวรรณกรรม", rank: 4 },
    ],
  },
  {
    type: "INFP", nickname: "นักไกล่เกลี่ย", emoji: "🎨", color: "text-pink-600",
    tagline: "มีอุดมการณ์ รักสันติภาพ และสร้างสรรค์",
    description: "INFP ขับเคลื่อนด้วยคุณค่าและอุดมการณ์ส่วนตัว มีความคิดสร้างสรรค์และจินตนาการสูง ชอบแสดงออกผ่านงานศิลปะและการเขียน",
    strengths: ["ความคิดสร้างสรรค์", "เห็นอกเห็นใจ", "ยึดมั่นในคุณค่า", "มีจินตนาการ"],
    careers: ["นักเขียน", "ศิลปิน", "นักจิตวิทยา", "นักออกแบบ", "นักสังคมสงเคราะห์"],
    faculties: [
      { field: "อักษรศาสตร์", score: 0.90, reason: "พัฒนาความสามารถด้านภาษาและการเขียนสร้างสรรค์", rank: 1 },
      { field: "ศิลปกรรม",   score: 0.85, reason: "แสดงออกทางความคิดผ่านศิลปะทุกรูปแบบ", rank: 2 },
      { field: "จิตวิทยา",   score: 0.80, reason: "ทำความเข้าใจตนเองและผู้อื่นอย่างลึกซึ้ง", rank: 3 },
      { field: "การออกแบบ", score: 0.75, reason: "สร้างงานที่มีความหมายและสวยงาม", rank: 4 },
    ],
  },
  {
    type: "ENFJ", nickname: "ผู้ให้กำลังใจ", emoji: "🌟", color: "text-emerald-700",
    tagline: "เป็นแรงบันดาลใจให้ผู้อื่น สร้างทีมที่แข็งแกร่ง",
    description: "ENFJ เป็นผู้นำที่มีเสน่ห์ ชอบสร้างแรงบันดาลใจและพัฒนาศักยภาพของผู้อื่น มักเป็นคนที่ทุกคนไว้วางใจและขอคำปรึกษา",
    strengths: ["สร้างแรงบันดาลใจ", "สื่อสารเก่ง", "เห็นอกเห็นใจ", "เป็นผู้นำทีม"],
    careers: ["ครู/อาจารย์", "นักจิตวิทยา", "ผู้บริหาร HR", "นักสังคมสงเคราะห์", "นักการเมือง"],
    faculties: [
      { field: "ศึกษาศาสตร์",   score: 0.92, reason: "ได้สร้างแรงบันดาลใจและพัฒนาคนอื่น", rank: 1 },
      { field: "รัฐศาสตร์",     score: 0.84, reason: "ใช้ทักษะนำและโน้มน้าวในการสร้างการเปลี่ยนแปลง", rank: 2 },
      { field: "สังคมสงเคราะห์", score: 0.80, reason: "ดูแลและพัฒนาคุณภาพชีวิตชุมชน", rank: 3 },
      { field: "การสื่อสาร",    score: 0.75, reason: "ส่งสารและสร้างการเชื่อมต่อระหว่างผู้คน", rank: 4 },
    ],
  },
  {
    type: "ENFP", nickname: "นักรณรงค์", emoji: "🎉", color: "text-yellow-600",
    tagline: "มีพลังงานสูง ชอบสำรวจความเป็นไปได้ใหม่ ๆ",
    description: "ENFP เต็มไปด้วยพลังงานและความกระตือรือร้น มองโลกเป็นสถานที่เต็มไปด้วยโอกาส ชอบเชื่อมต่อกับผู้คนและสร้างสรรค์สิ่งใหม่",
    strengths: ["กระตือรือร้น", "สร้างสรรค์", "โน้มน้าวใจเก่ง", "มองโลกในแง่ดี"],
    careers: ["นักการตลาด", "ครู", "นักแสดง", "นักจิตวิทยา", "ผู้ประกอบการ"],
    faculties: [
      { field: "การตลาด",    score: 0.88, reason: "ได้ใช้ความคิดสร้างสรรค์และการสื่อสาร", rank: 1 },
      { field: "จิตวิทยา",  score: 0.82, reason: "เข้าใจและช่วยเหลือผู้คนในแบบที่สร้างสรรค์", rank: 2 },
      { field: "นิเทศศาสตร์", score: 0.78, reason: "สื่อสารและสร้างคอนเทนต์ที่โดนใจ", rank: 3 },
      { field: "ศึกษาศาสตร์", score: 0.72, reason: "ถ่ายทอดความกระตือรือร้นให้ผู้เรียน", rank: 4 },
    ],
  },
  {
    type: "ISTJ", nickname: "นักตรวจสอบ", emoji: "📋", color: "text-slate-700",
    tagline: "รับผิดชอบ เชื่อถือได้ ทำงานอย่างมีระบบ",
    description: "ISTJ คือเสาหลักที่เชื่อถือได้ ทำงานด้วยความรับผิดชอบและวินัยสูง ชอบกฎเกณฑ์ที่ชัดเจนและทำสิ่งต่าง ๆ ให้ถูกต้อง",
    strengths: ["รับผิดชอบสูง", "ละเอียดรอบคอบ", "เชื่อถือได้", "มีระเบียบ"],
    careers: ["นักบัญชี", "ผู้ตรวจสอบ", "วิศวกร", "ทหาร/ตำรวจ", "นักกฎหมาย"],
    faculties: [
      { field: "การบัญชี",       score: 0.92, reason: "ตรงกับความละเอียดและความรับผิดชอบสูง", rank: 1 },
      { field: "นิติศาสตร์",     score: 0.84, reason: "ทำงานกับกฎเกณฑ์และความถูกต้อง", rank: 2 },
      { field: "วิศวกรรมศาสตร์", score: 0.80, reason: "สร้างระบบที่มีประสิทธิภาพและน่าเชื่อถือ", rank: 3 },
      { field: "รัฐประศาสนศาสตร์", score: 0.75, reason: "บริหารจัดการองค์กรอย่างเป็นระบบ", rank: 4 },
    ],
  },
  {
    type: "ISFJ", nickname: "ผู้พิทักษ์", emoji: "🛡️", color: "text-cyan-700",
    tagline: "ดูแลเอาใจใส่ผู้อื่น อุทิศตนอย่างสม่ำเสมอ",
    description: "ISFJ เป็นคนที่ใส่ใจและดูแลคนรอบข้างอย่างเงียบ ๆ มีความจำดีเยี่ยมสำหรับรายละเอียดส่วนตัว และทำงานหนักเพื่อรักษาความสัมพันธ์",
    strengths: ["เอาใจใส่", "ละเอียดอ่อน", "ความจำดี", "ทุ่มเทสูง"],
    careers: ["พยาบาล", "ครู", "นักสังคมสงเคราะห์", "เลขานุการ", "นักบัญชี"],
    faculties: [
      { field: "พยาบาลศาสตร์", score: 0.93, reason: "ดูแลผู้อื่นด้วยความเอาใจใส่อย่างแท้จริง", rank: 1 },
      { field: "ศึกษาศาสตร์",  score: 0.85, reason: "สร้างสภาพแวดล้อมที่ปลอดภัยสำหรับผู้เรียน", rank: 2 },
      { field: "สาธารณสุข",    score: 0.80, reason: "ดูแลสุขภาพชุมชนอย่างใส่ใจ", rank: 3 },
      { field: "การบัญชี",     score: 0.72, reason: "ทำงานที่ต้องการความละเอียดและความน่าเชื่อถือ", rank: 4 },
    ],
  },
  {
    type: "ESTJ", nickname: "ผู้บริหาร", emoji: "🏢", color: "text-blue-800",
    tagline: "จัดการได้ทุกอย่าง ทำให้ทุกอย่างเป็นระบบ",
    description: "ESTJ เป็นผู้บริหารโดยธรรมชาติ ชอบจัดการและควบคุมสถานการณ์ให้เป็นระเบียบ มีความเป็นผู้นำที่ชัดเจนและตรงไปตรงมา",
    strengths: ["บริหารจัดการ", "ตัดสินใจเด็ดขาด", "ชัดเจนตรงไปตรงมา", "รับผิดชอบสูง"],
    careers: ["ผู้จัดการ", "ผู้บริหาร", "นักบัญชี", "ผู้พิพากษา", "นายทหาร"],
    faculties: [
      { field: "บริหารธุรกิจ",         score: 0.92, reason: "พัฒนาทักษะการบริหารและการจัดการ", rank: 1 },
      { field: "การบัญชี",             score: 0.85, reason: "ทำงานกับระบบและความถูกต้องแม่นยำ", rank: 2 },
      { field: "นิติศาสตร์",           score: 0.80, reason: "บังคับใช้กฎและหลักการอย่างยุติธรรม", rank: 3 },
      { field: "วิศวกรรมอุตสาหการ",   score: 0.75, reason: "บริหารการผลิตและระบบงานขนาดใหญ่", rank: 4 },
    ],
  },
  {
    type: "ESFJ", nickname: "ผู้ดูแล", emoji: "🤝", color: "text-rose-600",
    tagline: "ชอบช่วยเหลือและสร้างความสุขให้ทุกคน",
    description: "ESFJ เป็นคนอบอุ่นและเป็นมิตร ชอบดูแลผู้อื่นและสร้างบรรยากาศที่ดี มักเป็นคนที่ทำให้ทุกคนในกลุ่มรู้สึกถูกรวมไว้ด้วย",
    strengths: ["มนุษยสัมพันธ์ดี", "ใจกว้าง", "เป็นระบบ", "ทำงานร่วมกันได้ดี"],
    careers: ["ครู", "พยาบาล", "ฝ่ายบุคคล", "นักสังคมสงเคราะห์", "นักประชาสัมพันธ์"],
    faculties: [
      { field: "ศึกษาศาสตร์",         score: 0.90, reason: "ดูแลและพัฒนาผู้เรียนด้วยความใส่ใจ", rank: 1 },
      { field: "พยาบาลศาสตร์",        score: 0.85, reason: "ช่วยเหลือผู้ป่วยด้วยความอบอุ่น", rank: 2 },
      { field: "การสื่อสาร",          score: 0.78, reason: "สร้างความสัมพันธ์และการเชื่อมต่อที่ดี", rank: 3 },
      { field: "โรงแรมและการท่องเที่ยว", score: 0.72, reason: "ให้บริการที่ประทับใจแก่ผู้อื่น", rank: 4 },
    ],
  },
  {
    type: "ISTP", nickname: "นักปฏิบัติ", emoji: "🔧", color: "text-gray-700",
    tagline: "แก้ปัญหาด้วยมือ เข้าใจระบบอย่างรวดเร็ว",
    description: "ISTP เป็นนักแก้ปัญหาในทางปฏิบัติ เข้าใจวิธีการทำงานของสิ่งต่าง ๆ และสามารถแก้ไขได้อย่างรวดเร็ว ชอบลงมือทำมากกว่าพูด",
    strengths: ["ลงมือทำ", "แก้ปัญหาเร็ว", "ใจเย็นในวิกฤต", "ทักษะด้านเทคนิค"],
    careers: ["วิศวกรเครื่องกล", "ช่างเทคนิค", "นักนิติวิทยาศาสตร์", "นักบิน", "โปรแกรมเมอร์"],
    faculties: [
      { field: "วิศวกรรมเครื่องกล",  score: 0.90, reason: "ได้ทำงานกับระบบจริงและแก้ปัญหาเชิงเทคนิค", rank: 1 },
      { field: "วิทยาการคอมพิวเตอร์", score: 0.84, reason: "สร้างและแก้ไขระบบซอฟต์แวร์", rank: 2 },
      { field: "วิทยาศาสตร์การกีฬา", score: 0.76, reason: "วิเคราะห์ร่างกายและปรับปรุงสมรรถนะ", rank: 3 },
      { field: "วิศวกรรมอุตสาหการ",  score: 0.72, reason: "ปรับปรุงกระบวนการผลิตให้มีประสิทธิภาพ", rank: 4 },
    ],
  },
  {
    type: "ISFP", nickname: "นักผจญภัย", emoji: "🎭", color: "text-violet-600",
    tagline: "รักอิสรภาพ แสดงออกผ่านศิลปะ",
    description: "ISFP เป็นคนอบอุ่นและมีความรู้สึกลึกซึ้ง แสดงออกผ่านการกระทำมากกว่าคำพูด ชอบอิสรภาพและประสบการณ์ใหม่ ๆ",
    strengths: ["ศิลปะ", "ยืดหยุ่น", "เอาใจใส่", "มีความงามในสายตา"],
    careers: ["ศิลปิน", "นักออกแบบ", "ช่างภาพ", "พยาบาล", "นักดนตรี"],
    faculties: [
      { field: "ศิลปกรรม",  score: 0.92, reason: "แสดงออกอย่างอิสระผ่านงานสร้างสรรค์", rank: 1 },
      { field: "การออกแบบ", score: 0.86, reason: "สร้างงานที่สวยงามและมีความหมาย", rank: 2 },
      { field: "พยาบาลศาสตร์", score: 0.78, reason: "ดูแลผู้อื่นด้วยความเอาใจใส่ที่แท้จริง", rank: 3 },
      { field: "โภชนาการ",  score: 0.70, reason: "เชื่อมระหว่างศาสตร์และการดูแลสุขภาพ", rank: 4 },
    ],
  },
  {
    type: "ESTP", nickname: "ผู้ประกอบการ", emoji: "⚡", color: "text-amber-600",
    tagline: "ชอบความตื่นเต้น แก้ปัญหาได้ทันทีทันใด",
    description: "ESTP เป็นคนกระตือรือร้น ชอบความตื่นเต้นและความท้าทาย สามารถคิดและตัดสินใจได้รวดเร็วในสถานการณ์กดดัน",
    strengths: ["ตัดสินใจรวดเร็ว", "แก้ปัญหาทันที", "กล้าเสี่ยง", "มนุษยสัมพันธ์ดี"],
    careers: ["ผู้ประกอบการ", "นักขาย", "ตำรวจ/ทหาร", "นักกีฬา", "นักการเมือง"],
    faculties: [
      { field: "บริหารธุรกิจ",        score: 0.88, reason: "เหมาะกับการสร้างธุรกิจและการขาย", rank: 1 },
      { field: "นิติศาสตร์",          score: 0.80, reason: "ใช้ทักษะการโต้แย้งและการตัดสินใจเร็ว", rank: 2 },
      { field: "วิทยาศาสตร์การกีฬา", score: 0.78, reason: "ชอบการลงมือทำและความท้าทายทางกาย", rank: 3 },
      { field: "วิศวกรรมโยธา",       score: 0.72, reason: "ทำงานในภาคสนามที่ต้องการการตัดสินใจเร็ว", rank: 4 },
    ],
  },
  {
    type: "ESFP", nickname: "นักแสดง", emoji: "🎤", color: "text-fuchsia-600",
    tagline: "มีชีวิตชีวา สร้างความสนุกสนานให้ทุกคน",
    description: "ESFP ชอบอยู่กับผู้คนและสร้างบรรยากาศที่สนุกสนาน มีพลังงานสูงและมักเป็นจุดสนใจในกลุ่ม ชอบประสบการณ์ใหม่และการแสดงออก",
    strengths: ["มนุษยสัมพันธ์ดีเยี่ยม", "พลังงานสูง", "ปรับตัวเร็ว", "สร้างบรรยากาศดี"],
    careers: ["นักแสดง", "นักร้อง", "ครู", "พนักงานต้อนรับ", "นักการตลาด"],
    faculties: [
      { field: "นิเทศศาสตร์",           score: 0.90, reason: "แสดงออกและสร้างคอนเทนต์ที่ดึงดูดใจ", rank: 1 },
      { field: "ศิลปกรรม",              score: 0.84, reason: "แสดงออกผ่านการแสดงและงานสร้างสรรค์", rank: 2 },
      { field: "โรงแรมและการท่องเที่ยว", score: 0.80, reason: "สร้างประสบการณ์ที่น่าประทับใจให้ผู้อื่น", rank: 3 },
      { field: "ศึกษาศาสตร์",           score: 0.74, reason: "ทำให้การเรียนรู้สนุกและมีชีวิตชีวา", rank: 4 },
    ],
  },
] as const

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding MBTI data…")

  // 1. Questions
  console.log("  → MBTIQuestion (28 rows)…")
  await prisma.mBTIQuestion.deleteMany()
  await prisma.mBTIQuestion.createMany({
    data: questions.map((q) => ({
      order:     q.order,
      dimension: q.dimension as "EI" | "SN" | "TF" | "JP",
      text:      q.text,
      optionA:   q.optionA,
      optionB:   q.optionB,
      weight:    q.weight,
      isReverse: q.isReverse,
      category:  q.category,
      version:   1,
      active:    true,
    })),
  })
  console.log("  ✓ Questions done")

  // 2. Profiles + faculty matches
  console.log("  → MBTIProfile + FacultyMBTIMatch (16 types)…")
  for (const p of profiles) {
    await prisma.mBTIProfile.upsert({
      where:  { type: p.type },
      update: {
        nickname:    p.nickname,
        emoji:       p.emoji,
        tagline:     p.tagline,
        description: p.description,
        strengths:   p.strengths,
        careers:     p.careers,
        color:       p.color,
      },
      create: {
        type:        p.type,
        nickname:    p.nickname,
        emoji:       p.emoji,
        tagline:     p.tagline,
        description: p.description,
        strengths:   p.strengths,
        careers:     p.careers,
        color:       p.color,
      },
    })

    // Delete old matches and re-insert
    await prisma.facultyMBTIMatch.deleteMany({ where: { mbtiType: p.type } })
    await prisma.facultyMBTIMatch.createMany({
      data: p.faculties.map((f) => ({
        mbtiType: p.type,
        field:    f.field,
        score:    f.score,
        reason:   f.reason,
        rank:     f.rank,
      })),
    })
  }
  console.log("  ✓ Profiles + matches done")

  const qCount = await prisma.mBTIQuestion.count()
  const pCount = await prisma.mBTIProfile.count()
  const mCount = await prisma.facultyMBTIMatch.count()
  console.log(`\n✅ Seeded: ${qCount} questions · ${pCount} profiles · ${mCount} faculty matches`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
