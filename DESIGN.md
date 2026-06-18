---
name: Jknowledge
description: TCAS score analysis tool ที่เป็นรุ่นพี่คนแรกที่นักเรียนไว้ใจได้
colors:
  forest-ink: "oklch(0.568 0.158 149)"
  forest-ink-deep: "oklch(0.3 0.09 149)"
  forest-ink-light: "oklch(0.94 0.04 149)"
  pure-white: "oklch(1 0 0)"
  near-black: "oklch(0.145 0 0)"
  surface-muted: "oklch(0.97 0 0)"
  ink-muted: "oklch(0.556 0 0)"
  border-subtle: "oklch(0.922 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "LINE Seed Sans TH, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "LINE Seed Sans TH, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "LINE Seed Sans TH, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "LINE Seed Sans TH, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "LINE Seed Sans TH, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  3xl: "22px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.forest-ink}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "oklch(0.48 0.148 149)"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.near-black}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  input-default:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.near-black}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
  input-focus:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.near-black}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
  card-default:
    backgroundColor: "{colors.pure-white}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  badge-green:
    backgroundColor: "{colors.forest-ink-light}"
    textColor: "{colors.forest-ink-deep}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: Jknowledge

## 1. Overview

**Creative North Star: "The First Friend"**

Jknowledge ออกแบบโดยมีรุ่นพี่คนแรกเป็น metaphor — คนที่ผ่าน TCAS มาแล้ว เปิด spreadsheet ให้ดู บอกตรงๆ ว่าคะแนนอยู่ตรงไหน คณะไหนพอไปได้ คณะไหนต้องระวัง ไม่มีการขาย ไม่มีการกดดัน และที่สำคัญที่สุด ไม่มีการตัดสิน

ระบบ visual นี้สร้างความไว้ใจก่อนสิ่งอื่น ด้วย contrast ที่อ่านได้ชัดเจน, typography ที่ไม่ต้องตีความ, และ data display ที่แสดงตัวเลขเป็นตัวเลข ไม่ใช่ตัวเลขที่ถูกห่อด้วย decoration จนไม่รู้ว่าตัวเลขจริงคือเท่าไหร่ Forest Ink green ปรากฎอย่างประหยัดและมีเหตุผล — บน interactive elements และ positive states เท่านั้น ไม่ใช้เพื่อตกแต่ง

สิ่งที่ระบบนี้ปฏิเสธโดยสิ้นเชิง: ความวุ่นวายแบบเว็บติวเตอร์ไทย (banner ทับ banner, countdown ทุกหน้า, สีฉูดฉาดเพื่อดึงความสนใจ), ความเก่าแบบเว็บรัฐบาล (ตาราง HTML ดิบ, layout หลายคอลัมน์ที่ไม่มีความหมาย), และ generic SaaS template ที่ใช้ card grid เหมือนกันทุกหน้า

**Key Characteristics:**
- Data-forward: ตัวเลขอ่านง่ายเสมอ ไม่มีอะไรบังตัวเลขจริง
- Friendly neutral: พื้นหลังขาวสะอาด สีเขียวประหยัด ไม่มีสีฉูดฉาด
- Mobile-native: spacing ใหญ่เพียงพอสำหรับนิ้วโป้ง ไม่ใช่แค่ shrink จาก desktop
- Non-judgmental: ไม่มี red alert สำหรับคะแนนต่ำ ใช้สีเพื่อ inform ไม่ใช่ scare
- Thai-first: Kanit อ่านสบายทั้งภาษาไทยและอังกฤษ ไม่มี font rendering issues

## 2. Colors: The Forest Ink Palette

สีเขียวเดียวบนพื้นขาว — ความประหยัดของสีทำให้สีมีน้ำหนักมากขึ้น

