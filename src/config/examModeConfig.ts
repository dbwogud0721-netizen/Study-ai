import { ExamMode, SchoolLevel } from '../types'

export interface ExamModeDef {
  id: ExamMode
  label: string
  description: string
  icon: string
  defaultQuestionCount: number
  defaultTimeLimitMinutes: number
}

export const MIDDLE_EXAM_MODES: ExamModeDef[] = [
  { id: 'practice_full', label: '실전 테스트', description: '교과 범위 전체를 실제 시험처럼 풀어요', icon: '📝', defaultQuestionCount: 20, defaultTimeLimitMinutes: 40 },
  { id: 'unit_focus', label: '단원 테스트', description: '특정 단원만 집중적으로 평가해요', icon: '🎯', defaultQuestionCount: 10, defaultTimeLimitMinutes: 20 },
  { id: 'weakness_ai', label: 'AI 취약점 테스트', description: 'AI가 정답률 낮은 개념만 골라 출제해요', icon: '🤖', defaultQuestionCount: 20, defaultTimeLimitMinutes: 35 },
  { id: 'random_practice', label: '랜덤 실전', description: '매번 다른 구성의 시험이 새로 생성돼요', icon: '🎲', defaultQuestionCount: 15, defaultTimeLimitMinutes: 30 },
]

export const HIGH_EXAM_MODES: ExamModeDef[] = [
  { id: 'mock_full', label: '전체 모의고사', description: '국어·수학·영어 등 여러 영역을 한 번에 응시해요', icon: '🎯', defaultQuestionCount: 30, defaultTimeLimitMinutes: 60 },
  { id: 'mock_subject', label: '과목별 모의고사', description: 'AI가 매회 새로운 문항으로 구성해요', icon: '📘', defaultQuestionCount: 30, defaultTimeLimitMinutes: 60 },
  { id: 'mock_mini', label: '미니 모의고사', description: '짧은 시간 안에 응시할 수 있어요', icon: '⏱️', defaultQuestionCount: 10, defaultTimeLimitMinutes: 20 },
  { id: 'weakness_ai', label: 'AI 취약점 모의고사', description: '내 데이터 기반으로 출제 비율을 자동 결정해요', icon: '🤖', defaultQuestionCount: 20, defaultTimeLimitMinutes: 40 },
  { id: 'school_prep', label: '내신 대비', description: '과목·학기·단원별로 범위를 직접 설정해요', icon: '📚', defaultQuestionCount: 20, defaultTimeLimitMinutes: 40 },
]

export function getExamModes(schoolLevel: SchoolLevel): ExamModeDef[] {
  return schoolLevel === 'high' ? HIGH_EXAM_MODES : MIDDLE_EXAM_MODES
}

export function getExamModeDef(schoolLevel: SchoolLevel, id: ExamMode): ExamModeDef | undefined {
  return getExamModes(schoolLevel).find((m) => m.id === id)
}

// ── 단순화된 시험 생성 화면(ExamBuilder)에서 쓰는 3개짜리 통합 시험 종류 ──
// 학교급마다 다른 세부 모드 id(practice_full/mock_full 등)를 학생에게 노출하지 않고
// "실전 모의고사" 하나의 라벨로 통일해서 보여준다.
export type UnifiedExamType = 'weakness_ai' | 'unit_focus' | 'real_exam'

export interface UnifiedExamTypeDef {
  id: UnifiedExamType
  label: string
  description: string
  icon: string
}

export const UNIFIED_EXAM_TYPES: UnifiedExamTypeDef[] = [
  { id: 'weakness_ai', label: 'AI 취약점 테스트', description: '내가 자주 틀리는 문제 위주', icon: '🤖' },
  { id: 'unit_focus', label: '단원 테스트', description: '선택한 단원을 집중적으로', icon: '📚' },
  { id: 'real_exam', label: '실전 모의고사', description: '실제 시험처럼 구성', icon: '🏆' },
]

export function mapUnifiedExamType(schoolLevel: SchoolLevel, id: UnifiedExamType): ExamMode {
  if (id === 'real_exam') return schoolLevel === 'high' ? 'mock_full' : 'practice_full'
  return id
}
