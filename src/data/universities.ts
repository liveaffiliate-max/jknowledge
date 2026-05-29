import type { University } from "@/types/tcas"

/**
 * ข้อมูลมหาวิทยาลัย — legacy mock data (ไม่ได้ใช้งานใน production)
 * ข้อมูลจริงมาจาก DB ผ่าน getUniversities()
 */
export const universities: University[] = [
  {
    id: "cu",
    slug: "cu",
    name: "จุฬาลงกรณ์มหาวิทยาลัย",
    shortName: "จุฬาฯ",
    location: "กรุงเทพฯ",
    color: "#9d174d",
  },
  {
    id: "tu",
    slug: "tu",
    name: "มหาวิทยาลัยธรรมศาสตร์",
    shortName: "มธ.",
    location: "กรุงเทพฯ / ปทุมธานี",
    color: "#dc2626",
  },
  {
    id: "mu",
    slug: "mu",
    name: "มหาวิทยาลัยมหิดล",
    shortName: "มหิดล",
    location: "นครปฐม",
    color: "#1d4ed8",
  },
  {
    id: "ku",
    slug: "ku",
    name: "มหาวิทยาลัยเกษตรศาสตร์",
    shortName: "มก.",
    location: "กรุงเทพฯ",
    color: "#15803d",
  },
  {
    id: "cmu",
    slug: "cmu",
    name: "มหาวิทยาลัยเชียงใหม่",
    shortName: "มช.",
    location: "เชียงใหม่",
    color: "#7e22ce",
  },
  {
    id: "kku",
    slug: "kku",
    name: "มหาวิทยาลัยขอนแก่น",
    shortName: "มข.",
    location: "ขอนแก่น",
    color: "#ca8a04",
  },
  {
    id: "psu",
    slug: "psu",
    name: "มหาวิทยาลัยสงขลานครินทร์",
    shortName: "ม.อ.",
    location: "สงขลา",
    color: "#4338ca",
  },
  {
    id: "kmitl",
    slug: "kmitl",
    name: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
    shortName: "สจล.",
    location: "กรุงเทพฯ",
    color: "#ea580c",
  },
]

export function getUniversityById(id: string): University | undefined {
  return universities.find((u) => u.id === id)
}
