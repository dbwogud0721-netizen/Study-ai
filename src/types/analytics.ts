export type ConfidenceLevel = 'low' | 'medium' | 'high'

/** 표본 크기 기반 신뢰도. <5 부족, 5~9 가능성, 10+ 반복적(섹션 20) */
export interface SampleInfo {
  sampleSize: number
  confidence: ConfidenceLevel
}

export interface AccuracyBucket extends SampleInfo {
  key: string
  label: string
  total: number
  correct: number
  accuracy: number
}

export type AreaAccuracy = AccuracyBucket
export type ConceptAccuracy = AccuracyBucket
export type QuestionTypeAccuracy = AccuracyBucket
export type DifficultyAccuracy = AccuracyBucket

export interface PositionAccuracy extends AccuracyBucket {
  position: number
  /** 해당 위치에 반복 출제된 문항들의 공통 태그(영역/유형/난이도) */
  commonTags: { majorArea?: string; minorArea?: string; difficulty?: string }
}

export interface AnswerChangeStats {
  totalChanges: number
  wrongToCorrect: number
  correctToWrong: number
  wrongToWrong: number
  sampleSize: number
}

export interface TimeManagementStats {
  /** 문항 구간별 평균 풀이시간(초) */
  segments: { label: string; avgSeconds: number }[]
  /** 후반부로 갈수록 느려지는지 여부 */
  slowingDown: boolean
}

export type WeaknessPatternKind =
  | 'CONCEPT_WEAKNESS'
  | 'DIFFICULTY_WEAKNESS'
  | 'TIME_MANAGEMENT'
  | 'RUSHING'
  | 'ANSWER_CHANGE'
  | 'CARELESS_MISTAKE'

export interface WeaknessPattern extends SampleInfo {
  kind: WeaknessPatternKind
  label: string
  accuracy?: number
  detail: string
}

export interface AIInsight {
  headline: string
  /** 섹션 8/28 흐름을 조립한 narrative 문장들 */
  chain: string[]
}

export type AnalysisPeriod = '5' | '10' | '1m' | '3m' | 'all'
