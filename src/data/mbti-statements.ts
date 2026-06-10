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
    statement: "ฉันรู้สึกมีพลังเมื่อได้พูดคุยกับคนหลายๆ คน",
  },
  {
    id: 2, dimension: "EI", weight: 1.1, isReverse: false, category: "social",
    statement: "ฉันเริ่มบทสนทนากับคนแปลกหน้าได้ไม่ยาก",
  },
  {
    id: 3, dimension: "EI", weight: 1.0, isReverse: false, category: "emotion",
    statement: "เวลามีปัญหา ฉันมักอยากเล่าให้คนอื่นฟัง",
  },
  {
    id: 4, dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    statement: "ฉันชอบกิจกรรมที่ได้เจอคนเยอะมากกว่าทำคนเดียว",
  },
  // Reverse (agree → I)
  {
    id: 5, dimension: "EI", weight: 1.2, isReverse: true, category: "social",
    statement: "หลังเจอคนเยอะ ฉันต้องการเวลาคนเดียวเพื่อชาร์จพลัง",
  },
  {
    id: 6, dimension: "EI", weight: 1.1, isReverse: true, category: "social",
    statement: "ในกลุ่ม ฉันมักรอฟังก่อน ค่อยพูดเมื่อจำเป็น",
  },
  {
    id: 7, dimension: "EI", weight: 1.0, isReverse: true, category: "emotion",
    statement: "ฉันรู้จักตัวเองดีที่สุดเมื่อได้อยู่เงียบๆ คนเดียว",
  },

  // ── SN dimension ─────────────────────────────────────────────────────────
  // Standard (agree → S)
  {
    id: 8, dimension: "SN", weight: 1.2, isReverse: false, category: "perception",
    statement: "ฉันเชื่อข้อเท็จจริงที่จับต้องได้มากกว่าทฤษฎี",
  },
  {
    id: 9, dimension: "SN", weight: 1.1, isReverse: false, category: "perception",
    statement: "ฉันสังเกตรายละเอียดรอบตัวได้ชัดเจน",
  },
  {
    id: 10, dimension: "SN", weight: 1.0, isReverse: false, category: "planning",
    statement: "เมื่อเรียนสิ่งใหม่ ฉันชอบเริ่มจากตัวอย่างจริง",
  },
  {
    id: 11, dimension: "SN", weight: 1.0, isReverse: false, category: "decision",
    statement: "ฉันให้ความสำคัญกับสิ่งที่เกิดขึ้นตอนนี้มากกว่าอนาคตที่ไกล",
  },
  // Reverse (agree → N)
  {
    id: 12, dimension: "SN", weight: 1.2, isReverse: true, category: "perception",
    statement: "ฉันสนใจความหมายที่ซ่อนอยู่มากกว่าสิ่งที่เห็นเฉพาะหน้า",
  },
  {
    id: 13, dimension: "SN", weight: 1.1, isReverse: true, category: "planning",
    statement: "ฉันชอบจินตนาการความเป็นไปได้ในอนาคต",
  },
  {
    id: 14, dimension: "SN", weight: 1.0, isReverse: true, category: "decision",
    statement: "ฉันมักเห็นความเชื่อมโยงระหว่างเรื่องที่ดูเหมือนไม่เกี่ยวกัน",
  },

  // ── TF dimension ─────────────────────────────────────────────────────────
  // Standard (agree → T)
  {
    id: 15, dimension: "TF", weight: 1.2, isReverse: false, category: "decision",
    statement: "ฉันตัดสินใจด้วยตรรกะมากกว่าความรู้สึก",
  },
  {
    id: 16, dimension: "TF", weight: 1.1, isReverse: false, category: "social",
    statement: "เมื่อเพื่อนมีปัญหา ฉันมักช่วยหาทางแก้ก่อนปลอบใจ",
  },
  {
    id: 17, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    statement: "ฉันยอมรับความจริงที่เจ็บปวดมากกว่าโกหกเพื่อรักษาน้ำใจ",
  },
  {
    id: 18, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    statement: "ฉันมองข้อขัดแย้งเป็นการเปรียบเทียบเหตุผล ไม่ใช่อารมณ์",
  },
  // Reverse (agree → F)
  {
    id: 19, dimension: "TF", weight: 1.2, isReverse: true, category: "decision",
    statement: "ฉันคิดถึงความรู้สึกของทุกคนที่เกี่ยวข้องก่อนตัดสินใจ",
  },
  {
    id: 20, dimension: "TF", weight: 1.1, isReverse: true, category: "emotion",
    statement: "ฉันรู้สึกไม่สบายใจเมื่อต้องวิจารณ์งานของคนอื่นตรงๆ",
  },
  {
    id: 21, dimension: "TF", weight: 1.0, isReverse: true, category: "social",
    statement: "ฉันมักรับรู้อารมณ์ของคนรอบข้างได้ก่อนพวกเขาบอก",
  },

  // ── JP dimension ─────────────────────────────────────────────────────────
  // Standard (agree → J)
  {
    id: 22, dimension: "JP", weight: 1.2, isReverse: false, category: "planning",
    statement: "ฉันชอบวางแผนล่วงหน้าและทำตามตารางที่กำหนด",
  },
  {
    id: 23, dimension: "JP", weight: 1.1, isReverse: false, category: "planning",
    statement: "ฉันรู้สึกดีเมื่อเช็คงานในลิสต์ออกได้ทีละข้อ",
  },
  {
    id: 24, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    statement: "ที่ทำงานหรือโต๊ะของฉันจัดเป็นระเบียบเสมอ",
  },
  {
    id: 25, dimension: "JP", weight: 1.0, isReverse: false, category: "stress",
    statement: "ฉันสบายใจกว่าเมื่อมีการตัดสินใจที่ชัดเจน",
  },
  // Reverse (agree → P)
  {
    id: 26, dimension: "JP", weight: 1.2, isReverse: true, category: "planning",
    statement: "ฉันชอบเปิดให้แผนปรับเปลี่ยนได้ตามสถานการณ์",
  },
  {
    id: 27, dimension: "JP", weight: 1.1, isReverse: true, category: "stress",
    statement: "ฉันทำงานได้ดีกว่าตอนใกล้เส้นตาย",
  },
  {
    id: 28, dimension: "JP", weight: 1.0, isReverse: true, category: "planning",
    statement: "ฉันเปลี่ยนกิจกรรมไปมาตามความสนใจของแต่ละวัน",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // v3 EXPANSION — 32 additional statements (ids 29-60) to grow the pool
  //   to 60 items (15/dim, 8 std + 7 rev). Drawn deterministically per session.
  // ═════════════════════════════════════════════════════════════════════════

  // ── EI extra ─────────────────────────────────────────────────────────────
  // Standard (agree → E)
  {
    id: 29, dimension: "EI", weight: 1.0, isReverse: false, category: "emotion",
    statement: "ฉันคิดได้ชัดขึ้นเมื่อได้พูดออกมาดังๆ",
  },
  {
    id: 30, dimension: "EI", weight: 1.0, isReverse: false, category: "social",
    statement: "ในงานเลี้ยง ฉันมักรู้จักคนใหม่ก่อนกลับบ้าน",
  },
  {
    id: 31, dimension: "EI", weight: 1.1, isReverse: false, category: "social",
    statement: "ฉันชอบบรรยากาศที่มีคนเยอะและเสียงคุยกัน",
  },
  {
    id: 32, dimension: "EI", weight: 1.0, isReverse: false, category: "decision",
    statement: "ฉันลงมือทำก่อน แล้วค่อยคิดทบทวนทีหลัง",
  },
  // Reverse (agree → I)
  {
    id: 33, dimension: "EI", weight: 1.0, isReverse: true, category: "social",
    statement: "ฉันมีเพื่อนสนิทไม่กี่คน แต่รู้จักกันลึก",
  },
  {
    id: 34, dimension: "EI", weight: 1.0, isReverse: true, category: "emotion",
    statement: "ฉันมักเรียบเรียงในหัวเสร็จก่อนค่อยพูดออกมา",
  },
  {
    id: 35, dimension: "EI", weight: 1.0, isReverse: true, category: "stress",
    statement: "การพักผ่อนของฉันคือการอยู่ในที่เงียบๆ คนเดียว",
  },
  {
    id: 36, dimension: "EI", weight: 1.0, isReverse: true, category: "social",
    statement: "ในห้องเรียน ฉันถนัดเขียนตอบมากกว่ายกมือพูด",
  },

  // ── SN extra ─────────────────────────────────────────────────────────────
  // Standard (agree → S)
  {
    id: 37, dimension: "SN", weight: 1.0, isReverse: false, category: "perception",
    statement: "ฉันจำเหตุการณ์ในอดีตเป็นภาพได้แม่นยำ",
  },
  {
    id: 38, dimension: "SN", weight: 1.0, isReverse: false, category: "planning",
    statement: "ฉันถนัดงานที่มีขั้นตอนชัดเจนและมีคู่มือให้ทำตาม",
  },
  {
    id: 39, dimension: "SN", weight: 1.1, isReverse: false, category: "decision",
    statement: "ฉันสนใจสิ่งที่นำไปใช้ได้จริงในชีวิตประจำวัน",
  },
  {
    id: 40, dimension: "SN", weight: 1.0, isReverse: false, category: "perception",
    statement: "ฉันชอบคำอธิบายที่ตรงไปตรงมา ไม่ใช่อุปมา",
  },
  // Reverse (agree → N)
  {
    id: 41, dimension: "SN", weight: 1.1, isReverse: true, category: "perception",
    statement: "ฉันชอบคิดว่า 'จะเป็นยังไงถ้า...' มากกว่าสนใจสิ่งที่เป็นอยู่",
  },
  {
    id: 42, dimension: "SN", weight: 1.0, isReverse: true, category: "planning",
    statement: "ฉันชอบลองวิธีใหม่กับสิ่งที่เคยทำอยู่เป็นประจำ",
  },
  {
    id: 43, dimension: "SN", weight: 1.0, isReverse: true, category: "perception",
    statement: "ฉันมักเห็นรูปแบบหรือธีมในสิ่งที่ดูกระจัดกระจาย",
  },
  {
    id: 44, dimension: "SN", weight: 1.0, isReverse: true, category: "emotion",
    statement: "ฉันมีไอเดียใหม่ผุดขึ้นมาบ่อยจนตามไม่ทัน",
  },

  // ── TF extra ─────────────────────────────────────────────────────────────
  // Standard (agree → T)
  {
    id: 45, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    statement: "ฉันชอบถกเถียงด้วยเหตุผล แม้จะกระทบความรู้สึกของอีกฝ่ายบ้าง",
  },
  {
    id: 46, dimension: "TF", weight: 1.1, isReverse: false, category: "decision",
    statement: "ฉันให้น้ำหนักกับความถูกต้องมากกว่าความสุภาพ",
  },
  {
    id: 47, dimension: "TF", weight: 1.0, isReverse: false, category: "emotion",
    statement: "ฉันต้องวิเคราะห์ก่อนจึงเข้าใจอารมณ์ของตัวเอง",
  },
  {
    id: 48, dimension: "TF", weight: 1.0, isReverse: false, category: "decision",
    statement: "กฎเกณฑ์ที่เป็นธรรมสำคัญกว่าความรู้สึกเฉพาะตัว",
  },
  // Reverse (agree → F)
  {
    id: 49, dimension: "TF", weight: 1.0, isReverse: true, category: "social",
    statement: "ฉันรับฟังความเห็นต่างของคนรอบข้างได้โดยไม่หงุดหงิด",
  },
  {
    id: 50, dimension: "TF", weight: 1.0, isReverse: true, category: "emotion",
    statement: "ฉันรู้สึกผิดเมื่อทำให้ใครเสียใจ แม้จะไม่ได้ตั้งใจ",
  },
  {
    id: 51, dimension: "TF", weight: 1.1, isReverse: true, category: "social",
    statement: "ความสัมพันธ์สำคัญกับฉันมากกว่าการเป็นฝ่ายถูก",
  },
  {
    id: 52, dimension: "TF", weight: 1.0, isReverse: true, category: "decision",
    statement: "ฉันเลือกเส้นทางด้วยหัวใจมากกว่าเหตุผล",
  },

  // ── JP extra ─────────────────────────────────────────────────────────────
  // Standard (agree → J)
  {
    id: 53, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    statement: "ฉันชอบจบงานก่อนกำหนดเส้นตาย",
  },
  {
    id: 54, dimension: "JP", weight: 1.0, isReverse: false, category: "stress",
    statement: "ฉันรู้สึกหงุดหงิดเมื่อแผนถูกเปลี่ยนนาทีสุดท้าย",
  },
  {
    id: 55, dimension: "JP", weight: 1.0, isReverse: false, category: "planning",
    statement: "ฉันแบ่งวันของฉันออกเป็นช่วงๆ ได้ค่อนข้างชัดเจน",
  },
  {
    id: 56, dimension: "JP", weight: 1.0, isReverse: false, category: "decision",
    statement: "ฉันชอบรู้คำตอบมากกว่าปล่อยให้คำถามค้างไว้",
  },
  // Reverse (agree → P)
  {
    id: 57, dimension: "JP", weight: 1.0, isReverse: true, category: "planning",
    statement: "ฉันชอบเริ่มงานหลายอย่างพร้อมกัน",
  },
  {
    id: 58, dimension: "JP", weight: 1.0, isReverse: true, category: "stress",
    statement: "ตารางที่แน่นเกินไปทำให้ฉันรู้สึกอึดอัด",
  },
  {
    id: 59, dimension: "JP", weight: 1.0, isReverse: true, category: "perception",
    statement: "ฉันชอบสำรวจตัวเลือกใหม่ๆ มากกว่ายึดติดกับแผนเดิม",
  },
  {
    id: 60, dimension: "JP", weight: 1.0, isReverse: true, category: "decision",
    statement: "ฉันเปลี่ยนใจระหว่างทำตามแผนได้บ่อย",
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
