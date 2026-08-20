import { Question, QuestionAttempt, AreaAccuracy } from '../../types'
import { joinAttempts, groupAccuracy } from './shared'

/** 대영역(majorArea) 정답률. 정답률 낮은 순 정렬 — [0]이 "가장 취약한 영역". */
export function calculateAreaAccuracy(attempts: QuestionAttempt[], questions: Question[]): AreaAccuracy[] {
  const joined = joinAttempts(attempts, questions)
  return groupAccuracy(joined, (j) => j.question.majorArea)
}
