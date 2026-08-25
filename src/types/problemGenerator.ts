export interface ProblemGenerationRequest {
  subject: string
  count: number
  /** 1(쉬움) ~ 5(최상) */
  difficulty: number
}

export interface GeneratedProblemSection {
  /** '1.1', '1.2' ... */
  code: string
  label: string
  content: string
}

export interface PastExamSimilarity {
  examName: string
  /** 0~100 */
  similarity: number
}

export interface GeneratedProblem {
  id: string
  /** 탭 번호, 1부터 */
  index: number
  sections: GeneratedProblemSection[]
  solution: string
  answer: string
  similarities: PastExamSimilarity[]
}
