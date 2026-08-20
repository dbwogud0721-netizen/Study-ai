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
  return schoolLevel === 'middle' ? MIDDLE_EXAM_MODES : HIGH_EXAM_MODES
}

export function getExamModeDef(schoolLevel: SchoolLevel, id: ExamMode): ExamModeDef | undefined {
  return getExamModes(schoolLevel).find((m) => m.id === id)
}
