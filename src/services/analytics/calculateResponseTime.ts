import { QuestionAttempt, TimeManagementStats } from '../../types'

const SEGMENTS: { label: string; from: number; to: number }[] = [
  { label: '1~15번', from: 1, to: 15 },
  { label: '16~30번', from: 16, to: 30 },
  { label: '31~45번', from: 31, to: 45 },
]

/** 문항 구간별 평균 풀이시간 + 후반부로 갈수록 느려지는지(섹션 13). */
export function calculateResponseTime(attempts: QuestionAttempt[]): TimeManagementStats {
  const segments = SEGMENTS.map((seg) => {
    const inRange = attempts.filter((a) => a.questionPosition >= seg.from && a.questionPosition <= seg.to)
    const avgSeconds = inRange.length ? Math.round(inRange.reduce((s, a) => s + a.responseTimeSeconds, 0) / inRange.length) : 0
    return { label: seg.label, avgSeconds }
  }).filter((s) => s.avgSeconds > 0)

  const slowingDown = segments.length >= 2 && segments[segments.length - 1].avgSeconds > segments[0].avgSeconds * 1.2

  return { segments, slowingDown }
}
