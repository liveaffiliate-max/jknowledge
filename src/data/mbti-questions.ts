/**
 * src/data/mbti-questions.ts
 *
 * Re-exports the active question pool for the quiz UI.
 *
 * v2 (current) — single-statement format, see `./mbti-statements.ts`
 *   • 28 items, 7 per dim (4 standard + 3 reverse)
 *   • Reverse ratio: 43% (up from 29% to disrupt pattern answering)
 *   • UI: one statement + 5-point agree Likert
 *
 * Keep this thin module: the quiz, scoring engine and seed script all import
 * `mbtiQuestions` from here, so swapping pools is a single-file change.
 */
export { mbtiStatements as mbtiQuestions } from "./mbti-statements"
