import { Question, QuestionAttempt, WeaknessPattern } from '../../types'
import { joinAttempts, groupAccuracy, confidenceFor } from './shared'

const WEAKNESS_THRESHOLD = 60

/** 같은 중/소영역을 반복해서 틀리는 경우 CONCEPT_WEAKNESS로 등록(섹션 10). sampleSize<5는 제외. */
export function detectRepeatedWeakness(attempts: QuestionAttempt[], questions: Question[]): WeaknessPattern[] {
  const joined = joinAttempts(attempts, questions)
  const byMiddle = groupAccuracy(joined, (j) => j.question.middleArea)
  const byMinor = groupAccuracy(joined, (j) => j.question.minorArea)

  const patterns: WeaknessPattern[] = []
  ;[...byMiddle, ...byMinor].forEach((b) => {
    if (b.sampleSize >= 5 && b.accuracy < WEAKNESS_THRESHOLD) {
      patterns.push({
        kind: 'CONCEPT_WEAKNESS',
        label: b.label,
        accuracy: b.accuracy,
        sampleSize: b.sampleSize,
        confidence: b.confidence,
        detail: `최근 ${b.sampleSize}문제 중 ${b.total - b.correct}문제 오답 (정답률 ${b.accuracy}%)`,
      })
    }
  })
  return patterns.sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100))
}

/** 쉬움/보통은 안정적인데 어려움/최상에서 급락하는 경우 DIFFICULTY_WEAKNESS(섹션 11). */
export function detectDifficultyWeakness(attempts: QuestionAttempt[], questions: Question[]): WeaknessPattern | null {
  const joined = joinAttempts(attempts, questions)
  const easyMedium = joined.filter((j) => j.question.difficulty === 'easy' || j.question.difficulty === 'medium')
  const hardVeryHard = joined.filter((j) => j.question.difficulty === 'hard' || j.question.difficulty === 'veryHard')
  if (easyMedium.length < 5 || hardVeryHard.length < 5) return null

  const acc = (list: typeof joined) => Math.round((list.filter((j) => j.attempt.isCorrect).length / list.length) * 100)
  const easyAcc = acc(easyMedium)
  const hardAcc = acc(hardVeryHard)
  if (easyAcc - hardAcc < 25) return null

  return {
    kind: 'DIFFICULTY_WEAKNESS',
    label: '난이도별 정답률 격차',
    sampleSize: hardVeryHard.length,
    confidence: confidenceFor(hardVeryHard.length),
    detail: `기본 개념 문제(쉬움·보통)는 정답률 ${easyAcc}%로 안정적이지만, 상위 난이도(어려움·최상)에서는 ${hardAcc}%로 점수 손실이 집중되고 있습니다.`,
  }
}
