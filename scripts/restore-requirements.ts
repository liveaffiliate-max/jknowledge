/**
 * Phase 3 — Restore FacultyRequirement after re-import.
 * Matches backed-up records to new Faculty rows by (name, normProgram, normMajor).
 *
 * Usage: npx tsx scripts/restore-requirements.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "fs"
import { join } from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { normalizeMajor, normalizeProgram } from "../src/lib/normalize-faculty"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

interface BackupEntry {
  programCode:  string | null
  facultyName:  string
  program:      string
  majorName:    string | null
  year:         number
  weights:      unknown
  estMinScore:  number | null
}

async function main() {
  const backupPath = join(process.cwd(), "src/data/faculty-requirements-backup.json")
  const backup: BackupEntry[] = JSON.parse(readFileSync(backupPath, "utf-8"))
  console.log(`Loaded ${backup.length} FacultyRequirement records from backup\n`)

  // Load all Faculty into memory for matching
  const faculties = await prisma.faculty.findMany({
    select: { id: true, name: true, program: true, majorName: true, programCode: true },
  })

  // Index 1: programCode → Faculty (exact, fastest)
  const byCode = new Map<string, typeof faculties[number]>()
  for (const f of faculties) {
    if (f.programCode) byCode.set(f.programCode, f)
  }

  // Index 2: (normName, normProgram, normMajor) → Faculty
  const byName = new Map<string, typeof faculties[number]>()
  for (const f of faculties) {
    const key = `${f.name}||${normalizeProgram(f.program)}||${normalizeMajor(f.majorName)}`
    byName.set(key, f)
  }

  let restored = 0
  let skipped  = 0
  let notFound = 0

  for (const entry of backup) {
    // Try match by programCode first
    let faculty = entry.programCode ? byCode.get(entry.programCode) : undefined

    // Fall back to name+program+major match
    if (!faculty) {
      const key = `${entry.facultyName}||${normalizeProgram(entry.program)}||${normalizeMajor(entry.majorName)}`
      faculty = byName.get(key)
    }

    if (!faculty) {
      notFound++
      if (notFound <= 5) {
        console.log(`  NOT FOUND: "${entry.facultyName}" | "${entry.program}" | "${entry.majorName}"`)
      }
      continue
    }

    await prisma.facultyRequirement.upsert({
      where:  { facultyId: faculty.id },
      update: { year: entry.year, weights: entry.weights as never, estMinScore: entry.estMinScore },
      create: { facultyId: faculty.id, year: entry.year, weights: entry.weights as never, estMinScore: entry.estMinScore },
    })
    restored++
  }

  console.log(`\n✅ Restore complete`)
  console.log(`  Restored  : ${restored}`)
  console.log(`  Skipped   : ${skipped} (already exists)`)
  console.log(`  Not found : ${notFound} (Faculty row missing — may need re-import of weights)`)

  await prisma.$disconnect()
}

main().catch(console.error)
