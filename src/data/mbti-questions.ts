import type { MBTIQuestion } from "@/types/mbti"

/**
 * MBTI question pool — 28 questions (20 standard + 8 reverse).
 *
 * Standard questions: optionA → A-pole (E/S/T/J), optionB → B-pole (I/N/F/P)
 * Reverse questions : optionA → B-pole (I/N/F/P), optionB → A-pole (E/S/T/J)
 *                     isReverse=true flips the scoring direction automatically.
 *
 * Reverse questions serve two purposes:
 *  1. Reduce pattern answering (always picking A or always picking B)
 *  2. Improve reliability — a consistent type should still score the same pole
 *     even when the wording is flipped.
 *
 * weight: discrimination strength (0.5–2.0). Initial values are editorial estimates;
 * should be tuned with IRT once sufficient response data is collected.
 *
 * category: topic bucket for future analytics and CAT item selection.
 */
export const mbtiQuestions: MBTIQuestion[] = [

  // ── E / I ── Standard ─────────────────────────────────────────────────────
  {
    id: 1,  dimension: "EI", weight: 1.2, isReverse: false, category: "social",
    text: "เวลาที่อยู่กับกลุ่มเพื่อน คุณรู้สึกอย่างไร?",
    optionA: "มีพลัง อยากพูดคุยและเชื่อมต่อกับทุกคน",
    optionB: "สนุก แต่ต้องการเวลาคนเดียวเพื่อชาร์จพลังทีหลัง",
  },
  {
    id: 2,  dimension: "EI", weight: 1.2, isReverse: false, category: "emotion",
    text: "เมื่อมีปัญหาหนักใจ คุณมักจะ…",
    optionA: "ระบายกับเพื่อนหรือคนที่ไว้ใจเพื่อให้รู้สึกดีขึ้น",
    optionB: "ใช้เวลาอยู่คนเดียวคิดทบทวนก่อนที่จะบอกใคร",
  },
  {
    id: 3,  dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "ในงานกลุ่ม คุณมักเป็นคนที่…",
    optionA: "ริเริ่มพูดก่อน แสดงความคิดเห็นเปิดเผย",
    optionB: "รอฟังคนอื่นก่อน แล้วค่อยพูดเมื่อพร้อม",
  },
  {
    id: 4,  dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "วันหยุดในฝันของคุณคือ…",
    optionA: "ออกไปข้างนอก เจอผู้คน ทำกิจกรรมสนุก ๆ",
    optionB: "อยู่บ้าน อ่านหนังสือ ดูซีรีส์ หรือทำงานอดิเรกคนเดียว",
  },
  {
    id: 5,  dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "คุณรู้จักตัวเองดีที่สุดเมื่อ…",
    optionA: "ได้พูดคุยและแลกเปลี่ยนความคิดกับผู้อื่น",
    optionB: "ได้นั่งเงียบ ๆ สำรวจความคิดของตัวเอง",
  },

  // ── S / N ── Standard ─────────────────────────────────────────────────────
  {
    id: 6,  dimension: "SN", weight: 1.2, isReverse: false, category: "perception",
    text: "เมื่อเรียนรู้สิ่งใหม่ คุณชอบเริ่มจาก…",
    optionA: "ตัวอย่างจริง ขั้นตอนที่จับต้องได้ ทำแล้วเข้าใจ",
    optionB: "แนวคิดใหญ่ ทฤษฎี และภาพรวมก่อน",
  },
  {
    id: 7,  dimension: "SN", weight: 1.0, isReverse: false, category: "perception",
    text: "คุณมักสังเกตสิ่งรอบตัวในแบบ…",
    optionA: "รายละเอียดชัดเจน สิ่งที่มองเห็นและสัมผัสได้จริง",
    optionB: "ความหมายที่ซ่อนอยู่ ความเชื่อมโยง และรูปแบบ",
  },
  {
    id: 8,  dimension: "SN", weight: 1.0, isReverse: false, category: "planning",
    text: "เวลาวางแผนอนาคต คุณมักคิดถึง…",
    optionA: "สิ่งที่เป็นไปได้จริง ๆ ในระยะสั้นและปัจจุบัน",
    optionB: "ความเป็นไปได้ในระยะยาว ภาพอนาคตในฝัน",
  },
  {
    id: 9,  dimension: "SN", weight: 1.2, isReverse: false, category: "decision",
    text: "คุณเชื่อถือข้อมูลแบบไหนมากกว่า?",
    optionA: "ข้อเท็จจริงที่พิสูจน์ได้ ประสบการณ์จริง",
    optionB: "สัญชาตญาณ ความรู้สึกที่ว่า 'มันน่าจะใช่'",
  },
  {
    id: 10, dimension: "SN", weight: 1.0, isReverse: false, category: "emotion",
    text: "เมื่ออ่านหนังสือหรือดูหนัง คุณสนใจ…",
    optionA: "เนื้อเรื่องที่สมจริง ตัวละครที่น่าเชื่อถือ",
    optionB: "แนวคิดแฝง สัญลักษณ์ และความหมายลึก ๆ",
  },

  // ── T / F ── Standard ─────────────────────────────────────────────────────
  {
    id: 11, dimension: "TF", weight: 1.2, isReverse: false, category: "social",
    text: "เมื่อเพื่อนขอคำแนะนำ คุณมักให้…",
    optionA: "คำแนะนำตรง ๆ ที่สมเหตุสมผลและแก้ปัญหาได้จริง",
    optionB: "รับฟังและเข้าใจความรู้สึกก่อน แล้วค่อยช่วย",
  },
  {
    id: 12, dimension: "TF", weight: 1.2, isReverse: false, category: "decision",
    text: "ในการตัดสินใจ คุณให้ความสำคัญกับ…",
    optionA: "ตรรกะ ข้อมูล และผลลัพธ์ที่ดีที่สุด",
    optionB: "ความรู้สึกของทุกคนที่เกี่ยวข้อง",
  },
  {
    id: 13, dimension: "TF", weight: 1.0, isReverse: false, category: "social",
    text: "เมื่อต้องวิจารณ์งานของคนอื่น คุณ…",
    optionA: "พูดตรง ๆ เพราะคิดว่านั่นคือการช่วยเหลือจริง",
    optionB: "พยายามพูดอ่อนโยน คำนึงถึงความรู้สึกเขาก่อน",
  },
  {
    id: 14, dimension: "TF", weight: 1.0, isReverse: false, category: "emotion",
    text: "คุณรู้สึกภูมิใจเมื่อ…",
    optionA: "แก้ปัญหาได้อย่างมีประสิทธิภาพ บรรลุเป้าหมาย",
    optionB: "ทำให้คนรอบข้างรู้สึกดีและได้รับการสนับสนุน",
  },
  {
    id: 15, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    text: "เมื่อเห็นความขัดแย้ง คุณมักจะ…",
    optionA: "หาว่าใครถูกใครผิดตามเหตุผล",
    optionB: "พยายามหาทางประนีประนอมให้ทุกฝ่ายพอใจ",
  },

  // ── J / P ── Standard ─────────────────────────────────────────────────────
  {
    id: 16, dimension: "JP", weight: 1.2, isReverse: false, category: "planning",
    text: "เวลาทำโปรเจกต์ คุณ…",
    optionA: "วางแผนล่วงหน้า แบ่งงานเป็นขั้นตอน ทำตามตาราง",
    optionB: "ยืดหยุ่นตามสถานการณ์ ปรับแผนได้เสมอ",
  },
  {
    id: 17, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "กระเป๋าหรือโต๊ะทำงานของคุณ…",
    optionA: "จัดระเบียบ มีที่ทางชัดเจน หาของได้ทันที",
    optionB: "อาจดูรก แต่รู้ว่าของอยู่ไหน ไม่อยากจัดตาม 'ระบบ'",
  },
  {
    id: 18, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "เมื่อเดินทาง คุณ…",
    optionA: "จองที่พัก วางตารางทุกวัน เตรียมพร้อมหมด",
    optionB: "คร่าว ๆ ก็พอ แล้วค่อยตัดสินใจตามความรู้สึกวันนั้น",
  },
  {
    id: 19, dimension: "JP", weight: 1.2, isReverse: false, category: "stress",
    text: "เมื่อมีงานส่ง คุณมักทำ…",
    optionA: "เสร็จก่อนเส้นตาย ไม่ชอบทำกระทันหัน",
    optionB: "ส่วนใหญ่ทำใกล้ deadline รู้สึกว่าความกดดันช่วยได้",
  },
  {
    id: 20, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "คุณชอบชีวิตที่…",
    optionA: "มีโครงสร้าง คาดเดาได้ รู้ว่าจะเกิดอะไรขึ้น",
    optionB: "ยืดหยุ่น มีความตื่นเต้น เปิดรับโอกาสใหม่ ๆ",
  },

  // ── E / I ── Reverse ──────────────────────────────────────────────────────
  // optionA → I-pole, optionB → E-pole  (isReverse=true flips scoring)
  {
    id: 21, dimension: "EI", weight: 1.0, isReverse: true, category: "stress",
    text: "หลังวันที่เต็มไปด้วยการพบปะผู้คน คุณรู้สึกอย่างไร?",
    optionA: "หมดแรง ต้องการเวลาส่วนตัวเพื่อฟื้นฟัน",   // → I
    optionB: "ยังมีพลังเหลือ อยากพบเจอคนอื่นต่อก็ได้",   // → E
  },
  {
    id: 22, dimension: "EI", weight: 1.0, isReverse: true, category: "social",
    text: "คนรอบข้างมักมองคุณว่าเป็นคนแบบไหน?",
    optionA: "สงบ ใจเย็น ชอบสังเกต พูดน้อยแต่ลึก",        // → I
    optionB: "ร่าเริง พูดเก่ง สนุกสนาน เป็นขวัญใจกลุ่ม",   // → E
  },

  // ── S / N ── Reverse ──────────────────────────────────────────────────────
  // optionA → N-pole, optionB → S-pole
  {
    id: 23, dimension: "SN", weight: 1.0, isReverse: true, category: "perception",
    text: "เวลาฟังคนอื่นเล่าเรื่อง คุณมักจับ…",
    optionA: "น้ำเสียงและความหมายแฝง สิ่งที่เขา 'ไม่ได้พูด'",  // → N
    optionB: "ข้อมูลและรายละเอียดที่พูดออกมาชัดเจน",           // → S
  },
  {
    id: 24, dimension: "SN", weight: 1.0, isReverse: true, category: "emotion",
    text: "สิ่งที่ทำให้คุณตื่นเต้นที่สุดคือ…",
    optionA: "ความเป็นไปได้ใหม่ ๆ และสิ่งที่ยังไม่เคยเกิดขึ้น",  // → N
    optionB: "ผลลัพธ์จริงที่สัมผัสได้และทำได้สำเร็จ",           // → S
  },

  // ── T / F ── Reverse ──────────────────────────────────────────────────────
  // optionA → F-pole, optionB → T-pole
  {
    id: 25, dimension: "TF", weight: 1.0, isReverse: true, category: "decision",
    text: "เมื่อตัดสินใจเรื่องสำคัญ คุณให้น้ำหนักอะไรก่อน?",
    optionA: "ความรู้สึกของตัวเองและผู้ที่ได้รับผลกระทบ",          // → F
    optionB: "ข้อมูล ความเป็นเหตุเป็นผล และผลลัพธ์เชิงปฏิบัติ",  // → T
  },
  {
    id: 26, dimension: "TF", weight: 1.0, isReverse: true, category: "social",
    text: "เมื่อเห็นเพื่อนกำลังเสียใจ คุณมักทำสิ่งใดก่อน?",
    optionA: "นั่งฟังและรับฟังอย่างตั้งใจ ไม่รีบหาคำตอบ",    // → F
    optionB: "ถามสาเหตุและช่วยคิดวิธีแก้ปัญหาทันที",           // → T
  },

  // ── J / P ── Reverse ──────────────────────────────────────────────────────
  // optionA → P-pole, optionB → J-pole
  {
    id: 27, dimension: "JP", weight: 1.0, isReverse: true, category: "planning",
    text: "คุณทำงานได้ดีที่สุดเมื่อ…",
    optionA: "มีอิสระปรับแผนตลอด ไม่ถูกจำกัดโดยขั้นตอนตายตัว",  // → P
    optionB: "มีโครงสร้างชัดเจนและรู้ว่าขั้นตอนต่อไปคืออะไร",   // → J
  },
  {
    id: 28, dimension: "JP", weight: 1.0, isReverse: true, category: "stress",
    text: "เมื่อมีเวลาว่างกะทันหัน 2 ชั่วโมง คุณมักจะ…",
    optionA: "ทำสิ่งที่อยากทำตอนนั้น ไม่มีแผนล่วงหน้า",       // → P
    optionB: "ใช้เวลาตาม to-do list หรือเพิ่มงานที่ค้างอยู่",  // → J
  },
]
