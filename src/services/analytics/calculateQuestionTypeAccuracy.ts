import { Question, QuestionAttempt, QuestionTypeAccuracy } from '../../types'
import { joinAttempts, groupAccuracy } from './shared'

/** 소영역/문제유형(minorArea, 없으면 questionType) 정답률. majorArea/middleArea로 좁힐 수 있다. */
export function calculateQuestionTypeAccuracy(
  attempts: QuestionAttempt[],
  questions: Question[],
  filter?: { majorArea?: string; middleArea?: string }
): QuestionTypeAccuracy[] {
  const joined = joinAttempts(attempts, questions).filter(
    (j) => (!filter?.majorArea || j.question.majorArea === filter.majorArea) && (!filter?.middleArea || j.question.middleArea === filter.middleArea)
  )
  return groupAccuracy(joined, (j) => j.question.minorArea || j.question.questionType)
}
