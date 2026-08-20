import { Question, QuestionAttempt, PositionAccuracy } from '../../types'
import { joinAttempts, confidenceFor } from './shared'

/**
 * 문항 위치별 정답률 + 해당 위치에 반복 출제된 문항들의 공통 태그(섹션 9: "29번 자체가 아니라
 * 후반부 고난도 문학 보기 적용 문제에서 오답 집중").
 */
export function calculatePositionAccuracy(attempts: QuestionAttempt[], questions: Question[]): PositionAccuracy[] {
  const joined = joinAttempts(attempts, questions)
  const buckets: Record<
    number,
    { total: number; correct: number; majorAreas: Record<string, number>; minorAreas: Record<string, number>; difficulties: Record<string, number> }
  > = {}

  joined.forEach(({ attempt, question }) => {
    const pos = attempt.questionPosition
    if (!buckets[pos]) buckets[pos] = { total: 0, correct: 0, majorAreas: {}, minorAreas: {}, difficulties: {} }
    const b = buckets[pos]
    b.total++
    if (attempt.isCorrect) b.correct++
    if (question.majorArea) b.majorAreas[question.majorArea] = (b.majorAreas[question.majorArea] ?? 0) + 1
    if (question.minorArea) b.minorAreas[question.minorArea] = (b.minorAreas[question.minorArea] ?? 0) + 1
    b.difficulties[question.difficulty] = (b.difficulties[question.difficulty] ?? 0) + 1
  })

  const top = (rec: Record<string, number>): string | undefined => Object.entries(rec).sort((a, b) => b[1] - a[1])[0]?.[0]

  return Object.entries(buckets)
    .map(([posStr, d]) => {
      const position = Number(posStr)
      return {
        key: posStr,
        label: `${position}번`,
        position,
        total: d.total,
        correct: d.correct,
        accuracy: Math.round((d.correct / d.total) * 100),
        sampleSize: d.total,
        confidence: confidenceFor(d.total),
        commonTags: { majorArea: top(d.majorAreas), minorArea: top(d.minorAreas), difficulty: top(d.difficulties) },
      }
    })
    .sort((a, b) => a.accuracy - b.accuracy)
}
