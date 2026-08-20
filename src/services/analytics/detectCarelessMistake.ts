import { Question, QuestionAttempt, WeaknessPattern } from '../../types'
import { joinAttempts, confidenceFor } from './shared'

/** 쉬운 난이도 문제에서 짧은 시간 내 오답이 반복되면 CARELESS_MISTAKE(섹션 11). */
export function detectCarelessMistake(attempts: QuestionAttempt[], questions: Question[]): WeaknessPattern | null {
  const joined = joinAttempts(attempts, questions)
  const careless = joined.filter((j) => !j.attempt.isCorrect && j.question.difficulty === 'easy' && j.attempt.responseTimeSeconds < 40)
  if (careless.length < 3) return null

  return {
    kind: 'CARELESS_MISTAKE',
    label: '실수',
    sampleSize: careless.length,
    confidence: confidenceFor(careless.length),
    detail: `쉬운 난이도 문제에서 짧은 시간 내 오답이 ${careless.length}건 반복되고 있습니다.`,
  }
}
