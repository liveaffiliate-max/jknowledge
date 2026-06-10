/**
 * src/data/mbti-statements.ts
 *
 * MBTI question pool v3 — single-statement format, expanded pool.
 *
 *  • 60 items, 15 per dimension (EI, SN, TF, JP)
 *  • Each dim: 8 standard (agree → A-pole) + 7 reverse (agree → B-pole)
 *  • Reverse ratio: 28/60 = 47%  (pattern-answer disruption)
 *  • Per session the quiz draws 24 items (4 std + 2 rev per dim) using
 *    a deterministic seed (Clerk userId or persistent guest uuid) — same
 *    user always gets the same subset, so retake results are comparable.
 *  • 5-point Likert: 1 = เห็นด้วยที่สุด ... 5 = ไม่เห็นด้วยเลย
 *
 * A-pole = first letter of MBTIDimension:
 *   EI → A=E   SN → A=S   TF → A=T   JP → A=J
 *
 * Writing guidelines (apply to every statement):
 *   1. Single declarative "ฉัน…" — no questions, no comparisons
 *   2. Balanced tone — no statement should look universally desirable
 *   3. Behavioural (observable), not aspirational ("ฉันชอบ…" > "ฉันอยาก…")
 *   4. Avoid stereotype framing (mall/party/intro-extro clichés)
 *   5. Length ≤ 70 Thai chars to keep mobile reading fast
 */
import type { MBTIQuestion } from "@/types/mbti"

