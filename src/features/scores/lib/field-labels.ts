import type { FacultyField } from "@/types/tcas"

export const FIELD_LABELS: Record<FacultyField, string> = {
  medicine:          "แพทยศาสตร์",
  engineering:       "วิศวกรรมศาสตร์",
  law:               "นิติศาสตร์",
  accounting:        "บัญชี",
  nursing:           "พยาบาลศาสตร์",
  economics:         "เศรษฐศาสตร์",
  liberal_arts:      "ศิลปศาสตร์",
  science:           "วิทยาศาสตร์",
  political_science: "รัฐศาสตร์",
  architecture:      "สถาปัตยกรรมศาสตร์",
  dentistry:         "ทันตแพทยศาสตร์",
  pharmacy:          "เภสัชศาสตร์",
  ict:               "เทคโนโลยีสารสนเทศ",
  business:          "บริหารธุรกิจ",
  other:             "อื่นๆ",
}

export const FIELD_COLORS: Record<FacultyField, string> = {
  medicine:          "bg-red-50 text-red-700 border-red-200",
  engineering:       "bg-blue-50 text-blue-700 border-blue-200",
  law:               "bg-purple-50 text-purple-700 border-purple-200",
  accounting:        "bg-orange-50 text-orange-700 border-orange-200",
  nursing:           "bg-pink-50 text-pink-700 border-pink-200",
  economics:         "bg-yellow-50 text-yellow-700 border-yellow-200",
  liberal_arts:      "bg-teal-50 text-teal-700 border-teal-200",
  science:           "bg-cyan-50 text-cyan-700 border-cyan-200",
  political_science: "bg-indigo-50 text-indigo-700 border-indigo-200",
  architecture:      "bg-rose-50 text-rose-700 border-rose-200",
  dentistry:         "bg-red-50 text-red-700 border-red-200",
  pharmacy:          "bg-green-50 text-green-700 border-green-200",
  ict:               "bg-violet-50 text-violet-700 border-violet-200",
  business:          "bg-amber-50 text-amber-700 border-amber-200",
  other:             "bg-gray-50 text-gray-600 border-gray-200",
}
