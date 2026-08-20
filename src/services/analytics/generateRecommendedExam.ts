import { Question, QuestionAttempt, ExamBlueprint, BlueprintItem } from '../../types'
import { calculateAreaAccuracy } from './calculateAreaAccuracy'
import { calculateConceptAccuracy } from './calculateConceptAccuracy'

/**
 * 취약 중영역들의 정답률이 낮을수록 문항 배분을 늘린다(섹션 16). weakness_ai 모드에서 사용.
 */
export function generateRecommendedExam(
  attempts: QuestionAttempt[],
  questions: Question[],
  subjectName: string,
  totalQuestions = 15
): ExamBlueprint {
  const areas = calculateAreaAccuracy(attempts, questions).filter((a) => a.sampleSize >= 3)
  const middles = areas
    .flatMap((a) => calculateConceptAccuracy(attempts, questions, a.key).filter((m) => m.sampleSize >= 3))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 4)

  const weights = middles.map((m) => 100 - m.accuracy)
  const sumWeights = weights.reduce((a, b) => a + b, 0) || 1

  let allocated = 0
  const distribution: BlueprintItem[] = middles
    .map((m, i) => {
      const isLast = i === middles.length - 1
      const count = isLast ? totalQuestions - allocated : Math.max(1, Math.round((weights[i] / sumWeights) * totalQuestions))
      allocated += count
      return { label: m.label, count, targetAccuracyBefore: m.accuracy, targetAccuracyAfter: Math.min(95, m.accuracy + 9) }
    })
    .filter((d) => d.count > 0)

  const rest = totalQuestions - distribution.reduce((s, d) => s + d.count, 0)
  if (rest > 0) distribution.push({ label: '기타', count: rest })
  if (distribution.length === 0) distribution.push({ label: '전체 범위', count: totalQuestions })

  return {
    title: `${subjectName} AI 취약영역 모의고사`,
    examModeLabel: 'AI 취약점 집중',
    totalQuestions,
    distribution,
    estimatedMinutes: Math.max(15, Math.round(totalQuestions * 1.8)),
    tokenCost: 3,
    rationale: '최근 오답을 분석하여 구성했어요.',
  }
}
