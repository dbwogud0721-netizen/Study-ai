export interface QuestionAttempt {
  id: string
  userId: string
  examId: string
  questionId: string

  selectedAnswer: number
  firstSelectedAnswer?: number
  correctAnswer: number
  isCorrect: boolean

  responseTimeSeconds: number
  answerChangeCount: number
  flagged: boolean

  questionPosition: number
  answeredAt: string
}
