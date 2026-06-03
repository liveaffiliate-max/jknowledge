/**
 * export-tcas69.ts
 * Export TCAS69 data to CSV:
 *   - tcas69-weights.csv  : FacultyRequirement (subject weights + estMinScore)
 *   - tcas68-scores.csv   : TcasScore ปี 2568 (ly-programs reference scores)
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { createWriteStream, mkdirSync } from "fs"
import path from "path"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// All subject columns (ordered)
const SUBJECT_COLS = [
  "tgat", "tgat1", "tgat2", "tgat3",
  "tpat1", "tpat11", "tpat12", "tpat13",
  "tpat2", "tpat21", "tpat22", "tpat23",
  "tpat3", "tpat4", "tpat5",
  "a_lv_61", "a_lv_62", "a_lv_63",
  "a_lv_64", "a_lv_65", "a_lv_66", "a_lv_70",
  "a_lv_81", "a_lv_82",
  "a_lv_83", "a_lv_84", "a_lv_85",
  "a_lv_86", "a_lv_87", "a_lv_88", "a_lv_89",
]

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ""
  const s = String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function row(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCsv).join(",") + "\n"
}

// ── 1. Export weights ──────────────────────────────────────────────────────────

async function exportWeights(outPath: string) {
  console.log("📊 Exporting weights...")

  const records = await prisma.facultyRequirement.findMany({
    include: {
      faculty: {
        include: { university: true },
      },
    },
    orderBy: [
      { faculty: { university: { name: "asc" } } },
      { faculty: { name: "asc" } },
    ],
  })

  const stream = createWriteStream(outPath, { encoding: "utf8" })

  // Header
  const header = [
    "programCode",
    "university",
    "facultyName",
    "program",
    "majorName",
    "detail",
    "weightsYear",
    "estMinScore",
    ...SUBJECT_COLS,
  ]
  stream.write("﻿") // UTF-8 BOM for Excel
  stream.write(row(header))

  let count = 0
  for (const req of records) {
    const f = req.faculty
    const weights = (req.weights ?? {}) as Record<string, number>

    const cells = [
      f.programCode ?? "",
      f.university.name,
      f.name,
      f.program,
      f.majorName ?? "",
      f.detail ?? "",
      req.year ?? "",
      req.estMinScore ?? "",
      ...SUBJECT_COLS.map((col) => weights[col] ?? ""),
    ]
    stream.write(row(cells))
    count++
  }

  stream.end()
  await new Promise((resolve) => stream.on("finish", resolve))
  console.log(`   ✅ ${count} records → ${path.basename(outPath)}`)
}

// ── 2. Export TcasScore ───────────────────────────────────────────────────────

async function exportScores(outPath: string, year: number) {
  console.log(`📊 Exporting TcasScore ปี ${year}...`)

  const scores = await prisma.tcasScore.findMany({
    where: { year },
    include: {
      faculty: {
        include: { university: true },
      },
    },
    orderBy: [
      { faculty: { university: { name: "asc" } } },
      { faculty: { name: "asc" } },
    ],
  })

  const stream = createWriteStream(outPath, { encoding: "utf8" })

  const header = [
    "programCode",
    "university",
    "facultyName",
    "program",
    "majorName",
    "detail",
    "year",
    "round",
    "minScore",
    "avgScore",
    "maxScore",
    "seats",
  ]
  stream.write("﻿") // UTF-8 BOM
  stream.write(row(header))

  let count = 0
  for (const s of scores) {
    const f = s.faculty
    const cells = [
      s.programCode ?? f.programCode ?? "",
      f.university.name,
      f.name,
      f.program,
      f.majorName ?? "",
      f.detail ?? "",
      s.year,
      s.round,
      s.minScore,
      s.avgScore ?? "",
      s.maxScore ?? "",
      s.seats ?? "",
    ]
    stream.write(row(cells))
    count++
  }

  stream.end()
  await new Promise((resolve) => stream.on("finish", resolve))
  console.log(`   ✅ ${count} records → ${path.basename(outPath)}`)
}

// ── 3. Export subject reference ───────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  tgat:    "TGAT รวม",
  tgat1:   "TGAT1 การสื่อสารภาษาอังกฤษ",
  tgat2:   "TGAT2 การคิดอย่างมีเหตุผล",
  tgat3:   "TGAT3 สมรรถนะการทำงาน",
  tpat1:   "TPAT1 ความถนัดแพทย์",
  tpat11:  "TPAT11 เชาว์ปัญญา",
  tpat12:  "TPAT12 จริยธรรมทางการแพทย์",
  tpat13:  "TPAT13 ทักษะการเชื่อมโยง",
  tpat2:   "TPAT2 ความถนัดศิลปกรรมศาสตร์",
  tpat21:  "TPAT21 ทัศนศิลป์",
  tpat22:  "TPAT22 ดนตรี",
  tpat23:  "TPAT23 นาฏศิลป์",
  tpat3:   "TPAT3 ความถนัดวิทย์/เทคโนโลยี/วิศวะ",
  tpat4:   "TPAT4 ความถนัดสถาปัตยกรรมศาสตร์",
  tpat5:   "TPAT5 ความถนัดครุศาสตร์/ศึกษาศาสตร์",
  a_lv_61: "A-Level คณิตศาสตร์ประยุกต์ 1",
  a_lv_62: "A-Level คณิตศาสตร์ประยุกต์ 2",
  a_lv_63: "A-Level วิทยาศาสตร์ประยุกต์",
  a_lv_64: "A-Level ฟิสิกส์",
  a_lv_65: "A-Level เคมี",
  a_lv_66: "A-Level ชีววิทยา",
  a_lv_70: "A-Level สังคมศาสตร์",
  a_lv_81: "A-Level ภาษาไทย",
  a_lv_82: "A-Level ภาษาอังกฤษ",
  a_lv_83: "A-Level ภาษาฝรั่งเศส",
  a_lv_84: "A-Level ภาษาเยอรมัน",
  a_lv_85: "A-Level ภาษาญี่ปุ่น",
  a_lv_86: "A-Level ภาษาเกาหลี",
  a_lv_87: "A-Level ภาษาจีน",
  a_lv_88: "A-Level ภาษาบาลี",
  a_lv_89: "A-Level ภาษาสเปน",
}

const SUBJECT_GROUP: Record<string, string> = {
  tgat: "TGAT", tgat1: "TGAT", tgat2: "TGAT", tgat3: "TGAT",
  tpat1: "TPAT", tpat11: "TPAT", tpat12: "TPAT", tpat13: "TPAT",
  tpat2: "TPAT", tpat21: "TPAT", tpat22: "TPAT", tpat23: "TPAT",
  tpat3: "TPAT", tpat4: "TPAT", tpat5: "TPAT",
}

function exportSubjectRef(outPath: string) {
  const stream = createWriteStream(outPath, { encoding: "utf8" })
  stream.write("﻿")
  stream.write(row(["code", "ชื่อวิชา", "กลุ่ม", "หมายเหตุ"]))

  for (const code of SUBJECT_COLS) {
    const label = SUBJECT_LABELS[code] ?? code
    const group = SUBJECT_GROUP[code] ?? "A-Level"
    let note = ""
    if (code === "tgat") note = "คะแนนรวม TGAT ทั้ง 3 part"
    else if (code.startsWith("tpat1") && code.length > 5) note = "sub-score ของ TPAT1"
    else if (code.startsWith("tpat2") && code.length > 5) note = "sub-score ของ TPAT2"
    else if (["a_lv_83","a_lv_84","a_lv_85","a_lv_86","a_lv_87","a_lv_88","a_lv_89"].includes(code))
      note = "ภาษาต่างประเทศที่ 3 (เลือก 1 วิชา)"
    stream.write(row([code, label, group, note]))
  }

  stream.end()
  console.log(`   ✅ ${SUBJECT_COLS.length} subjects → ${path.basename(outPath)}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const exportDir = path.join(process.cwd(), "src", "data", "exports")
  mkdirSync(exportDir, { recursive: true })

  await exportWeights(path.join(exportDir, "tcas69-weights.csv"))
  await exportScores(path.join(exportDir, "tcas68-scores.csv"), 2568)
  exportSubjectRef(path.join(exportDir, "subject-reference.csv"))

  console.log(`\n✅ Export เสร็จสมบูรณ์!`)
  console.log(`   📁 src/data/exports/`)
  console.log(`      tcas69-weights.csv    — weights สำหรับ TCAS69`)
  console.log(`      tcas68-scores.csv     — คะแนนจริง TCAS68`)
  console.log(`      subject-reference.csv — รายชื่อวิชาและ code ทั้งหมด`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
