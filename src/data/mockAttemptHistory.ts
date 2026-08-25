import { ExamResult, ExamConfig, Question, QuestionAttempt, ConceptAnalysis, Difficulty } from '../types'
import { KOREAN_QUESTION_BANK } from './generated/koreanQuestionBank'
import { calculateScoreReward } from '../config/tokenConfig'

/**
 * 검수용 "Student A" 시나리오(섹션 29): 국어 문학 취약, 고전시가 ~38%, 보기 적용 ~43%,
 * 29번 위치 ~31%, 어려운 문제 ~42%, 정답→오답 답변경 다수, 후반부 풀이시간 증가.
 * 결정적 시드 기반이라 새로고침해도 같은 패턴을 재현한다.
 */

function mulberry32(seed: number) {
  let s = seed
  return function random() {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Slot {
  majorArea: string
  middleArea: string
  minorArea: string
  difficulty: Difficulty
  answerChange?: 'correct_to_wrong' | 'wrong_to_correct'
}

const READING_MIDDLE = ['인문', '철학', '사회', '법', '경제', '과학', '기술', '융합']
const READING_TYPES = ['중심 내용', '내용 일치', '내용 불일치', '세부 정보', '추론', '사례 적용', '보기 적용', '개념 관계', '논증 구조', '자료 해석', '어휘']

function buildReadingSlots(): Slot[] {
  return Array.from({ length: 17 }, (_, i) => {
    const middleArea = READING_MIDDLE[i % READING_MIDDLE.length]
    const minorArea = READING_TYPES[i % READING_TYPES.length]
    const difficulty: Difficulty = i % 4 === 3 ? 'hard' : i % 4 === 0 ? 'easy' : 'medium'
    const answerChange = i === 5 ? 'wrong_to_correct' : undefined
    return { majorArea: '독서', middleArea, minorArea, difficulty, answerChange }
  })
}

/** idx11 → position 18+11=29. 문학/보기 적용/어려움 조합으로 고정(섹션 9 검수 포인트). */
const LITERATURE_SLOTS: Slot[] = [
  { majorArea: '문학', middleArea: '현대시', minorArea: '화자/정서', difficulty: 'easy' },
  { majorArea: '문학', middleArea: '현대시', minorArea: '표현법', difficulty: 'medium', answerChange: 'correct_to_wrong' },
  { majorArea: '문학', middleArea: '현대시', minorArea: '보기 적용', difficulty: 'medium' },
  { majorArea: '문학', middleArea: '현대시', minorArea: '표현법', difficulty: 'medium' },
  { majorArea: '문학', middleArea: '고전시가', minorArea: '고어 해석', difficulty: 'hard' },
  { majorArea: '문학', middleArea: '고전시가', minorArea: '보기 적용', difficulty: 'veryHard' },
  { majorArea: '문학', middleArea: '고전시가', minorArea: '작품 이해', difficulty: 'hard' },
  { majorArea: '문학', middleArea: '고전시가', minorArea: '표현법', difficulty: 'hard' },
  { majorArea: '문학', middleArea: '현대소설', minorArea: '인물', difficulty: 'medium' },
  { majorArea: '문학', middleArea: '현대소설', minorArea: '갈등', difficulty: 'medium' },
  { majorArea: '문학', middleArea: '현대소설', minorArea: '보기 적용', difficulty: 'hard' },
  { majorArea: '문학', middleArea: '고전소설', minorArea: '보기 적용', difficulty: 'hard' }, // position 29 — 확률 오버라이드는 buildOneExam에서 처리(답변경과 중복 적용 금지)
  { majorArea: '문학', middleArea: '고전소설', minorArea: '사건 전개', difficulty: 'medium' },
  { majorArea: '문학', middleArea: '고전소설', minorArea: '인물 관계', difficulty: 'hard' },
  { majorArea: '문학', middleArea: '극/수필', minorArea: '인물', difficulty: 'medium' },
  { majorArea: '문학', middleArea: '극/수필', minorArea: '보기 적용', difficulty: 'medium' },
  { majorArea: '문학', middleArea: '극/수필', minorArea: '표현법', difficulty: 'easy' },
]

const LANG_MEDIA_SLOTS: Slot[] = [
  { majorArea: '언어와 매체', middleArea: '음운', minorArea: '음운 변동', difficulty: 'easy' },
  { majorArea: '언어와 매체', middleArea: '단어', minorArea: '품사', difficulty: 'medium' },
  { majorArea: '언어와 매체', middleArea: '문장', minorArea: '문장 성분', difficulty: 'easy' },
  { majorArea: '언어와 매체', middleArea: '매체', minorArea: '매체 자료 해석', difficulty: 'medium' },
  { majorArea: '언어와 매체', middleArea: '음운', minorArea: '표준 발음', difficulty: 'easy' },
  { majorArea: '언어와 매체', middleArea: '단어', minorArea: '단어 형성', difficulty: 'medium' },
  { majorArea: '언어와 매체', middleArea: '문장', minorArea: '높임법', difficulty: 'easy' },
]

const SPEECH_WRITING_SLOTS: Slot[] = [
  { majorArea: '화법과 작문', middleArea: '화법', minorArea: '대화/발표', difficulty: 'easy' },
  { majorArea: '화법과 작문', middleArea: '화법', minorArea: '토론/협상', difficulty: 'easy' },
  { majorArea: '화법과 작문', middleArea: '작문', minorArea: '개요/초고', difficulty: 'medium' },
  { majorArea: '화법과 작문', middleArea: '작문', minorArea: '고쳐쓰기', difficulty: 'easy' },
]

const ALL_SLOTS: Slot[] = [...buildReadingSlots(), ...LITERATURE_SLOTS, ...LANG_MEDIA_SLOTS, ...SPEECH_WRITING_SLOTS]

const DIFFICULTY_BASE: Record<Difficulty, number> = { easy: 88, medium: 72, hard: 52, veryHard: 33 }
const MAJOR_AREA_MULTIPLIER: Record<string, number> = {
  독서: 1.06,
  문학: 0.94,
  '언어와 매체': 1.01,
  '화법과 작문': 1.05,
}
const RESPONSE_BASE: Record<Difficulty, number> = { easy: 50, medium: 80, hard: 130, veryHard: 170 }

function pickQuestion(slot: Slot, rand: () => number): Question {
  const exact = KOREAN_QUESTION_BANK.filter(
    (q) => q.majorArea === slot.majorArea && q.middleArea === slot.middleArea && q.minorArea === slot.minorArea
  )
  const pool = exact.length > 0 ? exact : KOREAN_QUESTION_BANK.filter((q) => q.majorArea === slot.majorArea && q.middleArea === slot.middleArea)
  const finalPool = pool.length > 0 ? pool : KOREAN_QUESTION_BANK.filter((q) => q.majorArea === slot.majorArea)
  return finalPool[Math.floor(rand() * finalPool.length)] ?? KOREAN_QUESTION_BANK[0]
}

function timeMultiplierForPosition(position: number): number {
  if (position <= 17) return 1.0
  if (position <= 34) return 1.6
  return 2.05
}

function buildOneExam(userId: string, examIndex: number, daysAgo: number): ExamResult {
  const rand = mulberry32(1000 + examIndex * 97)
  const questions: Question[] = []
  const answers: Record<string, number> = {}
  const attempts: QuestionAttempt[] = []

  ALL_SLOTS.forEach((slot, i) => {
    const position = i + 1
    const q = pickQuestion(slot, rand)
    // 같은 exam 안에서 questionId가 겹치면 안 되므로(Navigator key 충돌 방지) position을 접미사로 붙인다
    const question: Question = { ...q, questionId: `${q.questionId}_p${position}_e${examIndex}` }
    questions.push(question)

    let prob = (DIFFICULTY_BASE[slot.difficulty] * (MAJOR_AREA_MULTIPLIER[slot.majorArea] ?? 1)) / 100
    if (slot.minorArea === '보기 적용') prob *= 0.72
    if (position === 29) prob = 0.31
    prob = Math.min(0.97, Math.max(0.05, prob))

    let isCorrect = rand() < prob
    let selectedAnswer = isCorrect ? question.correctAnswer : (question.correctAnswer + 1) % question.choices.length
    let firstSelectedAnswer: number | undefined
    let answerChangeCount = 0

    if (slot.answerChange === 'correct_to_wrong') {
      firstSelectedAnswer = question.correctAnswer
      selectedAnswer = (question.correctAnswer + 1) % question.choices.length
      isCorrect = false
      answerChangeCount = 1
    } else if (slot.answerChange === 'wrong_to_correct') {
      firstSelectedAnswer = (question.correctAnswer + 1) % question.choices.length
      selectedAnswer = question.correctAnswer
      isCorrect = true
      answerChangeCount = 1
    }

    answers[question.questionId] = selectedAnswer

    const jitter = 0.8 + rand() * 0.5
    const responseTimeSeconds = Math.round(RESPONSE_BASE[slot.difficulty] * timeMultiplierForPosition(position) * jitter)
    const flagged = slot.difficulty !== 'easy' && rand() < 0.08

    attempts.push({
      id: `att_${examIndex}_${position}`,
      userId,
      examId: `exam_seed_${examIndex}`,
      questionId: question.questionId,
      selectedAnswer,
      firstSelectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      responseTimeSeconds,
      answerChangeCount,
      flagged,
      questionPosition: position,
      answeredAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    })
  })

  const correctCount = attempts.filter((a) => a.isCorrect).length
  const score = Math.round((correctCount / attempts.length) * 100)
  const duration = attempts.reduce((sum, a) => sum + a.responseTimeSeconds, 0)

  const conceptMap: Record<string, { total: number; correct: number }> = {}
  questions.forEach((q) => {
    if (!conceptMap[q.concept]) conceptMap[q.concept] = { total: 0, correct: 0 }
    conceptMap[q.concept].total++
    if (answers[q.questionId] === q.correctAnswer) conceptMap[q.concept].correct++
  })
  const conceptAnalysis: ConceptAnalysis[] = Object.entries(conceptMap).map(([concept, d]) => ({
    concept,
    total: d.total,
    correct: d.correct,
    accuracy: Math.round((d.correct / d.total) * 100),
  }))

  const config: ExamConfig = {
    schoolLevel: 'high',
    grade: 2,
    examMode: 'mock_full',
    examType: 'FULL_MOCK',
    subject: '국어',
    subjectName: '국어',
    difficulty: 'mixed',
    questionCount: attempts.length,
    timeLimitMinutes: 80,
  }

  return {
    examId: `exam_seed_${examIndex}`,
    userId,
    config,
    examType: 'FULL_MOCK',
    questions,
    answers,
    attempts,
    score,
    correctCount,
    wrongCount: attempts.length - correctCount,
    tokensEarned: calculateScoreReward(score),
    tokensSpent: 0,
    completedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    duration,
    conceptAnalysis,
  }
}

/** 최근 10회, 최신이 배열 맨 앞(index 0)에 오도록 반환한다 — examService.saveExamResult의 unshift 관례와 동일. */
export function buildMockKoreanHistory(userId: string): ExamResult[] {
  const exams = Array.from({ length: 10 }, (_, k) => buildOneExam(userId, k, k * 6))
  return exams // k=0(daysAgo0)이 이미 배열 맨 앞
}
