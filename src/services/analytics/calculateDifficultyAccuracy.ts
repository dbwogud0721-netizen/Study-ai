import { Question, QuestionAttempt, DifficultyAccuracy, Difficulty } from '../../types'
import { joinAttempts, groupAccuracy } from './shared'

const ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'veryHard']
const LABELS: Record<Difficulty, string> = { easy: '쉬움', medium: '보통', hard: '어려움', veryHard: '최상' }

/** 난이도별 정답률. 쉬움→최상 순 고정 정렬(정답률 순이 아님). */
export function calculateDifficultyAccuracy(
  attempts: QuestionAttempt[],
  questions: Question[],
  filter?: { majorArea?: string }
): DifficultyAccuracy[] {
  const joined = joinAttempts(attempts, questions).filter((j) => !filter?.majorArea || j.question.majorArea === filter.majorArea)
  const grouped = groupAccuracy(joined, (j) => j.question.difficulty)
  return ORDER.map((d) => grouped.find((g) => g.key === d))
    .filter((g): g is (typeof grouped)[number] => !!g)
    .map((g) => ({ ...g, label: LABELS[g.key as Difficulty] }))
}
