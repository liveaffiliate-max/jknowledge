import { cn } from "@/lib/utils"
import { weightsToSubjects, stripALevelPrefix } from "@/lib/subjects"
import type { SubjectGroup, SubjectWeight } from "@/lib/subjects"

const GROUP_CONFIG: Record<
  SubjectGroup,
  { bg: string; text: string; border: string; dot: string }
> = {
  TGAT:      { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100",   dot: "bg-blue-500" },
  TPAT:      { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", dot: "bg-purple-500" },
  "A-Level": { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-100",  dot: "bg-amber-500" },
}

interface Props {
  weights: Record<string, unknown>
  year:    number
}

export function WeightBreakdown({ weights, year }: Props) {
  const subjects = weightsToSubjects(weights)
  if (subjects.length === 0) return null

  const groups = subjects.reduce<Partial<Record<SubjectGroup, SubjectWeight[]>>>(
    (acc, s) => {
      acc[s.group] = [...(acc[s.group] ?? []), s]
      return acc
    },
    {}
  )
  const total = subjects.reduce((s, x) => s + x.weight, 0)

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        เกณฑ์น้ำหนักคะแนนอ้างอิงปี TCAS{year - 2500} · รวม {total}%
      </p>

      {(Object.keys(GROUP_CONFIG) as SubjectGroup[]).map((g) => {
        const list = groups[g]
        if (!list?.length) return null
        const cfg = GROUP_CONFIG[g]
        const groupWeight = list.reduce((s, x) => s + x.weight, 0)
        return (
          <div key={g} className={cn("rounded-xl border overflow-hidden", cfg.border)}>
            <div className={cn("flex items-center gap-2 px-4 py-2", cfg.bg)}>
              <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
              <span className={cn("text-xs font-bold", cfg.text)}>{g}</span>
              <span className={cn("text-xs opacity-60", cfg.text)}>
                · {groupWeight}% ของคะแนนรวม
              </span>
            </div>
            <div className="bg-white">
              {list.map((sub) => (
                <div
                  key={sub.code}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-tight">{sub.label}</p>
                    {sub.bestOf && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        เลือก: {sub.bestOf.labels.map(stripALevelPrefix).join(" / ")}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      cfg.bg,
                      cfg.text
                    )}
                  >
                    {sub.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
