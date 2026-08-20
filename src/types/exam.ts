import { Question } from './question'
import { SchoolLevel } from './curriculum'

export type ExamMode =
  | 'practice_full'
  | 'unit_focus'
  | 'weakness_ai'
  | 'random_practice'
  | 'mock_full'
  | 'mock_subject'
  | 'mock_mini'
  | 'school_prep'

export interface ExamConfig {
  schoolLevel: SchoolLevel
  grade: number
  examMode: ExamMode
  subject: string
  subjectName: string
  unit?: string
  unitName?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  questionCount: number
  timeLimitMinutes: number
}

export interface BlueprintItem {
  label: string
  count: number
}

export interface ExamBlueprint {
  title: string
  examModeLabel: string
  totalQuestions: number
  distribution: BlueprintItem[]
  estimatedMinutes: number
  tokenCost: number
}

export interface ExamResult {
  examId: string
  userId: string
  config: ExamConfig
  questions: Question[]
  answers: Record<string, number>
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
