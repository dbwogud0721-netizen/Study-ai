import { Question, QuestionAttempt, ConceptAccuracy } from '../../types'
import { joinAttempts, groupAccuracy } from './shared'

/** 중영역(middleArea) 정답률. majorArea로 좁혀서 드릴다운(예: 문학 → 현대시/고전시가/...). */
export function calculateConceptAccuracy(attempts: QuestionAttempt[], questions: Question[], majorArea?: string): ConceptAccuracy[] {
  const joined = joinAttempts(attempts, questions).filter((j) => !majorArea || j.question.majorArea === majorArea)
  return groupAccuracy(joined, (j) => j.question.middleArea)
}
