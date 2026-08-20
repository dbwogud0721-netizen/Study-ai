import { Grade, SchoolLevel } from '../types/curriculum'

// 한국 학년도는 3월에 시작한다.
export function currentAcademicYear(today: Date = new Date()): number {
  return today.getMonth() >= 2 ? today.getFullYear() : today.getFullYear() - 1
}

// 고등학교 1학년 입학년도를 학교급/학년으로부터 추정한다.
// 중학생은 고등학교 진학 예정연도를 추정치로 사용한다.
export function estimateEntryYear(schoolLevel: SchoolLevel, grade: Grade, today: Date = new Date()): number {
  const year = currentAcademicYear(today)
  if (schoolLevel === 'high') return year - (grade - 1)
  return year + (3 - grade) + 1
}

// 수능 예상 응시 연도 = 고등학교 입학년도 + 2 (고3이 되는 해)
export function csatYearFromEntryYear(entryYear: number): number {
  return entryYear + 2
}

export function getCsatDday(entryYear: number, today: Date = new Date()): number {
  const csatYear = csatYearFromEntryYear(entryYear)
  const csatDate = new Date(csatYear, 10, 13) // 매년 11월 셋째주 목요일 근사치
  const diffMs = csatDate.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}
