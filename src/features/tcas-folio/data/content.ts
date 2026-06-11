// Static content for /tcas-folio.

export const TCAS_FOLIO_PDF = {
  title: "คู่มือทำพอร์ตโฟลิโอ ฉบับเตรียมยื่น TCAS",
  description:
    "รวมแนวทางวางโครงร่าง เลือกผลงาน และนำเสนอพอร์ตโฟลิโอให้โดดเด่น เหมาะสำหรับน้อง ๆ ที่กำลังเตรียมยื่น Portfolio รอบ 1",
  fileUrl: "https://pztddn9vmk4bwwny.public.blob.vercel-storage.com/Ebook.pdf",
  fileSizeLabel: "101 MB",
}

export interface TcasFolioEpisode {
  id: string
  order: number
  title: string
  description: string
  /** Full YouTube URL or bare video ID — normalized via getYoutubeVideoId(). */
  youtubeUrl: string
}

export const TCAS_FOLIO_EPISODES: TcasFolioEpisode[] = [
  {
    id: "ep1",
    order: 1,
    title: "EP.1 — เริ่มต้นวางโครงพอร์ตโฟลิโอ",
    description: "ทำความเข้าใจโครงสร้างพอร์ตโฟลิโอที่กรรมการอยากเห็น และวิธีเริ่มต้นจากศูนย์",
    youtubeUrl: "https://www.youtube.com/watch?v=tyKkGjW7RH8&list=PLcwZ3uF2IxQXdV4IHNnKADRfEmAI1zpzy&index=2",
  },
  {
    id: "ep2",
    order: 2,
    title: "EP.2 — เลือกและจัดเรียงผลงาน",
    description: "เทคนิคคัดเลือกผลงานที่ใช่ และจัดลำดับให้เล่าเรื่องตัวเองได้ชัดเจน",
    youtubeUrl: "https://www.youtube.com/watch?v=ut2VrTSk1SA&list=PLcwZ3uF2IxQXdV4IHNnKADRfEmAI1zpzy&index=2",
  },
  {
    id: "ep3",
    order: 3,
    title: "EP.3 — ดีไซน์และรายละเอียดสุดท้าย",
    description: "ปรับดีไซน์ให้สวยอ่านง่าย พร้อมเช็กลิสต์ก่อนส่งพอร์ตโฟลิโอจริง",
    youtubeUrl: "https://www.youtube.com/watch?v=5KYiIkONtn8&list=PLcwZ3uF2IxQXdV4IHNnKADRfEmAI1zpzy&index=3",
  },
]
