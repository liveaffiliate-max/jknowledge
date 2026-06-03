# PRODUCT.md

# Product

## Register

product

---

## Users

นักเรียนมัธยมปลายและผู้สมัคร TCAS อายุ 16-19 ปี

### Context

* ใช้งานบนมือถือเป็นหลัก (>80%)
* ใช้งานระหว่างเรียน กวดวิชา หรือช่วงเตรียมสอบ
* มีเวลาน้อย
* ความกังวลเกี่ยวกับอนาคตสูง
* ไม่ต้องการอ่านข้อมูลจำนวนมาก

### Jobs To Be Done

เมื่อฉันมีคะแนนสอบ

ฉันต้องการรู้ว่า

* คะแนนของฉันดีแค่ไหน
* มีโอกาสติดที่ไหนบ้าง
* ควรเลือกคณะอะไร
* ควรยื่นรอบใด

เพื่อให้ฉันตัดสินใจสมัครได้อย่างมั่นใจ

---

## Product Purpose

JKnowledge คือ TCAS Decision Support Platform

ช่วยนักเรียน

* วิเคราะห์คะแนน
* เปรียบเทียบข้อมูลย้อนหลัง
* ประเมินโอกาสรับ
* ค้นหาคณะที่เหมาะสม
* วางแผนการสมัคร

ความสำเร็จไม่ใช่การทำให้ผู้ใช้ดูข้อมูลมากขึ้น

แต่คือ

"ทำให้ผู้ใช้ตัดสินใจได้"

---

## Product Promise

ภายใน 60 วินาที

ผู้ใช้ต้องสามารถ

* กรอกคะแนน
* เข้าใจสถานะของตนเอง
* เห็นทางเลือกที่เหมาะสม

โดยไม่ต้องอ่านคู่มือ

---

## Brand Personality

### Friendly

พูดเหมือนรุ่นพี่

ไม่เป็นทางการเกินไป

### Trustworthy

ใช้ข้อมูลจริง

อธิบายที่มาของข้อมูลได้

### Modern

เรียบง่าย

รวดเร็ว

ไม่เหมือนระบบราชการ

---

## Tone Of Voice

### Do

* "มีโอกาสค่อนข้างสูง"
* "ลองพิจารณาคณะเหล่านี้เพิ่มเติม"
* "คะแนนใกล้เคียงกับปีก่อน"

### Don't

* "ติดแน่นอน"
* "ไม่มีทางติด"
* "คะแนนแย่มาก"
* "ควรเปลี่ยนความฝัน"

---

## Anti References

### Government Systems

หลีกเลี่ยง

* ตารางขนาดใหญ่
* เมนูซับซ้อน
* สีราชการ
* หน้าจอที่ต้องตีความเอง

### Tutor Websites

หลีกเลี่ยง

* Banner เต็มจอ
* Popup รบกวน
* Countdown ปลอม
* Fear Marketing

### Generic AI SaaS

หลีกเลี่ยง

* Card ซ้อน Card
* Hero แบบ template
* Dashboard ที่ไม่มีความหมาย

---

# Core Product Principles

## 1. Information First

ข้อมูลสำคัญกว่าดีไซน์

Visual ต้องช่วยให้เข้าใจข้อมูล

ไม่ใช่แย่งความสนใจจากข้อมูล

---

## 2. Reduce Anxiety

ทุกหน้าต้องลดความเครียด

ไม่เพิ่มความเครียด

ถามเสมอว่า

"องค์ประกอบนี้ช่วยผู้ใช้ตัดสินใจ หรือแค่ทำให้ตื่นเต้น"

---

## 3. Fast To Value

เวลาจาก Landing Page → Insight

ต้องสั้นที่สุด

หลีกเลี่ยง

* Login ก่อนใช้
* Onboarding หลายขั้น
* Form ยาว

---

## 4. Trust Through Transparency

ทุกคะแนนและการคาดการณ์

ต้องอธิบายได้ว่า

มาจากข้อมูลใด

---

## 5. Mobile Native

ออกแบบสำหรับมือถือก่อนเสมอ

Desktop เป็น Secondary Experience

---

# Success Metrics

## User Success

* วิเคราะห์คะแนนสำเร็จ
* ดูผลลัพธ์ครบ
* กลับมาใช้งานซ้ำ
* แชร์ผลลัพธ์

## Product Success

* Quiz Completion Rate
* Score Analysis Completion Rate
* Result View Rate
* Return User Rate
* Share Rate

---

# Design Principles

## Clarity Over Creativity

ถ้าต้องเลือกระหว่าง

* สวย
* เข้าใจง่าย

เลือกเข้าใจง่าย

---

## One Primary Action

หนึ่งหน้ามี CTA หลักเพียงหนึ่งเดียว

---

## Progressive Disclosure

แสดงเฉพาะข้อมูลที่จำเป็นก่อน

รายละเอียดค่อยเปิดภายหลัง

---

## Confidence Before Precision

ผู้ใช้ต้องเข้าใจแนวโน้มก่อน

แล้วจึงเห็นตัวเลขละเอียด

---

# Accessibility

ขั้นต่ำต้องผ่าน WCAG AA

### Requirements

* Contrast ≥ 4.5:1
* Keyboard Navigation
* Screen Reader Support
* Reduced Motion Support
* Touch Target ≥ 44px
* Thai Typography Optimized

---

# Performance Requirements

## Loading

Target

* LCP < 2.5s
* CLS < 0.1
* INP < 200ms

---

## UX Rules

ห้ามมี

* Loading เกิน 3 วินาทีโดยไม่มี feedback
* Layout Shift
* Skeleton ที่ไม่ตรงกับข้อมูลจริง

---

# Definition Of Done

Feature จะถือว่าเสร็จเมื่อ

* Functional
* Mobile First
* Accessible
* Responsive
* Analytics Ready
* SEO Ready
* Pass Design Review
* Pass Impeccable Standards

หากไม่ผ่านข้อใดข้อหนึ่ง

Feature ยังไม่ถือว่าเสร็จ
