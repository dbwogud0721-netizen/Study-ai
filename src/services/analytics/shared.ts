import { Question, QuestionAttempt, AccuracyBucket, ConfidenceLevel } from '../../types'

/** 표본 크기 기준 신뢰도(섹션 20): <5 부족, 5~9 가능성, 10+ 반복적 */
export function confidenceFor(sampleSize: number): ConfidenceLevel {
  if (sampleSize < 5) return 'low'
  if (sampleSize < 10) return 'medium'
  return 'high'
}

export interface JoinedAttempt {
  attempt: QuestionAttempt
  question: Question
}

export function joinAttempts(attempts: QuestionAttempt[], questions: Question[]): JoinedAttempt[] {
  const qMap = new Map(questions.map((q) => [q.questionId, q]))
  const result: JoinedAttempt[] = []
  attempts.forEach((attempt) => {
    const question = qMap.get(attempt.questionId)
    if (question) result.push({ attempt, question })
  })
  return result
}

/** 과목 비특정 그룹핑 헬퍼. calculateAreaAccuracy/ConceptAccuracy/QuestionTypeAccuracy가 공유한다. */
export function groupAccuracy(joined: JoinedAttempt[], keyFn: (j: JoinedAttempt) => string | undefined): AccuracyBucket[] {
  const buckets: Record<string, { total: number; correct: number }> = {}
  joined.forEach((j) => {
    const key = keyFn(j)
    if (!key) return
    if (!buckets[key]) buckets[key] = { total: 0, correct: 0 }
    buckets[key].total++
    if (j.attempt.isCorrect) buckets[key].correct++
  })
  return Object.entries(buckets)
    .map(([key, d]) => ({
      key,
      label: key,
      total: d.total,
      correct: d.correct,
      accuracy: Math.round((d.correct / d.total) * 100),
      sampleSize: d.total,
      confidence: confidenceFor(d.total),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
}
