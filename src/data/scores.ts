import type { Faculty, YearlyScore } from "@/types/tcas"

/**
 * ข้อมูลคณะและคะแนน TCAS ย้อนหลัง 5 ปี (2563–2567)
 *
 * ⚠️ ข้อมูลจำลองเพื่อการสาธิตเท่านั้น
 * ไม่ใช่ข้อมูลทางการจาก ทปอ. หรือมหาวิทยาลัย
 * คะแนนอ้างอิงจากสัดส่วนรวม 0–100 คะแนน
 */

interface FacultyData extends Faculty {
  scores: YearlyScore[]
}

export const facultyScores: FacultyData[] = [
  // ─────────────────────────────────────────────────────────
  // จุฬาลงกรณ์มหาวิทยาลัย (CU)
  // ─────────────────────────────────────────────────────────
  {
    id: "cu-medicine",
    universityId: "cu",
    name: "คณะแพทยศาสตร์",
    program: "หลักสูตรแพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 90.5, avgScore: 93.2, seats: 275 },
      { year: 2564, minScore: 91.2, avgScore: 93.8, seats: 275 },
      { year: 2565, minScore: 90.8, avgScore: 93.5, seats: 280 },
      { year: 2566, minScore: 91.5, avgScore: 94.1, seats: 280 },
      { year: 2567, minScore: 92.0, avgScore: 94.5, seats: 285 },
    ],
  },
  {
    id: "cu-engineering",
    universityId: "cu",
    name: "คณะวิศวกรรมศาสตร์",
    program: "สาขาวิชาวิศวกรรมคอมพิวเตอร์",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 78.5, avgScore: 82.3, seats: 120 },
      { year: 2564, minScore: 79.2, avgScore: 83.0, seats: 120 },
      { year: 2565, minScore: 80.1, avgScore: 83.8, seats: 125 },
      { year: 2566, minScore: 81.0, avgScore: 84.5, seats: 125 },
      { year: 2567, minScore: 81.8, avgScore: 85.2, seats: 130 },
    ],
  },
  {
    id: "cu-law",
    universityId: "cu",
    name: "คณะนิติศาสตร์",
    program: "หลักสูตรนิติศาสตรบัณฑิต",
    field: "law",
    scores: [
      { year: 2563, minScore: 72.0, avgScore: 76.5, seats: 200 },
      { year: 2564, minScore: 72.8, avgScore: 77.0, seats: 200 },
      { year: 2565, minScore: 73.5, avgScore: 77.8, seats: 205 },
      { year: 2566, minScore: 74.2, avgScore: 78.5, seats: 205 },
      { year: 2567, minScore: 75.0, avgScore: 79.2, seats: 210 },
    ],
  },
  {
    id: "cu-accounting",
    universityId: "cu",
    name: "คณะพาณิชยศาสตร์และการบัญชี",
    program: "สาขาวิชาการบัญชี",
    field: "accounting",
    scores: [
      { year: 2563, minScore: 76.5, avgScore: 80.2, seats: 150 },
      { year: 2564, minScore: 77.0, avgScore: 80.8, seats: 150 },
      { year: 2565, minScore: 77.8, avgScore: 81.5, seats: 155 },
      { year: 2566, minScore: 78.5, avgScore: 82.0, seats: 155 },
      { year: 2567, minScore: 79.2, avgScore: 82.8, seats: 160 },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // มหาวิทยาลัยธรรมศาสตร์ (TU)
  // ─────────────────────────────────────────────────────────
  {
    id: "tu-law",
    universityId: "tu",
    name: "คณะนิติศาสตร์",
    program: "หลักสูตรนิติศาสตรบัณฑิต",
    field: "law",
    scores: [
      { year: 2563, minScore: 68.5, avgScore: 73.0, seats: 350 },
      { year: 2564, minScore: 69.2, avgScore: 73.8, seats: 350 },
      { year: 2565, minScore: 70.0, avgScore: 74.5, seats: 360 },
      { year: 2566, minScore: 70.8, avgScore: 75.2, seats: 360 },
      { year: 2567, minScore: 71.5, avgScore: 76.0, seats: 370 },
    ],
  },
  {
    id: "tu-economics",
    universityId: "tu",
    name: "คณะเศรษฐศาสตร์",
    program: "หลักสูตรเศรษฐศาสตรบัณฑิต",
    field: "economics",
    scores: [
      { year: 2563, minScore: 65.0, avgScore: 70.2, seats: 250 },
      { year: 2564, minScore: 65.8, avgScore: 71.0, seats: 250 },
      { year: 2565, minScore: 66.5, avgScore: 71.8, seats: 255 },
      { year: 2566, minScore: 67.2, avgScore: 72.5, seats: 255 },
      { year: 2567, minScore: 68.0, avgScore: 73.2, seats: 260 },
    ],
  },
  {
    id: "tu-engineering",
    universityId: "tu",
    name: "คณะวิศวกรรมศาสตร์",
    program: "สาขาวิชาวิศวกรรมไฟฟ้า",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 70.5, avgScore: 75.0, seats: 180 },
      { year: 2564, minScore: 71.2, avgScore: 75.8, seats: 180 },
      { year: 2565, minScore: 72.0, avgScore: 76.5, seats: 185 },
      { year: 2566, minScore: 72.8, avgScore: 77.2, seats: 185 },
      { year: 2567, minScore: 73.5, avgScore: 78.0, seats: 190 },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // มหาวิทยาลัยมหิดล (MU)
  // ─────────────────────────────────────────────────────────
  {
    id: "mu-medicine",
    universityId: "mu",
    name: "คณะแพทยศาสตร์ศิริราชพยาบาล",
    program: "หลักสูตรแพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 89.0, avgScore: 92.5, seats: 330 },
      { year: 2564, minScore: 89.8, avgScore: 93.0, seats: 330 },
      { year: 2565, minScore: 90.5, avgScore: 93.5, seats: 335 },
      { year: 2566, minScore: 91.0, avgScore: 94.0, seats: 335 },
      { year: 2567, minScore: 91.5, avgScore: 94.2, seats: 340 },
    ],
  },
  {
    id: "mu-pharmacy",
    universityId: "mu",
    name: "คณะเภสัชศาสตร์",
    program: "หลักสูตรเภสัชศาสตรบัณฑิต",
    field: "pharmacy",
    scores: [
      { year: 2563, minScore: 72.0, avgScore: 76.8, seats: 220 },
      { year: 2564, minScore: 72.8, avgScore: 77.5, seats: 220 },
      { year: 2565, minScore: 73.5, avgScore: 78.2, seats: 225 },
      { year: 2566, minScore: 74.2, avgScore: 79.0, seats: 225 },
      { year: 2567, minScore: 75.0, avgScore: 79.8, seats: 230 },
    ],
  },
  {
    id: "mu-nursing",
    universityId: "mu",
    name: "คณะพยาบาลศาสตร์",
    program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
    field: "nursing",
    scores: [
      { year: 2563, minScore: 60.5, avgScore: 65.2, seats: 200 },
      { year: 2564, minScore: 61.0, avgScore: 65.8, seats: 200 },
      { year: 2565, minScore: 61.8, avgScore: 66.5, seats: 205 },
      { year: 2566, minScore: 62.5, avgScore: 67.2, seats: 205 },
      { year: 2567, minScore: 63.0, avgScore: 68.0, seats: 210 },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // มหาวิทยาลัยเกษตรศาสตร์ (KU)
  // ─────────────────────────────────────────────────────────
  {
    id: "ku-engineering",
    universityId: "ku",
    name: "คณะวิศวกรรมศาสตร์",
    program: "สาขาวิชาวิศวกรรมซอฟต์แวร์และความรู้",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 65.0, avgScore: 70.0, seats: 100 },
      { year: 2564, minScore: 65.8, avgScore: 70.8, seats: 100 },
      { year: 2565, minScore: 66.5, avgScore: 71.5, seats: 105 },
      { year: 2566, minScore: 67.2, avgScore: 72.2, seats: 105 },
      { year: 2567, minScore: 68.0, avgScore: 73.0, seats: 110 },
    ],
  },
  {
    id: "ku-science",
    universityId: "ku",
    name: "คณะวิทยาศาสตร์",
    program: "สาขาวิชาวิทยาการคอมพิวเตอร์",
    field: "science",
    scores: [
      { year: 2563, minScore: 58.5, avgScore: 63.5, seats: 120 },
      { year: 2564, minScore: 59.2, avgScore: 64.2, seats: 120 },
      { year: 2565, minScore: 60.0, avgScore: 65.0, seats: 125 },
      { year: 2566, minScore: 60.8, avgScore: 65.8, seats: 125 },
      { year: 2567, minScore: 61.5, avgScore: 66.5, seats: 130 },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // มหาวิทยาลัยเชียงใหม่ (CMU)
  // ─────────────────────────────────────────────────────────
  {
    id: "cmu-medicine",
    universityId: "cmu",
    name: "คณะแพทยศาสตร์",
    program: "หลักสูตรแพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 86.5, avgScore: 90.0, seats: 240 },
      { year: 2564, minScore: 87.0, avgScore: 90.5, seats: 240 },
      { year: 2565, minScore: 87.8, avgScore: 91.2, seats: 245 },
      { year: 2566, minScore: 88.5, avgScore: 91.8, seats: 245 },
      { year: 2567, minScore: 89.0, avgScore: 92.5, seats: 250 },
    ],
  },
  {
    id: "cmu-engineering",
    universityId: "cmu",
    name: "คณะวิศวกรรมศาสตร์",
    program: "สาขาวิชาวิศวกรรมคอมพิวเตอร์",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 63.0, avgScore: 68.0, seats: 150 },
      { year: 2564, minScore: 63.8, avgScore: 68.8, seats: 150 },
      { year: 2565, minScore: 64.5, avgScore: 69.5, seats: 155 },
      { year: 2566, minScore: 65.2, avgScore: 70.2, seats: 155 },
      { year: 2567, minScore: 66.0, avgScore: 71.0, seats: 160 },
    ],
  },
  {
    id: "cmu-architecture",
    universityId: "cmu",
    name: "คณะสถาปัตยกรรมศาสตร์",
    program: "หลักสูตรสถาปัตยกรรมศาสตรบัณฑิต",
    field: "architecture",
    scores: [
      { year: 2563, minScore: 62.0, avgScore: 67.5, seats: 80 },
      { year: 2564, minScore: 62.8, avgScore: 68.2, seats: 80 },
      { year: 2565, minScore: 63.5, avgScore: 69.0, seats: 85 },
      { year: 2566, minScore: 64.2, avgScore: 69.8, seats: 85 },
      { year: 2567, minScore: 65.0, avgScore: 70.5, seats: 90 },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // มหาวิทยาลัยขอนแก่น (KKU)
  // ─────────────────────────────────────────────────────────
  {
    id: "kku-medicine",
    universityId: "kku",
    name: "คณะแพทยศาสตร์",
    program: "หลักสูตรแพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 83.0, avgScore: 87.5, seats: 240 },
      { year: 2564, minScore: 83.8, avgScore: 88.0, seats: 240 },
      { year: 2565, minScore: 84.5, avgScore: 88.8, seats: 245 },
      { year: 2566, minScore: 85.2, avgScore: 89.5, seats: 245 },
      { year: 2567, minScore: 86.0, avgScore: 90.2, seats: 250 },
    ],
  },
  {
    id: "kku-engineering",
    universityId: "kku",
    name: "คณะวิศวกรรมศาสตร์",
    program: "สาขาวิชาวิศวกรรมคอมพิวเตอร์",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 58.0, avgScore: 63.5, seats: 130 },
      { year: 2564, minScore: 58.8, avgScore: 64.2, seats: 130 },
      { year: 2565, minScore: 59.5, avgScore: 65.0, seats: 135 },
      { year: 2566, minScore: 60.2, avgScore: 65.8, seats: 135 },
      { year: 2567, minScore: 61.0, avgScore: 66.5, seats: 140 },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // มหาวิทยาลัยสงขลานครินทร์ (PSU)
  // ─────────────────────────────────────────────────────────
  {
    id: "psu-medicine",
    universityId: "psu",
    name: "คณะแพทยศาสตร์",
    program: "หลักสูตรแพทยศาสตรบัณฑิต",
    field: "medicine",
    scores: [
      { year: 2563, minScore: 80.5, avgScore: 85.0, seats: 200 },
      { year: 2564, minScore: 81.2, avgScore: 85.8, seats: 200 },
      { year: 2565, minScore: 82.0, avgScore: 86.5, seats: 205 },
      { year: 2566, minScore: 82.8, avgScore: 87.2, seats: 205 },
      { year: 2567, minScore: 83.5, avgScore: 88.0, seats: 210 },
    ],
  },
  {
    id: "psu-ict",
    universityId: "psu",
    name: "คณะเทคโนโลยีและสิ่งแวดล้อม",
    program: "สาขาวิชาเทคโนโลยีสารสนเทศ",
    field: "ict",
    scores: [
      { year: 2563, minScore: 52.0, avgScore: 57.5, seats: 100 },
      { year: 2564, minScore: 52.8, avgScore: 58.2, seats: 100 },
      { year: 2565, minScore: 53.5, avgScore: 59.0, seats: 105 },
      { year: 2566, minScore: 54.2, avgScore: 59.8, seats: 105 },
      { year: 2567, minScore: 55.0, avgScore: 60.5, seats: 110 },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // สจล. (KMITL)
  // ─────────────────────────────────────────────────────────
  {
    id: "kmitl-engineering",
    universityId: "kmitl",
    name: "คณะวิศวกรรมศาสตร์",
    program: "สาขาวิชาวิศวกรรมคอมพิวเตอร์",
    field: "engineering",
    scores: [
      { year: 2563, minScore: 60.0, avgScore: 65.5, seats: 140 },
      { year: 2564, minScore: 60.8, avgScore: 66.2, seats: 140 },
      { year: 2565, minScore: 61.5, avgScore: 67.0, seats: 145 },
      { year: 2566, minScore: 62.2, avgScore: 67.8, seats: 145 },
      { year: 2567, minScore: 63.0, avgScore: 68.5, seats: 150 },
    ],
  },
  {
    id: "kmitl-ict",
    universityId: "kmitl",
    name: "คณะเทคโนโลยีสารสนเทศ",
    program: "สาขาวิชาเทคโนโลยีสารสนเทศ",
    field: "ict",
    scores: [
      { year: 2563, minScore: 55.5, avgScore: 61.0, seats: 120 },
      { year: 2564, minScore: 56.2, avgScore: 61.8, seats: 120 },
      { year: 2565, minScore: 57.0, avgScore: 62.5, seats: 125 },
      { year: 2566, minScore: 57.8, avgScore: 63.2, seats: 125 },
      { year: 2567, minScore: 58.5, avgScore: 64.0, seats: 130 },
    ],
  },
]

export function getFacultyById(id: string): FacultyData | undefined {
  return facultyScores.find((f) => f.id === id)
}

export function getFacultiesByUniversity(universityId: string): FacultyData[] {
  return facultyScores.filter((f) => f.universityId === universityId)
}

export function getFacultiesByField(field: FacultyData["field"]): FacultyData[] {
  return facultyScores.filter((f) => f.field === field)
}