export const mbtiStatements: MBTIQuestion[] = [
  // ── EI dimension ─────────────────────────────────────────────────────────
  // Standard (agree → E)
  {
    id: 1, dimension: "EI", weight: 1.2, isReverse: false, category: "social",
    text: "ฉันรู้สึกมีพลังเมื่อได้พูดคุยกับคนหลายๆ คน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 2, dimension: "EI", weight: 1.1, isReverse: false, category: "social",
    text: "ฉันเริ่มบทสนทนากับคนแปลกหน้าได้ไม่ยาก",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 3, dimension: "EI", weight: 1.0, isReverse: false, category: "emotion",
    text: "เวลามีปัญหา ฉันมักอยากเล่าให้คนอื่นฟัง",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 4, dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "ฉันชอบกิจกรรมที่ได้เจอคนเยอะมากกว่าทำคนเดียว",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → I)
  {
    id: 5, dimension: "EI", weight: 1.2, isReverse: true, category: "social",
    text: "หลังเจอคนเยอะ ฉันต้องการเวลาคนเดียวเพื่อชาร์จพลัง",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 6, dimension: "EI", weight: 1.1, isReverse: true, category: "social",
    text: "ในกลุ่ม ฉันมักรอฟังก่อน ค่อยพูดเมื่อจำเป็น",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 7, dimension: "EI", weight: 1.0, isReverse: true, category: "emotion",
    text: "ฉันรู้จักตัวเองดีที่สุดเมื่อได้อยู่เงียบๆ คนเดียว",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },

  // ── SN dimension ─────────────────────────────────────────────────────────
  // Standard (agree → S)
  {
    id: 8, dimension: "SN", weight: 1.2, isReverse: false, category: "perception",
    text: "ฉันเชื่อข้อเท็จจริงที่จับต้องได้มากกว่าทฤษฎี",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 9, dimension: "SN", weight: 1.1, isReverse: false, category: "perception",
    text: "ฉันสังเกตรายละเอียดรอบตัวได้ชัดเจน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 10, dimension: "SN", weight: 1.0, isReverse: false, category: "planning",
    text: "เมื่อเรียนสิ่งใหม่ ฉันชอบเริ่มจากตัวอย่างจริง",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 11, dimension: "SN", weight: 1.0, isReverse: false, category: "decision",
    text: "ฉันให้ความสำคัญกับสิ่งที่เกิดขึ้นตอนนี้มากกว่าอนาคตที่ไกล",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → N)
  {
    id: 12, dimension: "SN", weight: 1.2, isReverse: true, category: "perception",
    text: "ฉันสนใจความหมายที่ซ่อนอยู่มากกว่าสิ่งที่เห็นเฉพาะหน้า",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 13, dimension: "SN", weight: 1.1, isReverse: true, category: "planning",
    text: "ฉันชอบจินตนาการความเป็นไปได้ในอนาคต",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 14, dimension: "SN", weight: 1.0, isReverse: true, category: "decision",
    text: "ฉันมักเห็นความเชื่อมโยงระหว่างเรื่องที่ดูเหมือนไม่เกี่ยวกัน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },

  // ── TF dimension ─────────────────────────────────────────────────────────
  // Standard (agree → T)
  {
    id: 15, dimension: "TF", weight: 1.2, isReverse: false, category: "decision",
    text: "ฉันตัดสินใจด้วยตรรกะมากกว่าความรู้สึก",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 16, dimension: "TF", weight: 1.1, isReverse: false, category: "social",
    text: "เมื่อเพื่อนมีปัญหา ฉันมักช่วยหาทางแก้ก่อนปลอบใจ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 17, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    text: "ฉันยอมรับความจริงที่เจ็บปวดมากกว่าโกหกเพื่อรักษาน้ำใจ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 18, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    text: "ฉันมองข้อขัดแย้งเป็นการเปรียบเทียบเหตุผล ไม่ใช่อารมณ์",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → F)
  {
    id: 19, dimension: "TF", weight: 1.2, isReverse: true, category: "decision",
    text: "ฉันคิดถึงความรู้สึกของทุกคนที่เกี่ยวข้องก่อนตัดสินใจ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 20, dimension: "TF", weight: 1.1, isReverse: true, category: "emotion",
    text: "ฉันรู้สึกไม่สบายใจเมื่อต้องวิจารณ์งานของคนอื่นตรงๆ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 21, dimension: "TF", weight: 1.0, isReverse: true, category: "social",
    text: "ฉันมักรับรู้อารมณ์ของคนรอบข้างได้ก่อนพวกเขาบอก",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },

  // ── JP dimension ─────────────────────────────────────────────────────────
  // Standard (agree → J)
  {
    id: 22, dimension: "JP", weight: 1.2, isReverse: false, category: "planning",
    text: "ฉันชอบวางแผนล่วงหน้าและทำตามตารางที่กำหนด",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 23, dimension: "JP", weight: 1.1, isReverse: false, category: "planning",
    text: "ฉันรู้สึกดีเมื่อเช็คงานในลิสต์ออกได้ทีละข้อ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 24, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "ที่ทำงานหรือโต๊ะของฉันจัดเป็นระเบียบเสมอ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 25, dimension: "JP", weight: 1.0, isReverse: false, category: "stress",
    text: "ฉันสบายใจกว่าเมื่อมีการตัดสินใจที่ชัดเจน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → P)
  {
    id: 26, dimension: "JP", weight: 1.2, isReverse: true, category: "planning",
    text: "ฉันชอบเปิดให้แผนปรับเปลี่ยนได้ตามสถานการณ์",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 27, dimension: "JP", weight: 1.1, isReverse: true, category: "stress",
    text: "ฉันทำงานได้ดีกว่าตอนใกล้เส้นตาย",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 28, dimension: "JP", weight: 1.0, isReverse: true, category: "planning",
    text: "ฉันเปลี่ยนกิจกรรมไปมาตามความสนใจของแต่ละวัน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // v3 EXPANSION — 32 additional statements (ids 29-60) to grow the pool
  //   to 60 items (15/dim, 8 std + 7 rev). Drawn deterministically per session.
  // ═════════════════════════════════════════════════════════════════════════

  // ── EI extra ─────────────────────────────────────────────────────────────
  // Standard (agree → E)
  {
    id: 29, dimension: "EI", weight: 1.0, isReverse: false, category: "emotion",
    text: "ฉันคิดได้ชัดขึ้นเมื่อได้พูดออกมาดังๆ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 30, dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    text: "ในงานเลี้ยง ฉันมักรู้จักคนใหม่ก่อนกลับบ้าน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 31, dimension: "EI", weight: 1.1, isReverse: false, category: "social",
    text: "ฉันชอบบรรยากาศที่มีคนเยอะและเสียงคุยกัน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 32, dimension: "EI", weight: 1.0, isReverse: false, category: "decision",
    text: "ฉันลงมือทำก่อน แล้วค่อยคิดทบทวนทีหลัง",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → I)
  {
    id: 33, dimension: "EI", weight: 1.0, isReverse: true, category: "social",
    text: "ฉันมีเพื่อนสนิทไม่กี่คน แต่รู้จักกันลึก",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 34, dimension: "EI", weight: 1.0, isReverse: true, category: "emotion",
    text: "ฉันมักเรียบเรียงในหัวเสร็จก่อนค่อยพูดออกมา",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 35, dimension: "EI", weight: 1.0, isReverse: true, category: "stress",
    text: "การพักผ่อนของฉันคือการอยู่ในที่เงียบๆ คนเดียว",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 36, dimension: "EI", weight: 1.0, isReverse: true, category: "social",
    text: "ในห้องเรียน ฉันถนัดเขียนตอบมากกว่ายกมือพูด",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },

  // ── SN extra ─────────────────────────────────────────────────────────────
  // Standard (agree → S)
  {
    id: 37, dimension: "SN", weight: 1.0, isReverse: false, category: "perception",
    text: "ฉันจำเหตุการณ์ในอดีตเป็นภาพได้แม่นยำ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 38, dimension: "SN", weight: 1.0, isReverse: false, category: "planning",
    text: "ฉันถนัดงานที่มีขั้นตอนชัดเจนและมีคู่มือให้ทำตาม",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 39, dimension: "SN", weight: 1.1, isReverse: false, category: "decision",
    text: "ฉันสนใจสิ่งที่นำไปใช้ได้จริงในชีวิตประจำวัน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 40, dimension: "SN", weight: 1.0, isReverse: false, category: "perception",
    text: "ฉันชอบคำอธิบายที่ตรงไปตรงมา ไม่ใช่อุปมา",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → N)
  {
    id: 41, dimension: "SN", weight: 1.1, isReverse: true, category: "perception",
    text: "ฉันชอบคิดว่า 'จะเป็นยังไงถ้า...' มากกว่าสนใจสิ่งที่เป็นอยู่",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 42, dimension: "SN", weight: 1.0, isReverse: true, category: "planning",
    text: "ฉันชอบลองวิธีใหม่กับสิ่งที่เคยทำอยู่เป็นประจำ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 43, dimension: "SN", weight: 1.0, isReverse: true, category: "perception",
    text: "ฉันมักเห็นรูปแบบหรือธีมในสิ่งที่ดูกระจัดกระจาย",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 44, dimension: "SN", weight: 1.0, isReverse: true, category: "emotion",
    text: "ฉันมีไอเดียใหม่ผุดขึ้นมาบ่อยจนตามไม่ทัน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },

  // ── TF extra ─────────────────────────────────────────────────────────────
  // Standard (agree → T)
  {
    id: 45, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    text: "ฉันชอบถกเถียงด้วยเหตุผล แม้จะกระทบความรู้สึกของอีกฝ่ายบ้าง",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 46, dimension: "TF", weight: 1.1, isReverse: false, category: "decision",
    text: "ฉันให้น้ำหนักกับความถูกต้องมากกว่าความสุภาพ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 47, dimension: "TF", weight: 1.0, isReverse: false, category: "emotion",
    text: "ฉันต้องวิเคราะห์ก่อนจึงเข้าใจอารมณ์ของตัวเอง",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 48, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    text: "กฎเกณฑ์ที่เป็นธรรมสำคัญกว่าความรู้สึกเฉพาะตัว",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → F)
  {
    id: 49, dimension: "TF", weight: 1.0, isReverse: true, category: "social",
    text: "ฉันรับฟังความเห็นต่างของคนรอบข้างได้โดยไม่หงุดหงิด",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 50, dimension: "TF", weight: 1.0, isReverse: true, category: "emotion",
    text: "ฉันรู้สึกผิดเมื่อทำให้ใครเสียใจ แม้จะไม่ได้ตั้งใจ",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 51, dimension: "TF", weight: 1.1, isReverse: true, category: "social",
    text: "ความสัมพันธ์สำคัญกับฉันมากกว่าการเป็นฝ่ายถูก",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 52, dimension: "TF", weight: 1.0, isReverse: true, category: "decision",
    text: "ฉันเลือกเส้นทางด้วยหัวใจมากกว่าเหตุผล",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },

  // ── JP extra ─────────────────────────────────────────────────────────────
  // Standard (agree → J)
  {
    id: 53, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "ฉันชอบจบงานก่อนกำหนดเส้นตาย",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 54, dimension: "JP", weight: 1.0, isReverse: false, category: "stress",
    text: "ฉันรู้สึกหงุดหงิดเมื่อแผนถูกเปลี่ยนนาทีสุดท้าย",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 55, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    text: "ฉันแบ่งวันของฉันออกเป็นช่วงๆ ได้ค่อนข้างชัดเจน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 56, dimension: "JP", weight: 1.0, isReverse: false, category: "decision",
    text: "ฉันชอบรู้คำตอบมากกว่าปล่อยให้คำถามค้างไว้",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  // Reverse (agree → P)
  {
    id: 57, dimension: "JP", weight: 1.0, isReverse: true, category: "planning",
    text: "ฉันชอบเริ่มงานหลายอย่างพร้อมกัน",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 58, dimension: "JP", weight: 1.0, isReverse: true, category: "stress",
    text: "ตารางที่แน่นเกินไปทำให้ฉันรู้สึกอึดอัด",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 59, dimension: "JP", weight: 1.0, isReverse: true, category: "perception",
    text: "ฉันชอบสำรวจตัวเลือกใหม่ๆ มากกว่ายึดติดกับแผนเดิม",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
  {
    id: 60, dimension: "JP", weight: 1.0, isReverse: true, category: "decision",
    text: "ฉันเปลี่ยนใจระหว่างทำตามแผนได้บ่อย",
    optionA: "เห็นด้วย", optionB: "ไม่เห็นด้วย",
  },
]

// ── Self-check at module load — guards against future edits drifting ─────────
if (process.env.NODE_ENV !== "production") {
  const byDim = mbtiStatements.reduce<Record<string, { std: number; rev: number }>>(
    (acc, q) => {
      const k = q.dimension
      acc[k] ??= { std: 0, rev: 0 }
      q.isReverse ? acc[k].rev++ : acc[k].std++
      return acc
    },
    {}
  )
  for (const [dim, c] of Object.entries(byDim)) {
    if (c.std !== 8 || c.rev !== 7) {
      // eslint-disable-next-line no-console
      console.warn(`[mbti-statements] ${dim} expected 8 std + 7 rev, got ${c.std} std + ${c.rev} rev`)
    }
  }
  if (mbtiStatements.length !== 60) {
    // eslint-disable-next-line no-console
    console.warn(`[mbti-statements] expected 60 items, got ${mbtiStatements.length}`)
  }
  // Duplicate-id guard — a copy-paste mistake would silently overwrite a question
  const seen = new Set<number>()
  for (const q of mbtiStatements) {
    if (seen.has(q.id)) {
      // eslint-disable-next-line no-console
      console.warn(`[mbti-statements] duplicate id ${q.id}`)
    }
    seen.add(q.id)
  }
}
