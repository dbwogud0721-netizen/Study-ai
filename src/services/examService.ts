import { ExamResult, ExamConfig, Question } from '../types'
import { analyzeWeakness } from './aiService'
import { calculateReward } from './tokenService'

const STORAGE_KEY = 'studyai_exam_history'

export async function buildExamResult(
  config: ExamConfig,
  questions: Question[],
  answers: Record<string, number>,
  userId: string,
  duration: number,
  flaggedQuestionIds: string[] = []
): Promise<ExamResult> {
  let correct = 0
  questions.forEach((q) => {
    if (answers[q.questionId] === q.correctAnswer) correct++
  })
  const score = Math.round((correct / questions.length) * 100)
  const conceptAnalysis = await analyzeWeakness(questions, answers)
  const tokensEarned = calculateReward(score)
  const previousScore = getPreviousScore(userId, config.subjectName)

  const result: ExamResult = {
    examId: `exam_${Date.now()}`,
    userId,
    config,
    questions,
    answers,
    score,
    correctCount: correct,
    wrongCount: questions.length - correct,
    tokensEarned,
    tokensSpent: 0,
    completedAt: new Date().toISOString(),
    duration,
    conceptAnalysis,
    previousScore,
    scoreDelta: previousScore !== undefined ? score - previousScore : undefined,
    flaggedQuestionIds,
  }

  saveExamResult(result)
  return result
}

function getPreviousScore(userId: string, subjectName: string): number | undefined {
  const history = getExamHistory().filter((r) => r.userId === userId && r.config.subjectName === subjectName)
  return history[0]?.score
}

function saveExamResult(result: ExamResult): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    existing.unshift(result)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)))
  } catch {
    // ignore
  }
}

export function getExamHistory(): ExamResult[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
