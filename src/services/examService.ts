import { ExamResult, ExamConfig, Question, QuestionAttempt } from '../types'
import { analyzeWeakness } from './aiService'
import { calculateReward } from './tokenService'
import { buildMockKoreanHistory } from '../data/mockAttemptHistory'
import { TARGET_SCORE_BONUS } from '../config/tokenConfig'

const STORAGE_KEY = 'studyai_exam_history'

export async function buildExamResult(
  config: ExamConfig,
  questions: Question[],
  answers: Record<string, number>,
  userId: string,
  duration: number,
  flaggedQuestionIds: string[] = [],
  attempts: QuestionAttempt[] = []
): Promise<ExamResult> {
  let correct = 0
  questions.forEach((q) => {
    if (answers[q.questionId] === q.correctAnswer) correct++
  })
  const score = Math.round((correct / questions.length) * 100)
  const conceptAnalysis = await analyzeWeakness(questions, answers)
  const tokensEarned = calculateReward(score)
  const previousScore = getPreviousScore(userId, config.subjectName)
  const examId = `exam_${Date.now()}`

  const targetScoreMet = config.targetScore !== undefined && score > config.targetScore
  const targetScoreBonusTokens = targetScoreMet ? TARGET_SCORE_BONUS.tokens : 0

  const result: ExamResult = {
    examId,
    userId,
    config,
    examType: config.examType,
    questions,
    answers,
    attempts: attempts.map((a) => ({ ...a, examId })),
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
    targetScore: config.targetScore,
    targetScoreMet,
    targetScoreBonusTokens,
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

export function getExamHistory(userId?: string): ExamResult[] {
  try {
    const all: ExamResult[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return userId ? all.filter((r) => r.userId === userId) : all
  } catch {
    return []
  }
}

export function getExamResultById(examId: string): ExamResult | undefined {
  return getExamHistory().find((r) => r.examId === examId)
}

/** 최초 진입 시 국어 성적 데모 데이터가 없으면 검수용 Student A 시나리오를 심는다(섹션 29). */
export function seedDemoHistoryIfEmpty(userId: string): void {
  const existing = getExamHistory(userId)
  if (existing.length > 0) return
  const seeded = buildMockKoreanHistory(userId)
  try {
    const all: ExamResult[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seeded, ...all].slice(0, 50)))
  } catch {
    // ignore
  }
}
