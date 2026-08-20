import { Question, QuestionAttempt, WeaknessPattern, Difficulty } from '../../types'
import { joinAttempts, confidenceFor } from './shared'

const EXPECTED_SECONDS: Record<Difficulty, number> = { easy: 50, medium: 80, hard: 130, veryHard: 170 }

/** 예상 풀이시간보다 훨씬 빠르게 풀고 오답 처리된 경우 RUSHING(섹션 6/11). */
export function detectRushing(attempts: QuestionAttempt[], questions: Question[]): WeaknessPattern | null {
  const joined = joinAttempts(attempts, questions)
  const flagged = joined.filter((j) => !j.attempt.isCorrect && j.attempt.responseTimeSeconds < EXPECTED_SECONDS[j.question.difficulty] * 0.5)
  if (flagged.length < 3) return null

  return {
    kind: 'RUSHING',
    label: '성급한 풀이',
    sampleSize: flagged.length,
    confidence: confidenceFor(flagged.length),
    detail: `평균보다 훨씬 빠르게 풀고 오답으로 이어진 문제가 ${flagged.length}건 있습니다. 문제를 충분히 검토하지 않고 답했을 가능성이 있습니다.`,
  }
}
