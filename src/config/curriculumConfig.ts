import { CurriculumSubject, CurriculumUnit, ExamArea, SchoolLevel } from '../types/curriculum'
import { MIDDLE_SCHOOL_CURRICULUM, getMiddleSchoolSubjects } from '../data/curriculum/middleSchool'
import { HIGH_SCHOOL_CURRICULUM, getHighSchoolSubjects } from '../data/curriculum/highSchool'
import { EXAM_SYSTEM_VERSIONS, getExamSystemVersion } from '../data/curriculum/examSystem'
import { TaxonomyMajorArea } from '../data/curriculum/taxonomyTypes'
import { KOREAN_TAXONOMY } from '../data/curriculum/koreanTaxonomy'
import { MATH_TAXONOMY } from '../data/curriculum/mathTaxonomy'
import { SCIENCE_TAXONOMY } from '../data/curriculum/scienceTaxonomy'
import {
  KOREAN_FULL_MOCK_BLUEPRINT,
  KOREAN_FULL_MOCK_TOTAL,
  KOREAN_FULL_MOCK_TIME_MINUTES,
  KOREAN_AREA_MOCK_DEFAULTS,
} from '../data/examBlueprints/koreanCsat'

export { MIDDLE_SCHOOL_CURRICULUM, HIGH_SCHOOL_CURRICULUM, EXAM_SYSTEM_VERSIONS, getExamSystemVersion }

/** taxonomy 트리가 등록된 과목 이름(subjectName 기준). 등록 안 된 과목은 기존 단순 플로우로 폴백. */
const SUBJECT_TAXONOMIES: Record<string, TaxonomyMajorArea[]> = {
  국어: KOREAN_TAXONOMY,
  수학: MATH_TAXONOMY,
  과학: SCIENCE_TAXONOMY,
}

export function getSubjectTaxonomy(subjectName: string): TaxonomyMajorArea[] | undefined {
  return SUBJECT_TAXONOMIES[subjectName]
}

export function hasSubjectTaxonomy(subjectName: string): boolean {
  return subjectName in SUBJECT_TAXONOMIES
}

/** 과목+수능체계별 FULL_MOCK 구성. 현재는 국어만 정의(레퍼런스 구현), 나머지는 undefined. */
export function getFullMockBlueprint(subjectName: string) {
  if (subjectName === '국어') {
    return { distribution: KOREAN_FULL_MOCK_BLUEPRINT, totalQuestions: KOREAN_FULL_MOCK_TOTAL, timeLimitMinutes: KOREAN_FULL_MOCK_TIME_MINUTES }
  }
  return undefined
}

export function getAreaMockDefaults(subjectName: string, majorAreaId: string) {
  if (subjectName === '국어') return KOREAN_AREA_MOCK_DEFAULTS[majorAreaId]
  return undefined
}

export interface OfficialMockSpec {
  questionCount: number
  timeLimitMinutes: number
}

/** 실제 수능/모의고사(3·6·9월 학평·모평) 과목별 고정 문항수·시간. "모의고사"는 슬라이더로
 * 고를 값이 아니라 실제 시험과 동일한 값이어야 하므로, 모의고사 계열 모드는 이 값을 그대로 쓴다. */
const OFFICIAL_MOCK_SPEC: Record<string, OfficialMockSpec> = {
  국어: { questionCount: 45, timeLimitMinutes: 80 },
  수학: { questionCount: 30, timeLimitMinutes: 100 },
  영어: { questionCount: 45, timeLimitMinutes: 70 },
  한국사: { questionCount: 20, timeLimitMinutes: 30 },
}

export function getOfficialMockSpec(subjectName: string): OfficialMockSpec {
  if (OFFICIAL_MOCK_SPEC[subjectName]) return OFFICIAL_MOCK_SPEC[subjectName]
  if (subjectName.startsWith('탐구')) return { questionCount: 20, timeLimitMinutes: 30 }
  return { questionCount: 20, timeLimitMinutes: 40 }
}

export const CURRENT_CURRICULUM_VERSION = '2022개정'

export function getCurriculumSubjects(schoolLevel: SchoolLevel, grade: number): CurriculumSubject[] {
  return schoolLevel === 'middle' ? getMiddleSchoolSubjects(grade) : getHighSchoolSubjects(grade)
}

export function getCurriculumSubject(schoolLevel: SchoolLevel, grade: number, subjectId: string): CurriculumSubject | undefined {
  return getCurriculumSubjects(schoolLevel, grade).find((s) => s.id === subjectId)
}

export function getUnits(schoolLevel: SchoolLevel, grade: number, subjectId: string): CurriculumUnit[] {
  return getCurriculumSubject(schoolLevel, grade, subjectId)?.units ?? []
}

export function getExamAreas(entryYear: number): ExamArea[] {
  return getExamSystemVersion(entryYear).areas
}

export const DIFFICULTIES = [
  { id: 'easy', label: '하 (쉬움)', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'medium', label: '중 (보통)', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'hard', label: '상 (어려움)', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'mixed', label: '혼합', color: 'text-primary-600', bg: 'bg-primary-50' },
] as const

export const QUESTION_COUNTS = [10, 20, 30] as const
