import { Question } from './question'
import { SchoolLevel } from './curriculum'
import { QuestionAttempt } from './attempt'

export type ExamMode =
  | 'practice_full'
  | 'unit_focus'
  | 'weakness_ai'
  | 'random_practice'
  | 'mock_full'
  | 'mock_subject'
  | 'mock_mini'
  | 'school_prep'

/** 전체/영역별/취약점/미니/연습 시험 구분 (섹션 23) */
export type ExamType = 'FULL_MOCK' | 'AREA_MOCK' | 'WEAKNESS_MOCK' | 'MINI_MOCK' | 'PRACTICE'

export interface ExamConfig {
  schoolLevel: SchoolLevel
  grade: number
  examMode: ExamMode
  examType: ExamType
  subject: string
  subjectName: string
  unit?: string
  unitName?: string
  /** taxonomy 기반 영역별/취약점 시험용 (majorArea/middleArea/minorArea 매칭) */
  targetMajorArea?: string
  targetMiddleArea?: string
  targetMinorArea?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  questionCount: number
  timeLimitMinutes: number
  /** 학생이 직접 설정하는 목표 점수. 실제 점수가 이보다 높으면 토큰 보너스가 지급된다. */
  targetScore?: number
  /** 문제 스타일: 다양하게(여러 유형 섞기) / 비슷하게(선택 유형 반복) */
  similarity?: 'DIVERSE' | 'SIMILAR'
}

export interface BlueprintItem {
  label: string
  count: number
  /** 취약영역 시험의 목표 정답률 표시용 (섹션 16: "61% → 70%") */
  targetAccuracyBefore?: number
  targetAccuracyAfter?: number
}

export interface ExamBlueprint {
  title: string
  examModeLabel: string
  totalQuestions: number
  distribution: BlueprintItem[]
  estimatedMinutes: number
  tokenCost: number
  /** AI 추천 시험 구성 사유 ("최근 오답을 분석하여 구성했어요") */
  rationale?: string
}

export interface ExamResult {
  examId: string
  userId: string
  config: ExamConfig
  examType: ExamType
  questions: Question[]
  answers: Record<string, number>
  /** 문항별 행동 데이터(응답시간/답변경/최초선택 등) — 섹션 5 */
  attempts: QuestionAttempt[]
  score: number
  correctCount: number
  wrongCount: number
  tokensEarned: number
  tokensSpent: number
  completedAt: string
  duration: number
  conceptAnalysis: ConceptAnalysis[]
  previousScore?: number
  scoreDelta?: number
  flaggedQuestionIds?: string[]
  /** 목표 점수 달성 보너스 (섹션: 목표점수 초과 시 ₩5,000 상당 토큰 지급) */
  targetScore?: number
  targetScoreMet?: boolean
  targetScoreBonusTokens?: number
}

export interface ConceptAnalysis {
  concept: string
  total: number
  correct: number
  accuracy: number
}

export interface ExamHistory {
  examId: string
  date: string
  subject: string
  unit: string
  score: number
  questionCount: number
  tokensEarned: number
  duration: number
}
