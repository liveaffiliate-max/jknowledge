/**
 * Thai abbreviation / synonym expansion for combobox search.
 *
 * Thai students rarely type formal full names. They search the way they
 * talk: "วิศวะ" not "วิศวกรรมศาสตร์", "หมอ" not "แพทยศาสตร์", "จุฬา" not
 * "จุฬาลงกรณ์มหาวิทยาลัย". A literal substring match on the official
 * name misses all of these.
 *
 * Approach: instead of a fuzzy matcher, we widen the *haystack*. When
 * an item's name matches a known pattern, we append common nicknames
 * to its search string. The combobox's built-in substring match then
 * finds the item whether the user types the official name or the slang.
 *
 * - Lightweight (no fuzzy lib, no Thai NLP)
 * - Predictable (every alias is explicit, no false positives)
 * - One source of truth, easy to extend
 */

interface SynonymRule {
  pattern: RegExp
  alias:   string  // space-separated aliases — combobox does substring match
}

const SYNONYM_RULES: SynonymRule[] = [
  // ── Faculty / field nicknames ────────────────────────────────────────
  { pattern: /วิศวกรรม/u,                      alias: "วิศวะ" },
  { pattern: /แพทยศาสตร์/u,                     alias: "หมอ แพทย์" },
  { pattern: /ทันตแพทย/u,                       alias: "หมอฟัน ทันตะ" },
  { pattern: /สัตวแพทย/u,                       alias: "หมอสัตว์ สัตวะ" },
  { pattern: /เภสัชศาสตร์/u,                    alias: "เภสัช" },
  { pattern: /นิติศาสตร์/u,                     alias: "นิติ กฎหมาย" },
  { pattern: /พยาบาลศาสตร์/u,                   alias: "พยาบาล" },
  { pattern: /การบัญชี|บัญชี/u,                 alias: "บช" },
  { pattern: /บริหารธุรกิจ/u,                    alias: "บริหาร" },
  { pattern: /สถาปัตยกรรม/u,                    alias: "สถาปัตย์ สถาปัตยะ" },
  { pattern: /ครุศาสตร์|ศึกษาศาสตร์/u,           alias: "ครู ครุ" },
  { pattern: /รัฐศาสตร์/u,                      alias: "รัฐ" },
  { pattern: /รัฐประศาสนศาสตร์/u,                alias: "รปศ" },
  { pattern: /เศรษฐศาสตร์/u,                     alias: "เศรษฐ" },
  { pattern: /อักษรศาสตร์/u,                    alias: "อักษร" },
  { pattern: /ศิลปศาสตร์/u,                     alias: "ศิลป์" },
  { pattern: /นิเทศศาสตร์|สื่อสารมวลชน/u,       alias: "นิเทศ" },
  { pattern: /วิทยาศาสตร์/u,                    alias: "วิทย์" },
  { pattern: /วิทยาการคอมพิวเตอร์|คอมพิวเตอร์/u, alias: "คอม" },
  { pattern: /สังคมศาสตร์|สังคมวิทยา/u,         alias: "สังคม" },
  { pattern: /จิตวิทยา/u,                       alias: "จิต" },
  { pattern: /โบราณคดี/u,                       alias: "โบราณ" },

  // ── University official-name aliases ─────────────────────────────────
  // Pattern matches the long official name; alias adds nicknames + shortcodes.
  { pattern: /จุฬาลงกรณ์/u,                       alias: "จุฬา จุฬาฯ CU" },
  { pattern: /มหาวิทยาลัยธรรมศาสตร์/u,             alias: "ธรรมศาสตร์ มธ TU" },
  { pattern: /มหาวิทยาลัยมหิดล/u,                  alias: "มหิดล มม MU" },
  { pattern: /มหาวิทยาลัยเกษตรศาสตร์/u,            alias: "เกษตร มก KU" },
  { pattern: /มหาวิทยาลัยศิลปากร/u,                alias: "ศิลปากร มศก SU" },
  { pattern: /มหาวิทยาลัยศรีนครินทรวิโรฒ/u,         alias: "ประสานมิตร มศว SWU" },
  { pattern: /มหาวิทยาลัยรามคำแหง/u,                alias: "ราม มร RU" },
  { pattern: /มหาวิทยาลัยเชียงใหม่/u,              alias: "เชียงใหม่ มช CMU" },
  { pattern: /มหาวิทยาลัยขอนแก่น/u,                alias: "ขอนแก่น มข KKU" },
  { pattern: /มหาวิทยาลัยสงขลานครินทร์/u,           alias: "สงขลา มอ ม.อ. PSU" },
  { pattern: /มหาวิทยาลัยนเรศวร/u,                  alias: "นเรศวร มน NU" },
  { pattern: /มหาวิทยาลัยบูรพา/u,                   alias: "บูรพา มบ BUU" },
  { pattern: /มหาวิทยาลัยมหาสารคาม/u,               alias: "มหาสารคาม มมส MSU" },
  { pattern: /มหาวิทยาลัยอุบลราชธานี/u,             alias: "อุบล มอบ UBU" },
  { pattern: /มหาวิทยาลัยทักษิณ/u,                  alias: "ทักษิณ มทษ TSU" },
  { pattern: /มหาวิทยาลัยวลัยลักษณ์/u,              alias: "วลัยลักษณ์ มวล WU" },
  { pattern: /มหาวิทยาลัยแม่ฟ้าหลวง/u,              alias: "แม่ฟ้าหลวง มฟล MFU" },
  { pattern: /พระจอมเกล้าธนบุรี/u,                  alias: "บางมด มจธ KMUTT" },
  { pattern: /พระจอมเกล้าพระนครเหนือ/u,             alias: "มจพ KMUTNB" },
  { pattern: /พระจอมเกล้าเจ้าคุณทหารลาดกระบัง/u,    alias: "ลาดกระบัง สจล KMITL" },
  { pattern: /สุรนารี/u,                            alias: "สุรนารี มทส SUT" },
  { pattern: /เทคโนโลยีราชมงคล/u,                   alias: "ราชมงคล มทร RMUT" },
]

/**
 * Append known aliases to text for substring search.
 * Returns the original text unchanged if no patterns match.
 *
 * @example
 *   expandThaiSynonyms("วิศวกรรมศาสตร์")
 *   // → "วิศวกรรมศาสตร์ วิศวะ"
 *
 *   expandThaiSynonyms("จุฬาลงกรณ์มหาวิทยาลัย")
 *   // → "จุฬาลงกรณ์มหาวิทยาลัย จุฬา จุฬาฯ CU"
 */
export function expandThaiSynonyms(text: string): string {
  const aliases: string[] = []
  for (const { pattern, alias } of SYNONYM_RULES) {
    if (pattern.test(text)) aliases.push(alias)
  }
  return aliases.length === 0 ? text : `${text} ${aliases.join(" ")}`
}
