import { Question, QuestionAttempt, AIInsight } from '../../types'
import { calculateAreaAccuracy } from './calculateAreaAccuracy'
import { calculateConceptAccuracy } from './calculateConceptAccuracy'
import { calculateQuestionTypeAccuracy } from './calculateQuestionTypeAccuracy'
import { joinAttempts } from './shared'

/**
 * 섹션 8/28 흐름을 조립: "OO영역에서 N점 손실 → 특히 OO에서 → 전부 OO유형 → 평균 M분 소요 → 다음 시험 구성".
 * 표본이 너무 적으면(전체 10문제 미만) null.
 */
export function generateAIInsight(attempts: QuestionAttempt[], questions: Question[]): AIInsight | null {
  if (attempts.length < 10) return null

  const areas = calculateAreaAccuracy(attempts, questions).filter((a) => a.sampleSize >= 5)
  if (areas.length === 0) return null
  const weakestArea = areas[0]

  const middles = calculateConceptAccuracy(attempts, questions, weakestArea.key).filter((m) => m.sampleSize >= 5)
  const weakestMiddle = middles[0]

  const types = weakestMiddle
    ? calculateQuestionTypeAccuracy(attempts, questions, { majorArea: weakestArea.key, middleArea: weakestMiddle.key }).filter((t) => t.sampleSize >= 3)
    : []
  const weakestType = types[0]

  const joined = joinAttempts(attempts, questions)
  const relevant = joined.filter(
    (j) =>
      j.question.majorArea === weakestArea.key &&
      (!weakestMiddle || j.question.middleArea === weakestMiddle.key) &&
      (!weakestType || j.question.minorArea === weakestType.key)
  )
  const avgTime = relevant.length ? Math.round(relevant.reduce((s, j) => s + j.attempt.responseTimeSeconds, 0) / relevant.length) : 0

  const chain: string[] = [`${weakestArea.label}에서 정답률이 ${weakestArea.accuracy}%로 가장 낮습니다.`]
  if (weakestMiddle) chain.push(`특히 ${weakestMiddle.label}에서 정답률 ${weakestMiddle.accuracy}%로 어려움을 겪고 있습니다.`)
  if (weakestType) chain.push(`${weakestMiddle?.label ?? ''} 문제 중에서도 ${weakestType.label} 유형의 정답률이 ${weakestType.accuracy}%로 특히 낮습니다.`)
  if (avgTime > 0) {
    const label = weakestType?.label ?? weakestMiddle?.label ?? weakestArea.label
    chain.push(`${label} 유형의 평균 풀이시간은 ${Math.floor(avgTime / 60)}분 ${avgTime % 60}초로 다른 문제보다 오래 걸리고 있습니다.`)
  }
  chain.push(`따라서 다음 시험에서는 ${weakestMiddle?.label ?? weakestArea.label}${weakestType ? ` · ${weakestType.label}` : ''} 문제를 집중적으로 구성합니다.`)

  return { headline: `${weakestArea.label}에서 정답률 손실이 가장 큽니다`, chain }
}
