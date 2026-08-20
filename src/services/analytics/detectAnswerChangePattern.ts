import { QuestionAttempt, AnswerChangeStats, WeaknessPattern } from '../../types'
import { confidenceFor } from './shared'

/** 답 변경 패턴 집계(섹션 12): 오답→정답 / 정답→오답 / 오답→오답. */
export function detectAnswerChangePattern(attempts: QuestionAttempt[]): AnswerChangeStats {
  const changed = attempts.filter((a) => a.answerChangeCount > 0 && a.firstSelectedAnswer !== undefined)
  let wrongToCorrect = 0
  let correctToWrong = 0
  let wrongToWrong = 0

  changed.forEach((a) => {
    const firstCorrect = a.firstSelectedAnswer === a.correctAnswer
    if (!firstCorrect && a.isCorrect) wrongToCorrect++
    else if (firstCorrect && !a.isCorrect) correctToWrong++
    else if (!firstCorrect && !a.isCorrect) wrongToWrong++
  })

  return { totalChanges: changed.length, wrongToCorrect, correctToWrong, wrongToWrong, sampleSize: changed.length }
}

/** 정답→오답 답변경이 반복되면 ANSWER_CHANGE 취약 패턴으로 등록. */
export function detectAnswerChangeWeakness(attempts: QuestionAttempt[]): WeaknessPattern | null {
  const stats = detectAnswerChangePattern(attempts)
  if (stats.sampleSize < 5 || stats.correctToWrong <= stats.wrongToCorrect) return null

  return {
    kind: 'ANSWER_CHANGE',
    label: '답 변경',
    sampleSize: stats.sampleSize,
    confidence: confidenceFor(stats.sampleSize),
    detail: `최근 답을 변경한 ${stats.sampleSize}문제 중 정답→오답이 ${stats.correctToWrong}회로 오답→정답(${stats.wrongToCorrect}회)보다 많습니다. 답을 변경했을 때 오히려 정답률이 낮아지는 경향이 있습니다.`,
  }
}
