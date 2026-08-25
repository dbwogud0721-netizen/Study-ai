import { CurriculumSubject, CurriculumUnit, ExamArea, SchoolLevel, Grade } from '../types/curriculum'
import { ELEMENTARY_CURRICULUM, getElementarySubjects } from '../data/curriculum/elementary'
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

export { MIDDLE_SCHOOL_CURRICULUM, HIGH_SCHOOL_CURRICULUM, ELEMENTARY_CURRICULUM, EXAM_SYSTEM_VERSIONS, getExamSystemVersion }

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
  if (schoolLevel === 'elementary') return getElementarySubjects()
  return schoolLevel === 'middle' ? getMiddleSchoolSubjects(grade) : getHighSchoolSubjects(grade)
}

/**
 * Home/Onboarding/새 시험 생성 화면에서 쓰는 핵심 4과목. 학년과 무관하게 항상 이 4개만
 * 노출한다(스펙: "딱 4과목만 표시한다"). 고등학교는 학년마다 수학/과학이 대수·미적분/
 * 물리·화학 등 여러 실제 과목으로 쪼개져 있어 curriculum id가 grade마다 다르므로,
 * core subject는 커리큘럼과 별개인 고정 목록으로 둔다. 실제 세부 과목/단원 매칭은
 * getCoreSubjectUnits(Phase 4, ExamBuilder)에서 처리한다.
 */
export const CORE_SUBJECTS: CurriculumSubject[] = [
  { id: 'kor', name: '국어', icon: '📖', mainSubject: true, units: [] },
  { id: 'eng', name: '영어', icon: '🌎', mainSubject: true, units: [] },
  { id: 'math', name: '수학', icon: '📐', mainSubject: true, units: [] },
  { id: 'sci', name: '과학', icon: '🔬', mainSubject: true, units: [] },
]

export function getCoreSubjects(): CurriculumSubject[] {
  return CORE_SUBJECTS
}

/**
 * 핵심 과목 하나(kor/eng/math/sci)를 골랐을 때, 해당 학교급·학년에서 실제로 존재하는
 * 커리큘럼 과목들을 찾아 "단원" chip으로 쓸 {id,name} 목록을 만든다.
 * - 중/초등, 고1: 보통 과목 id가 그대로 일치 → 그 과목의 실제 단원을 그대로 씀
 * - 고2/고3: 수학/과학은 여러 실제 과목(대수·미적분/물리·화학 등)으로 쪼개져 있어,
 *   그 과목들의 "이름" 자체를 하나의 단원 칩으로 취급한다(스펙 예시: [대수][미적분Ⅰ][확률과 통계]).
 */
export function getCoreSubjectUnits(schoolLevel: SchoolLevel, grade: number, coreId: string): CurriculumUnit[] {
  const all = getCurriculumSubjects(schoolLevel, grade)
  const exact = all.find((s) => s.id === coreId)
  if (exact) return exact.units

  const prefixMap: Record<string, string[]> = {
    kor: ['kor'],
    eng: ['eng'],
    math: ['math'],
    sci: ['sci', 'phy', 'chem', 'bio', 'earth'],
  }
  const prefixes = prefixMap[coreId] ?? [coreId]
  const matches = all.filter((s) => prefixes.some((p) => s.id.startsWith(p)))
  return matches.map((s) => ({ id: s.id, name: s.name }))
}

export interface GradeOption {
  schoolLevel: SchoolLevel
  grade: Grade
  label: string
}

/** 온보딩 PAGE2: 학교급+학년을 한 화면에서 한 번만 묻기 위한 통합 리스트. */
export const GRADE_OPTIONS: GradeOption[] = [
  { schoolLevel: 'elementary', grade: 1, label: '초등학교 6학년' },
  { schoolLevel: 'middle', grade: 1, label: '중학교 1학년' },
  { schoolLevel: 'middle', grade: 2, label: '중학교 2학년' },
  { schoolLevel: 'middle', grade: 3, label: '중학교 3학년' },
  { schoolLevel: 'high', grade: 1, label: '고등학교 1학년' },
  { schoolLevel: 'high', grade: 2, label: '고등학교 2학년' },
  { schoolLevel: 'high', grade: 3, label: '고등학교 3학년' },
]

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