### Primary
- **Forest Ink** (`oklch(0.568 0.158 149)` ≈ #16a34a): สีแอ็คชันหลัก — button primary, active states, progress bars, checkmarks, positive chance indicators ใช้เฉพาะเมื่อ user ต้องการกระทำหรือระบบกำลังยืนยันอะไรบางอย่าง ไม่ใช้เป็น decorative color
- **Forest Ink Deep** (`oklch(0.3 0.09 149)`): text บน light green bg, focused badge text, section headers ที่ต้องการ emphasis แบบ on-brand
- **Forest Ink Light** (`oklch(0.94 0.04 149)`): badge bg, success state bg, hover bg บน feature cards — tint ที่บอกว่า "นี่คือโซน green" โดยไม่ต้องใช้สีเต็ม

### Neutral
- **Pure White** (`oklch(1 0 0)`): page background, card background, input background — canvas หลัก
- **Near Black** (`oklch(0.145 0 0)`): body text, headings — contrast ≥ 13:1 บน white
- **Surface Muted** (`oklch(0.97 0 0)`): section backgrounds, alternating row, empty state bg — ต่างจาก white พอสังเกตเห็นได้แต่ไม่ดึงความสนใจ
- **Ink Muted** (`oklch(0.556 0 0)`): secondary text, meta information, placeholder — ใช้สำหรับข้อมูลที่รองรับเนื้อหาหลัก ไม่ใช้สำหรับข้อมูลสำคัญ (contrast ≈ 4.6:1 บน white, ผ่าน AA สำหรับ body ขนาดเล็ก)
- **Border Subtle** (`oklch(0.922 0 0)`): dividers, input borders, card borders — ให้โครงสร้างโดยไม่แข่งกับ content

### Semantic (สีเพื่อ data viz เท่านั้น)
- **Chance High**: Forest Ink Green — โอกาสสูง
- **Chance Competitive**: `oklch(0.78 0.15 70)` (amber) — แข่งขันได้ ไม่ใช่ warning
- **Chance Low**: `oklch(0.577 0.245 27.325)` (red) — โอกาสน้อย ไม่ใช่ failure
- **Destructive**: `oklch(0.577 0.245 27.325)`: เฉพาะ error states จริงๆ ไม่ใช้กับ "Low Chance" เพราะ low chance ไม่ใช่ error

**The Forest Ink Rule.** Forest Ink ปรากฎบน interactive elements และ positive data states เท่านั้น ห้ามใช้เป็น decorative stripe, section accent, หรือ hover glow บน neutral surfaces ความหายากคือจุดแข็ง

**The No Red Alarm Rule.** Red/Destructive ใช้ได้เฉพาะ form validation errors และ actual errors ห้ามใช้กับ "Low Chance" admission prediction — "Low Chance" ≠ failure, ใช้ red-tinted text แบบ muted แทน

## 3. Typography

**Primary Font:** Kanit (Google Fonts, Thai + Latin geometric sans-serif, weight 300–700)
**Mono Font:** Geist Mono (สำหรับ data/code เท่านั้น — ยังไม่ได้ใช้ใน production)

**Character:** Kanit เป็น geometric sans ที่ออกแบบมาสำหรับภาษาไทยโดยเฉพาะ ตัวอักษรไทยและภาษาอังกฤษมี x-height และ weight ที่ balance กันดี ทำให้ mixed-language text อ่านสบายโดยไม่ต้องสลับ font อ่านง่ายบน mobile screen ที่ความละเอียดสูง

### Hierarchy
- **Display** (700, clamp(2rem → 3.75rem), lh 1.1, ls -0.02em): Hero headings บน landing page เท่านั้น ไม่เกิน 1 instance ต่อ page section
- **Headline** (700, clamp(1.5rem → 2rem), lh 1.2): Page titles, major section headers เช่น "วิเคราะห์คะแนน TCAS"
- **Title** (600, 1.125rem/18px, lh 1.4): Card headers, sub-section titles, modal headings
- **Body** (400, 0.875rem/14px, lh 1.6, max 65ch): Primary reading content — descriptions, explanations ต้อง contrast ≥ 4.5:1
- **Label** (500, 0.75rem/12px, lh 1.4): Badge text, table headers, meta info, input labels — ห้ามใช้กับ long sentences

**The Thai-First Rule.** ทุก font-size decision ต้องทดสอบกับ Thai characters ก่อน Kanit เล็กกว่า Latin-only fonts ที่ขนาดเดียวกัน — body ต้องไม่ต่ำกว่า 14px เพื่อ Thai readability ห้าม 12px สำหรับ body text ภาษาไทย

**The Weight Rule.** ใช้ weight เพื่อสร้าง hierarchy ไม่ใช้ size เป็นอย่างเดียว Title (600) vs Body (400) สร้าง contrast ≥ 1.5 stops — ห้ามใช้ weight 300 ในกรณีใดก็ตามใน UI เพราะ Thai characters ที่ light weight อ่านยาก

## 4. Elevation

Jknowledge ใช้ **tonal layering** เป็นหลัก ไม่ใช่ shadow — ความลึกมาจากสีพื้นหลังที่ต่างกัน (`oklch(1 0 0)` card บน `oklch(0.97 0 0)` section bg) Shadow ปรากฎเฉพาะเมื่อ element lift ออกจาก surface จริงๆ (hover state, dropdown, dialog)

### Shadow Vocabulary
- **Ambient Low** (`box-shadow: 0 1px 3px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.06)`): card hover state, subtle lift — แสดงว่า element นี้ interactive
- **Modal** (`box-shadow: 0 20px 60px oklch(0 0 0 / 0.15)`): dialogs, dropdowns — ชัดว่า element นี้ float เหนือ content

**The Flat-By-Default Rule.** Surface ทุก surface เริ่มต้นด้วยพื้นหลังสีต่างกัน ไม่ใช่ shadow Shadow ปรากฎเฉพาะเป็น response ต่อ state (hover, focus, float) การใช้ shadow บน static card = AI reflex ไม่ใช่ intention

## 5. Components

### Buttons
Design ที่ตรงไปตรงมา — ขนาดใหญ่พอสำหรับ mobile touch (h-11/44px minimum), label บอกว่าจะเกิดอะไร

- **Shape:** Rounded-xl (14px) — โค้งพอที่จะ friendly ไม่โค้งจนดู toy
- **Primary:** Forest Ink bg (`oklch(0.568 0.158 149)`) + white text, h-11 (44px), px-6 (24px). Hover: `oklch(0.48 0.148 149)` (darker 10%), transition 150ms ease-out
- **Outline:** transparent bg + border-gray-200, same sizing. Hover: bg-gray-50, border-gray-300
- **Disabled:** bg-gray-100 + text-gray-400, cursor-not-allowed — ไม่ใช้ opacity trick เพราะ Thai text ที่โปร่งแสงอ่านยาก
- **Focus:** ring-2 ring-forest-ink/30 ring-offset-2 — ชัดเจนสำหรับ keyboard navigation

**The Verb Rule.** Button label ต้องเป็น verb + object เสมอ: "วิเคราะห์คะแนน", "ดูผลลัพธ์", "เริ่มแบบทดสอบ" ห้าม "ตกลง", "ใช่", "ไป"

### Cards / Containers
- **Corner Style:** Rounded-2xl (18px) — radius ที่ใหญ่กว่า button เพื่อ visual hierarchy ที่ชัด (containers > controls)
- **Background:** Pure white บน surface-muted background, หรือ surface-muted บน pure white
- **Shadow Strategy:** Flat-by-default ตาม Elevation section — hover เพิ่ม ambient-low shadow
- **Border:** `border border-gray-100` (oklch 0.955 0 0) — แทบมองไม่เห็น ให้โครงสร้างเฉยๆ
- **Internal Padding:** p-5 (20px) สำหรับ content cards, p-6 (24px) สำหรับ page-level sections
- **Nested Cards:** ห้ามโดยสิ้นเชิง card ใน card = error

### Inputs / Fields
- **Style:** Border border-gray-200, bg-white, rounded-xl (14px), py-2.5/py-3 ขึ้นกับ context
- **Focus:** border-green-400 + ring-2 ring-green-100 (Forest Ink Light tint ring) — ชัดเจนว่า field นี้ active
- **Disabled:** opacity-50 + cursor-not-allowed
- **Error:** border-red-400 + ring-red-100 (ใช้เฉพาะ validation error จริงๆ)
- **Icon position:** Search icon ที่ left-3.5, vertically centered — icon ขนาด h-4 w-4

### Badges / Chips
พื้นที่เล็กสำหรับ metadata — year labels, field tags, status indicators

- **Green variant:** bg-green-50 (Forest Ink Light) + text-green-700 (Forest Ink Deep), rounded-full, px-2.5 py-0.5 text-xs font-semibold
- **Gray variant:** bg-gray-100 + text-gray-500, rounded-full, px-2 py-0.5 text-[10px]
- **Field tag variant:** colored border + matching text/bg (per field: วิศวกรรม = blue, แพทย์ = red, ศิลปะ = orange ฯลฯ) — rounded-full px-2 py-0.5 text-[10px]
- **ห้าม:** badge ขนาดใหญ่, badge ที่มี icon โดยไม่มีเหตุผล, badge ซ้อน badge

### Score Display (Signature Component)
Data viz ที่เป็นจุดเด่นที่สุดของโปรเจค

- **Stat cells:** rounded-xl, p-3, bg ตาม context (primary color bg สำหรับ user score, bg-gray-50 สำหรับ reference scores)
- **Score number:** text-2xl font-bold — ใหญ่พอที่จะ scan ได้ทันที ไม่ต้องหา
- **Position bar:** relative bar พร้อม zone coloring (red zone → competitive zone → green zone) — user dot บนบาร์ด้วย colored circle ที่มี border-white shadow-md
- **Trend chart:** Recharts LineChart, clean grid, ไม่มี heavy axes, user score เป็น dashed reference line
- **Chance indicator:** icon + color + label text — CheckCircle2 (green), AlertCircle (amber), XCircle (red) ห้ามใช้ traffic light เป็น sole indicator (color-blindness)

### Navigation (Header)
- Logo + nav links + auth button, max-w-6xl, border-b
- Mobile: hamburger menu หรือ simplified nav
- Active state: text-green-600, underline indicator

## 6. Do's and Don'ts

### Do:
- **Do** ใช้ Forest Ink green เฉพาะบน interactive controls (buttons, links) และ positive data states (High Chance, success) เท่านั้น
- **Do** แสดง score data ด้วยตัวเลขขนาดใหญ่ที่อ่านได้ก่อน จากนั้นค่อยมี label เล็กๆ กำกับ
- **Do** ใช้ Surface Muted (oklch 0.97 0 0) เป็น section background เพื่อสร้าง depth แบบ flat โดยไม่ต้องใช้ shadow
- **Do** ให้ body text มี contrast ≥ 4.5:1 เสมอ — Ink Muted ผ่านแค่ AA body ไม่ใช้กับ critical information
- **Do** ใช้ rounded-2xl (18px) สำหรับ containers และ rounded-xl (14px) สำหรับ controls — hierarchy ผ่าน radius
- **Do** label button ด้วย verb + object ภาษาไทย: "วิเคราะห์คะแนน", "ดูผลลัพธ์" ไม่ใช่ "Submit" หรือ "ตกลง"
- **Do** ใช้ text-wrap: balance บน h1–h3 เพื่อ Thai text line breaks ที่ natural
- **Do** ขนาด body text ≥ 14px (0.875rem) สำหรับ Thai characters

### Don't:
- **Don't** ใช้ border-left หรือ border-right มากกว่า 1px เป็น colored accent บน cards, callouts, alerts — ใช้ full border หรือ background tint แทน
- **Don't** ใช้ gradient text (background-clip: text) ในกรณีใดก็ตาม
- **Don't** สร้าง card grid ที่ทุก card หน้าตาเหมือนกัน (icon + heading + text size เท่ากันทุก card) — แยก visual weight ตาม content importance
- **Don't** ทำให้ "Low Chance" ดู dramatic ด้วย red alert, เสียง, หรือ animation ที่รุนแรง — Low Chance = ข้อมูล ไม่ใช่ judgment
- **Don't** ใช้ uppercase eyebrow text บนทุก section ("FEATURES", "HOW IT WORKS") — เป็น AI scaffold reflex ที่ชัดเจน
- **Don't** ใส่ countdown timer, urgency messaging, หรือ dark pattern ที่กดดันนักเรียน
- **Don't** ออกแบบให้ดูเหมือนเว็บรัฐบาลไทย (ตารางแดงน้ำเงิน, layout หลายคอลัมน์ที่ไม่มีลำดับ, font Sarabun ขนาด 12px)
- **Don't** ออกแบบให้ดูเหมือนเว็บติวเตอร์ไทย (banner animation, สีส้มแดงโฆษณา, ข้อความ "สมัครด่วน!" ทุกหน้า)
- **Don't** ใช้ glassmorphism (backdrop-filter + low opacity bg) เป็น default card style — ใช้ได้เฉพาะ overlay จริงๆ
- **Don't** nested cards — card ใน card ทำให้ boundary ของ information architecture พัง
