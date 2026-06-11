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
    title: "EP.1 TCASFolio คืออะไร? เข้าใจรอบ Portfolio ก่อนเริ่มทำพอร์ต",
    description:
      "รอบ Portfolio ไม่ใช่แค่การรวมเกียรติบัตรใส่แฟ้ม แต่คือการนำเสนอ “ตัวตน ความสามารถ และเป้าหมาย” ของน้องให้คณะกรรมการเห็นว่าเราเหมาะกับคณะ/สาขาที่อยากเข้าแค่ไหน\n\nคลิปนี้พี่ J จะพาน้อง ๆ มาปูพื้นฐาน TCASFolio และ TCAS รอบ 1 Portfolio ตั้งแต่ศูนย์ ว่ารอบนี้คืออะไร ใช้คะแนนอะไรบ้าง ใครเหมาะกับรอบพอร์ต และต้องเริ่มเตรียมตัวยังไงให้ไม่หลงทาง",
    youtubeUrl: "https://www.youtube.com/watch?v=tyKkGjW7RH8&list=PLcwZ3uF2IxQXdV4IHNnKADRfEmAI1zpzy&index=2",
  },
  {
    id: "ep2",
    order: 2,
    title: "EP.2 พอร์ต 10 หน้าต้องมีอะไรบ้าง? เช็กลิสต์ทำ Portfolio ให้ตรงคณะ",
    description: "ทำพอร์ตยังไงให้ดูดี มีทิศทาง และไม่ใช่แค่การเอาเกียรติบัตรมาวางรวมกัน?\n\nคลิปนี้พี่ J จะพาน้อง ๆ เจาะโครงสร้าง Portfolio 10 หน้า ว่าควรมีอะไรบ้าง ตั้งแต่หน้าปก SOP หรือจดหมายแนะนำตัว ประวัติส่วนตัว การศึกษา ผลงาน กิจกรรม ไปจนถึงเกียรติบัตรและรางวัลที่ควรเลือกใส่\n\nน้องจะได้รู้ว่า “พอร์ตที่ดี” ไม่ได้วัดแค่ความสวย แต่ต้องเล่าเรื่องตัวเราให้กรรมการเห็นว่า เรามีความตั้งใจ มีผลงานที่เชื่อมโยงกับคณะที่อยากเข้า และมีเป้าหมายชัดเจน",
    youtubeUrl: "https://www.youtube.com/watch?v=ut2VrTSk1SA&list=PLcwZ3uF2IxQXdV4IHNnKADRfEmAI1zpzy&index=2",
  },
  {
    id: "ep3",
    order: 3,
    title: "EP.3 วิธีใช้ระบบ TCASFolio และ 10 คำถามสัมภาษณ์รอบพอร์ตที่ต้องเจอ",
    description: "ก่อนยื่นรอบพอร์ตจริง น้องไม่ได้ต้องเตรียมแค่ไฟล์ Portfolio แต่ต้องเข้าใจระบบ TCASFolio และเตรียมตัวสัมภาษณ์ให้พร้อมด้วย\n\nคลิปนี้พี่ J จะพาน้อง ๆ รู้จักขั้นตอนการใช้งานระบบ TCASFolio ตั้งแต่การลงทะเบียน การกรอกข้อมูล การสร้างแฟ้มสะสมผลงาน การดาวน์โหลด PDF ไปจนถึงข้อควรระวังก่อนส่งข้อมูลจริง\n\nช่วงท้ายคลิปจะพาเตรียมตัวกับคำถามสัมภาษณ์ยอดฮิตที่เด็กยื่นรอบพอร์ตมักเจอ เช่น แนะนำตัวเอง ทำไมอยากเข้าคณะนี้ ทำไมต้องเลือกเรา จุดแข็ง-จุดอ่อนคืออะไร และถ้าเจอคำถามที่ตอบไม่ได้ควรทำยังไง",
    youtubeUrl: "https://www.youtube.com/watch?v=5KYiIkONtn8&list=PLcwZ3uF2IxQXdV4IHNnKADRfEmAI1zpzy&index=3",
  },
]
