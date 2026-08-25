export interface ProblemGenerationRequest {
  subject: string
  count: number
  /** 1~4 */
  difficulty: number
}

export interface ProblemPoolEntry {
  area: string
  combo: string
  formulaArea: string
  problem: string
  formula: string
  unknownCount: number
  conditionBranch: number
  degreeCount: number
  intent: string
  trendArea: string
  trendCombo: string
  solution: string
  /** 5지선다 선택지 내용(①~⑤ 접두는 렌더링 시 붙인다) */
  choices: string[]
  /** 1~5, 1-based */
  answer: number
}

export interface GeneratedProblem extends ProblemPoolEntry {
  id: string
  /** 탭 번호, 1부터 */
  index: number
  difficulty: number
  /** 연산지수 */
  opIndex: number
  /** 생성 시점 기출 유사도(%) — 항상 노출(1.6) */
  similarity: number
  /** 출제 예측 확률(%) */
  predictProb: number
}
