export type Difficulty = 'easy' | 'medium' | 'hard' | 'veryHard'
export type SourceType = 'ai_generated' | 'curriculum_based' | 'exam_style' | 'ebs_style'
/** @deprecated 자유 문자열 `Question.questionType`으로 대체됨(세분 유형을 감당하기 위함) */
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

  // --- 수능형 다단계 분석용 확장 필드 (모두 optional, 내신형 문항은 비워둠) ---
  /** 예: '2022개정' */
  curriculumVersion?: string
  /** 예: 'v2022_revised' (ExamSystemVersion.id) */
  examSystem?: string
  /** 대영역. 국어: 문학/독서/언어와매체/화법과작문. 수학: 대수/미적분Ⅰ 등 */
  majorArea?: string
  /** 중영역. 문학: 현대시/현대소설/고전시가/고전소설/극·수필. 독서: 제재(인문/과학 등) */
  middleArea?: string
  /** 소영역/세부유형. 표현법/보기 적용/내용 일치 등 */
  minorArea?: string
  /** 독서 지문 제재. 인문/철학/사회/법/경제/과학/기술/융합 */
  passageType?: string
  /** 세부 문제 유형(자유 문자열). 중심 내용/보기 적용/추론 등 */
  questionType: string
  /** 기출 기준 예상 정답률(0~100) */
  expectedCorrectRate?: number
  /** 실제 모의고사에서의 문항 번호(1부터). 위치별 취약점 분석용 */
  questionPosition?: number
  /** 배점 */
  score?: number
}

export interface ExamSession {
  sessionId: string
  questions: Question[]
  answers: Record<string, number>
  startedAt: string
  submittedAt?: string
  timeLimit: number
}
