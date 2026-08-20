import { QuestionAttempt, WeaknessPattern } from '../../types'
import { calculateResponseTime } from './calculateResponseTime'
import { confidenceFor } from './shared'

/** 시험 후반으로 갈수록 풀이 시간이 늘어나는 경우 TIME_MANAGEMENT(섹션 13). */
export function detectTimeManagementIssue(attempts: QuestionAttempt[]): WeaknessPattern | null {
  const stats = calculateResponseTime(attempts)
  if (!stats.slowingDown || stats.segments.length < 2) return null
  const first = stats.segments[0]
  const last = stats.segments[stats.segments.length - 1]
  return {
    kind: 'TIME_MANAGEMENT',
    label: '시간 관리',
    sampleSize: attempts.length,
    confidence: confidenceFor(attempts.length),
    detail: `${first.label} 평균 ${first.avgSeconds}초 → ${last.label} 평균 ${last.avgSeconds}초로 후반부 풀이 시간이 늘어나고 있습니다.`,
  }
}
