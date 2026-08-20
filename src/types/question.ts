export type Difficulty = 'easy' | 'medium' | 'hard'
export type SourceType = 'ai_generated' | 'curriculum_based' | 'exam_style' | 'ebs_style'
export type QuestionType = 'multiple_choice' | 'short_answer'

export interface Question {
  questionId: string
  schoolLevel: 'middle' | 'high'
  grade: number
  subject: string
  unit: string
  difficulty: Difficulty
  question: string
  passage?: string
  choices: string[]
  correctAnswer: number
  explanation: string
  concept: string
  estimatedDifficulty: number
  sourceType: SourceType
  createdAt: string
  tags?: string[]
}

export interface ExamSession {
  sessionId: string
  questions: Question[]
  answers: Record<string, number>
  startedAt: string
  submittedAt?: string
  timeLimit: number
}
